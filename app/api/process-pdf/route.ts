import { NextRequest, NextResponse } from 'next/server';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { writeFile, unlink } from 'fs/promises';
import type { 
  DoclingConvertResponse, 
  ProcessPdfResponse,
  DoclingConvertOptions 
} from '@/types/docling-serve';

// Configuration constants based on docling-serve documentation
const DOCLING_SERVE_BASE_URL = process.env.DOCLING_SERVE_URL || 'http://localhost:5001';
const DOCLING_CONVERT_ENDPOINT = `${DOCLING_SERVE_BASE_URL}/v1alpha/convert/file`;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB - adjust based on your needs
const ALLOWED_MIME_TYPES = ['application/pdf'] as const;

// Default docling-serve options following best practices
const DEFAULT_DOCLING_OPTIONS: DoclingConvertOptions = {
  to_formats: ['text', 'json'], // Convert to both text and JSON
  do_ocr: true,
  ocr_engine: 'easyocr', // Use easyocr as default (most reliable)
  ocr_lang: ['eng'], // Default to English
  pdf_backend: 'dlparse_v2', // Recommended backend
  table_mode: 'fast',
  abort_on_error: false,
  return_as_file: false,
  do_table_structure: true,
  image_export_mode: 'placeholder',
};

/**
 * Validates the uploaded file
 */
function validateFile(file: File): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { 
      isValid: false, 
      error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
    };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type as any)) {
    return { 
      isValid: false, 
      error: `Invalid file type. Only PDF files are allowed. Received: ${file.type}` 
    };
  }

  return { isValid: true };
}

/**
 * Creates a temporary file from the uploaded file buffer
 */
async function createTempFile(file: File): Promise<{ filepath: string; cleanup: () => Promise<void> }> {
  const buffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(buffer);
  
  // Create a safe filename
  const timestamp = Date.now();
  const safeFileName = `upload_${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const filepath = path.join('/tmp', safeFileName);
  
  await writeFile(filepath, uint8Array);
  
  const cleanup = async () => {
    try {
      await unlink(filepath);
    } catch (error) {
      console.warn('Failed to cleanup temp file:', filepath, error);
    }
  };

  return { filepath, cleanup };
}

/**
 * Sends file to docling-serve for processing
 */
async function sendToDoclingServe(
  filepath: string, 
  filename: string,
  options: Partial<DoclingConvertOptions> = {}
): Promise<DoclingConvertResponse> {
  const formData = new FormData();
  
  // Add the file
  formData.append('files', fs.createReadStream(filepath), {
    filename: filename,
    contentType: 'application/pdf'
  });

  // Merge options with defaults
  const finalOptions = { ...DEFAULT_DOCLING_OPTIONS, ...options };

  // Add docling-serve parameters as per documentation
  Object.entries(finalOptions).forEach(([key, value]) => {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach(item => formData.append(key, item.toString()));
      } else {
        formData.append(key, value.toString());
      }
    }
  });

  console.log(`Sending file to docling-serve: ${DOCLING_CONVERT_ENDPOINT}`);
  console.log('Options:', finalOptions);

  const response = await fetch(DOCLING_CONVERT_ENDPOINT, {
    method: 'POST',
    body: formData as any, // FormData from 'form-data' package is compatible
    headers: formData.getHeaders(),
    // Add timeout
    signal: AbortSignal.timeout(120000), // 2 minutes timeout
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Docling-serve error (${response.status}): ${errorText}`);
  }

  return response.json() as Promise<DoclingConvertResponse>;
}

/**
 * POST /api/process-pdf
 * Processes a PDF file using docling-serve
 */
export async function POST(request: NextRequest): Promise<NextResponse<ProcessPdfResponse>> {
  let tempFileCleanup: (() => Promise<void>) | null = null;

  try {
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('pdfFile') as File;

    if (!file) {
      return NextResponse.json(
        { 
          message: 'No PDF file uploaded. Make sure the field name is "pdfFile".' 
        },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      return NextResponse.json(
        { message: validation.error! },
        { status: 400 }
      );
    }

    console.log(`Processing PDF file: ${file.name} (${file.size} bytes)`);

    // Create temporary file
    const { filepath, cleanup } = await createTempFile(file);
    tempFileCleanup = cleanup;

    // Extract custom options from form data (optional)
    const customOptions: Partial<DoclingConvertOptions> = {};
    
    // Add support for custom OCR languages if provided
    const ocrLangs = formData.getAll('ocr_lang');
    if (ocrLangs.length > 0) {
      customOptions.ocr_lang = ocrLangs.map(lang => lang.toString());
    }

    // Send to docling-serve
    const doclingResponse = await sendToDoclingServe(filepath, file.name, customOptions);

    // Process response according to docling-serve documentation
    const { status, document, errors, warnings } = doclingResponse;

    if (status === 'failure') {
      console.error('Docling-serve processing failed:', status, errors);
      return NextResponse.json(
        {
          message: 'Docling-serve processing failed.',
          doclingStatus: status,
          doclingErrors: errors || [],
        },
        { status: 502 } // Bad Gateway - upstream service error
      );
    }

    if (!document) {
      console.error('Unexpected response structure from docling-serve:', doclingResponse);
      return NextResponse.json(
        {
          message: 'Unexpected response structure from docling-serve. Missing document content.',
          doclingStatus: status,
        },
        { status: 502 }
      );
    }

    // Log document structure for debugging
    console.log('Docling-serve processing completed successfully');
    console.log('Document keys:', Object.keys(document));
    if (document.json_content) {
      console.log('JSON content structure:', JSON.stringify(document.json_content, null, 2).substring(0, 500) + '...');
    }

    // Return successful response
    const response: ProcessPdfResponse = {
      message: 'File processed successfully by docling-serve.',
      doclingStatus: status,
      textContent: document.text_content,
      jsonContent: document.json_content,
      htmlContent: document.html_content,
      mdContent: document.md_content,
      doclingErrors: errors || null,
      warnings: warnings || [],
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error processing PDF:', error);

    if (error instanceof Error) {
      // Handle specific error types
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { 
            message: 'Request timed out. The file may be too large or complex to process.',
            error: 'Timeout'
          },
          { status: 504 } // Gateway Timeout
        );
      }

      if (error.message.includes('Docling-serve error')) {
        return NextResponse.json(
          { 
            message: 'Error from docling-serve.',
            error: error.message,
            details: error.message
          },
          { status: 502 } // Bad Gateway
        );
      }
    }

    // Generic server error
    return NextResponse.json(
      { 
        message: 'Internal server error while processing PDF.',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );

  } finally {
    // Always cleanup temporary files
    if (tempFileCleanup) {
      await tempFileCleanup();
    }
  }
}

/**
 * GET /api/process-pdf
 * Returns API information
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    message: 'PDF Processing API',
    description: 'POST a PDF file to process it with docling-serve',
    endpoint: '/api/process-pdf',
    method: 'POST',
    parameters: {
      pdfFile: 'File - The PDF file to process (required)',
      ocr_lang: 'string[] - OCR languages (optional, defaults to ["eng"])',
    },
    doclingServeUrl: DOCLING_SERVE_BASE_URL,
  });
} 