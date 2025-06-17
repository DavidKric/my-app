// Types based on docling-serve API documentation
// Reference: https://docs.docling.dev/usage

export interface DoclingConvertOptions {
  from_formats?: string[];
  to_formats?: string[];
  pipeline?: 'standard' | 'vlm';
  page_range?: [number, number];
  do_ocr?: boolean;
  image_export_mode?: 'embedded' | 'placeholder' | 'referenced';
  force_ocr?: boolean;
  ocr_engine?: 'easyocr' | 'tesseract_cli' | 'tesseract' | 'rapidocr' | 'ocrmac';
  ocr_lang?: string[];
  pdf_backend?: 'pypdfium2' | 'dlparse_v1' | 'dlparse_v2' | 'dlparse_v4';
  table_mode?: 'fast' | 'accurate';
  abort_on_error?: boolean;
  return_as_file?: boolean;
  do_table_structure?: boolean;
  do_code_enrichment?: boolean;
  do_formula_enrichment?: boolean;
  do_picture_classification?: boolean;
  do_picture_description?: boolean;
  picture_description_area_threshold?: number;
  include_images?: boolean;
  images_scale?: number;
}

export interface DoclingHttpSource {
  url: string;
  headers?: Record<string, string>;
}

export interface DoclingFileSource {
  filename: string;
  buffer: string; // base64 encoded
}

export interface DoclingConvertRequest {
  options?: DoclingConvertOptions;
  http_sources?: DoclingHttpSource[];
  file_sources?: DoclingFileSource[];
}

export interface DoclingDocument {
  text_content?: string;
  json_content?: any;
  html_content?: string;
  md_content?: string;
}

export interface DoclingConvertResponse {
  status: 'success' | 'partial_success' | 'failure';
  document?: DoclingDocument;
  errors?: string[] | any[];
  warnings?: string[];
}

export interface DoclingAsyncTaskResponse {
  task_id: string;
  task_status: 'pending' | 'started' | 'success' | 'failure';
  task_position?: number;
  task_meta?: any;
}

export interface DoclingError {
  message: string;
  code?: string;
  details?: any;
}

// API Response types for our endpoints
export interface ProcessPdfSuccessResponse {
  message: string;
  doclingStatus: string;
  textContent?: string;
  jsonContent?: any;
  htmlContent?: string;
  mdContent?: string;
  doclingErrors?: string[] | any[] | null;
  warnings?: string[];
}

export interface ProcessPdfErrorResponse {
  message: string;
  error?: string;
  doclingStatus?: string;
  doclingErrors?: string[] | any[];
  details?: any;
}

export type ProcessPdfResponse = ProcessPdfSuccessResponse | ProcessPdfErrorResponse; 