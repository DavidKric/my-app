import handler from '../process-pdf'; // The handler from your API route
import formidable from 'formidable';
import fs from 'fs';
import { Readable } from 'stream'; // Import Readable
import { createMocks } from 'node-mocks-http'; // To mock req/res objects

// Mock formidable
jest.mock('formidable', () => {
  const actualFormidable = jest.requireActual('formidable');
  // We need to be able to mock the specific 'parse' method on an instance
  const formInstance = {
    parse: jest.fn(),
  };
  // The default export of formidable is a function that returns an instance
  return jest.fn(() => formInstance);
});

// Mock fs.createReadStream
jest.mock('fs', () => ({
  ...jest.requireActual('fs'), // Import and retain default behavior
  createReadStream: jest.fn().mockImplementation((path) => {
    const readable = new Readable();
    readable._read = () => {}; // Noop _read
    // Simulate a stream that ends immediately. Push data if actual content matters for a test.
    process.nextTick(() => { // Use process.nextTick for wider compatibility in test env
      readable.push(null); // Signal EOF
    });
    return readable;
  }),
}));

// Global fetch mock - this will be overridden in specific tests
global.fetch = jest.fn();

describe('/api/process-pdf API Endpoint', () => {
  let mockFormParse;

  beforeEach(() => {
    // Reset mocks for each test
    jest.clearAllMocks();

    // Get a reference to the mock parse method for formidable instance
    // This relies on the structure of the mock defined above
    const form = formidable(); // This gives us our mocked instance
    mockFormParse = form.parse;
  });

  const mockNextJsResponse = (res) => {
    // Attach a dummy .send method if not present, for cases where it might be called by Next.js internals
    // or if a test incorrectly expects it instead of .json or .end
    if (!res.send) {
      res.send = jest.fn().mockReturnThis();
    }
    return res;
  };

  test('should return 400 if no PDF file is uploaded', async () => {
    mockFormParse.mockResolvedValue([{}, { pdfFile: undefined }]); // No file provided

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'content-type': 'multipart/form-data; boundary=---testboundary',
      },
    });

    await handler(req, mockNextJsResponse(res));

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'No PDF file uploaded. Make sure the field name is "pdfFile".',
    });
  });

  test('should successfully process a PDF and return text content', async () => {
    const mockPdfFile = {
      filepath: '/tmp/fakefile.pdf',
      originalFilename: 'test.pdf',
      mimetype: 'application/pdf',
    };
    mockFormParse.mockResolvedValue([{}, { pdfFile: [mockPdfFile] }]);

    const mockDoclingResponse = {
      status: 'success',
      document: {
        text_content: 'This is the extracted text.',
        json_content: { page_count: 1 },
      },
      errors: null,
    };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockDoclingResponse,
      status: 200,
    });

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'content-type': 'multipart/form-data; boundary=---testboundary',
      },
    });

    await handler(req, mockNextJsResponse(res));

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'File processed successfully by Docling-Serve.',
      doclingStatus: 'success',
      textContent: 'This is the extracted text.',
      jsonContentStructureAnalysis: 'json_content received and logged for structural analysis.',
      doclingErrors: null,
    });
    expect(fs.createReadStream).toHaveBeenCalledWith(mockPdfFile.filepath);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    // More detailed check for FormData can be added if needed
  });

  test('should return 500 if fetch to Docling-Serve fails (network error)', async () => {
    const mockPdfFile = { filepath: '/tmp/fake.pdf', originalFilename: 'test.pdf' };
    mockFormParse.mockResolvedValue([{}, { pdfFile: [mockPdfFile] }]);

    global.fetch.mockRejectedValueOnce(new Error('Network failure'));

    const { req, res } = createMocks({ method: 'POST' });
    await handler(req, mockNextJsResponse(res));

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Failed to send file to Docling-Serve.',
      error: 'Network failure',
    });
  });

  test('should return Docling-Serve status if it returns non-200', async () => {
    const mockPdfFile = { filepath: '/tmp/fake.pdf', originalFilename: 'test.pdf' };
    mockFormParse.mockResolvedValue([{}, { pdfFile: [mockPdfFile] }]);

    const errorDetails = 'Docling internal server error';
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => errorDetails, // Changed from json to text as per API code
    });

    const { req, res } = createMocks({ method: 'POST' });
    await handler(req, mockNextJsResponse(res));

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Error from Docling-Serve.',
      details: errorDetails,
    });
  });

  test('should return 502 if Docling-Serve processing status is "failure"', async () => {
    const mockPdfFile = { filepath: '/tmp/fake.pdf', originalFilename: 'test.pdf' };
    mockFormParse.mockResolvedValue([{}, { pdfFile: [mockPdfFile] }]);

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        status: 'failure',
        errors: ['OCR failed', 'Content extraction failed'],
      }),
    });

    const { req, res } = createMocks({ method: 'POST' });
    await handler(req, mockNextJsResponse(res));

    expect(res._getStatusCode()).toBe(502);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Docling-Serve processing failed.',
      doclingStatus: 'failure',
      doclingErrors: ['OCR failed', 'Content extraction failed'],
    });
  });

  test('should return 502 if Docling-Serve response has unexpected structure (missing document)', async () => {
    const mockPdfFile = { filepath: '/tmp/fake.pdf', originalFilename: 'test.pdf' };
    mockFormParse.mockResolvedValue([{}, { pdfFile: [mockPdfFile] }]);

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        status: 'success',
        // document is missing
      }),
    });

    const { req, res } = createMocks({ method: 'POST' });
    await handler(req, mockNextJsResponse(res));

    expect(res._getStatusCode()).toBe(502);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Unexpected response structure from Docling-Serve. Missing document or text_content.',
    });
  });

  test('should return 502 if Docling-Serve response has unexpected structure (missing text_content)', async () => {
    const mockPdfFile = { filepath: '/tmp/fake.pdf', originalFilename: 'test.pdf' };
    mockFormParse.mockResolvedValue([{}, { pdfFile: [mockPdfFile] }]);

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        status: 'success',
        document: {
          // text_content is missing
          json_content: {},
        },
      }),
    });

    const { req, res } = createMocks({ method: 'POST' });
    await handler(req, mockNextJsResponse(res));

    expect(res._getStatusCode()).toBe(502);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Unexpected response structure from Docling-Serve. Missing document or text_content.',
    });
  });

  test('should handle formidable parsing error', async () => {
    mockFormParse.mockRejectedValue(new Error('Formidable parsing error'));

    const { req, res } = createMocks({ method: 'POST' });
    await handler(req, mockNextJsResponse(res));

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Error processing file upload.',
      error: 'Formidable parsing error',
    });
  });

});
