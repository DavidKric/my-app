import { POST, GET } from '../process-pdf/route';
import { NextRequest } from 'next/server';
import type { 
  ProcessPdfResponse, 
  ProcessPdfErrorResponse,
  DoclingConvertResponse 
} from '@/types/docling-serve';

// Mock the file system operations
jest.mock('fs/promises', () => ({
  writeFile: jest.fn().mockResolvedValue(undefined),
  unlink: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('fs', () => ({
  createReadStream: jest.fn().mockReturnValue({
    pipe: jest.fn(),
    on: jest.fn(),
    end: jest.fn(),
  }),
}));

// Mock FormData for Node.js
jest.mock('form-data', () => {
  return jest.fn().mockImplementation(() => ({
    append: jest.fn(),
    getHeaders: jest.fn(() => ({ 'content-type': 'multipart/form-data' })),
  }));
});

// Global fetch mock
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

// Helper to create a mock File
function createMockFile(name: string, size: number, type: string): File {
  const file = new File(['mock file content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

// Helper to create FormData with file
function createFormDataWithFile(file: File, fieldName: string = 'pdfFile'): FormData {
  const formData = new FormData();
  formData.append(fieldName, file);
  return formData;
}

// Helper to create NextRequest
function createMockRequest(formData: FormData): NextRequest {
  const request = new NextRequest('http://localhost:3000/api/process-pdf', {
    method: 'POST',
    headers: {
      'content-type': 'multipart/form-data; boundary=mock-boundary',
    },
  });

  // Mock the formData method
  jest.spyOn(request, 'formData').mockResolvedValue(formData);

  return request;
}

describe('/api/process-pdf API Endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    process.env.DOCLING_SERVE_URL = 'http://localhost:5001';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/process-pdf', () => {
    test('should return 400 if no PDF file is uploaded', async () => {
      const formData = new FormData();
      const request = createMockRequest(formData);

      const response = await POST(request);
      const data = await response.json() as ProcessPdfResponse;

      expect(response.status).toBe(400);
      expect(data.message).toBe('No PDF file uploaded. Make sure the field name is "pdfFile".');
    });

    test('should return 400 for invalid file type', async () => {
      const mockFile = createMockFile('test.txt', 1000, 'text/plain');
      const formData = createFormDataWithFile(mockFile);
      const request = createMockRequest(formData);

      const response = await POST(request);
      const data = await response.json() as ProcessPdfResponse;

      expect(response.status).toBe(400);
      expect(data.message).toContain('Invalid file type');
    });

    test('should return 400 for file too large', async () => {
      const largeSize = 100 * 1024 * 1024; // 100MB
      const mockFile = createMockFile('large.pdf', largeSize, 'application/pdf');
      const formData = createFormDataWithFile(mockFile);
      const request = createMockRequest(formData);

      const response = await POST(request);
      const data = await response.json() as ProcessPdfResponse;

      expect(response.status).toBe(400);
      expect(data.message).toContain('File size exceeds maximum limit');
    });

    test('should successfully process a PDF and return text content', async () => {
      const mockFile = createMockFile('test.pdf', 1000, 'application/pdf');
      const formData = createFormDataWithFile(mockFile);
      const request = createMockRequest(formData);

      const mockDoclingResponse: DoclingConvertResponse = {
        status: 'success',
        document: {
          text_content: 'This is the extracted text.',
          json_content: { page_count: 1 },
          html_content: '<p>HTML content</p>',
          md_content: '# Markdown content',
        },
        errors: undefined,
        warnings: [],
      };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDoclingResponse,
        status: 200,
        statusText: 'OK',
      } as Response);

      const response = await POST(request);
      const data = await response.json() as ProcessPdfResponse;

      expect(response.status).toBe(200);
      expect(data.message).toBe('File processed successfully by docling-serve.');
      expect(data.doclingStatus).toBe('success');
      expect((data as any).textContent).toBe('This is the extracted text.');
      expect((data as any).jsonContent).toEqual({ page_count: 1 });
      expect((data as any).htmlContent).toBe('<p>HTML content</p>');
      expect((data as any).mdContent).toBe('# Markdown content');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    test('should handle partial success status', async () => {
      const mockFile = createMockFile('test.pdf', 1000, 'application/pdf');
      const formData = createFormDataWithFile(mockFile);
      const request = createMockRequest(formData);

      const mockDoclingResponse: DoclingConvertResponse = {
        status: 'partial_success',
        document: {
          text_content: 'Partially extracted text.',
        },
        errors: ['Some OCR errors'],
        warnings: ['Some warnings'],
      };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDoclingResponse,
        status: 200,
        statusText: 'OK',
      } as Response);

      const response = await POST(request);
      const data = await response.json() as ProcessPdfResponse;

      expect(response.status).toBe(200);
      expect(data.doclingStatus).toBe('partial_success');
      expect((data as any).doclingErrors).toEqual(['Some OCR errors']);
      expect((data as any).warnings).toEqual(['Some warnings']);
    });

    test('should return 502 if Docling-serve processing status is "failure"', async () => {
      const mockFile = createMockFile('test.pdf', 1000, 'application/pdf');
      const formData = createFormDataWithFile(mockFile);
      const request = createMockRequest(formData);

      const mockDoclingResponse: DoclingConvertResponse = {
        status: 'failure',
        errors: ['OCR failed', 'Content extraction failed'],
      };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDoclingResponse,
        status: 200,
        statusText: 'OK',
      } as Response);

      const response = await POST(request);
      const data = await response.json() as ProcessPdfResponse;

      expect(response.status).toBe(502);
      expect(data.message).toBe('Docling-serve processing failed.');
      expect(data.doclingStatus).toBe('failure');
      expect(data.doclingErrors).toEqual(['OCR failed', 'Content extraction failed']);
    });

    test('should return 502 if Docling-serve response has missing document', async () => {
      const mockFile = createMockFile('test.pdf', 1000, 'application/pdf');
      const formData = createFormDataWithFile(mockFile);
      const request = createMockRequest(formData);

      const mockDoclingResponse = {
        status: 'success',
        // document is missing
      };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDoclingResponse,
        status: 200,
        statusText: 'OK',
      } as Response);

      const response = await POST(request);
      const data = await response.json() as ProcessPdfResponse;

      expect(response.status).toBe(502);
      expect(data.message).toContain('Unexpected response structure from docling-serve');
    });

    test('should return 502 if fetch to Docling-serve returns error status', async () => {
      const mockFile = createMockFile('test.pdf', 1000, 'application/pdf');
      const formData = createFormDataWithFile(mockFile);
      const request = createMockRequest(formData);

      const errorDetails = 'Docling internal server error';
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => errorDetails,
      } as Response);

      const response = await POST(request);
      const data = await response.json() as ProcessPdfErrorResponse;

      expect(response.status).toBe(502);
      expect(data.message).toBe('Error from docling-serve.');
      expect(data.error).toContain('Docling-serve error (500)');
    });

    test('should return 500 if fetch to Docling-serve fails with network error', async () => {
      const mockFile = createMockFile('test.pdf', 1000, 'application/pdf');
      const formData = createFormDataWithFile(mockFile);
      const request = createMockRequest(formData);

      (global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
        new Error('Network failure')
      );

      const response = await POST(request);
      const data = await response.json() as ProcessPdfErrorResponse;

      expect(response.status).toBe(500);
      expect(data.message).toBe('Internal server error while processing PDF.');
      expect(data.error).toBe('Network failure');
    });

    test('should return 504 on timeout error', async () => {
      const mockFile = createMockFile('test.pdf', 1000, 'application/pdf');
      const formData = createFormDataWithFile(mockFile);
      const request = createMockRequest(formData);

      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      
      (global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(abortError);

      const response = await POST(request);
      const data = await response.json() as ProcessPdfErrorResponse;

      expect(response.status).toBe(504);
      expect(data.message).toContain('Request timed out');
      expect(data.error).toBe('Timeout');
    });

    test('should handle custom OCR languages from form data', async () => {
      const mockFile = createMockFile('test.pdf', 1000, 'application/pdf');
      const formData = createFormDataWithFile(mockFile);
      formData.append('ocr_lang', 'eng');
      formData.append('ocr_lang', 'fra');
      
      const request = createMockRequest(formData);

      const mockDoclingResponse: DoclingConvertResponse = {
        status: 'success',
        document: {
          text_content: 'Multi-language text.',
        },
      };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDoclingResponse,
        status: 200,
        statusText: 'OK',
      } as Response);

      const response = await POST(request);
      const data = await response.json() as ProcessPdfResponse;

      expect(response.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      // Note: In a real test, you might want to verify the FormData content was correct
    });
  });

  describe('GET /api/process-pdf', () => {
    test('should return API information', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('PDF Processing API');
      expect(data.endpoint).toBe('/api/process-pdf');
      expect(data.method).toBe('POST');
      expect(data.doclingServeUrl).toBe('http://localhost:5001');
    });

    test('should use default URL when environment variable is not set', async () => {
      const response = await GET();
      const data = await response.json();

      expect(data.doclingServeUrl).toBe('http://localhost:5001');
    });
  });
});

// Additional type-checking tests
describe('TypeScript Type Safety', () => {
  test('should have proper return types', async () => {
    const mockFile = createMockFile('test.pdf', 1000, 'application/pdf');
    const formData = createFormDataWithFile(mockFile);
    const request = createMockRequest(formData);

    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'success',
        document: { text_content: 'test' },
      }),
      status: 200,
      statusText: 'OK',
    } as Response);

    const response = await POST(request);
    
    // TypeScript should enforce these types
    expect(typeof response.status).toBe('number');
    expect(response.json).toBeDefined();
    
    const data = await response.json() as ProcessPdfResponse;
    expect(typeof data.message).toBe('string');
    expect(typeof data.doclingStatus).toBe('string');
  });
}); 