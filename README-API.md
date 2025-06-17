# TypeScript Docling-Serve API Integration

## 🎯 Overview

This project provides a complete TypeScript integration with docling-serve for PDF processing and document analysis. All JavaScript files have been converted to TypeScript following docling-serve best practices.

## 📁 File Structure

```
my-app/
├── app/api/process-pdf/route.ts       # Main API endpoint
├── components/pdf-upload/             # Upload component
├── types/docling-serve.ts             # TypeScript definitions
├── app/upload-demo/page.tsx           # Demo page
└── README-API.md                      # This file
```

## 🚀 Quick Start

1. **Start docling-serve:**
   ```bash
   docker run -p 5001:5001 docling/docling-serve
   ```

2. **Set environment variables:**
   ```bash
   # In .env.local
   DOCLING_SERVE_URL=http://localhost:5001
   ```

3. **Test the API:**
   ```bash
   npm run dev
   # Visit: http://localhost:3000/upload-demo
   ```

## 📋 API Reference

### POST /api/process-pdf

**Request:**
- Content-Type: `multipart/form-data`
- Field: `pdfFile` (PDF file)
- Optional: `ocr_lang` (array of language codes)

**Response (Success):**
```json
{
  "message": "File processed successfully",
  "doclingStatus": "success",
  "textContent": "Extracted text...",
  "jsonContent": { "document structure..." },
  "htmlContent": "<html>...",
  "mdContent": "# Markdown...",
  "warnings": []
}
```

**Response (Error):**
```json
{
  "message": "Error description",
  "error": "Error details",
  "doclingStatus": "failure"
}
```

## 🔧 Configuration

### Environment Variables

```bash
# Required
DOCLING_SERVE_URL=http://localhost:5001

# Optional
DOCLING_REQUEST_TIMEOUT=120000    # 2 minutes
MAX_PDF_UPLOAD_SIZE=52428800      # 50MB
```

### Default Options

Following docling-serve best practices:

```typescript
{
  to_formats: ['text', 'json'],
  do_ocr: true,
  ocr_engine: 'easyocr',           # Most reliable
  ocr_lang: ['eng'],
  pdf_backend: 'dlparse_v2',       # Recommended
  table_mode: 'fast',
  do_table_structure: true,
  image_export_mode: 'placeholder'
}
```

## ✨ Features

- ✅ **Complete TypeScript Support** - Full type safety
- 🔒 **File Validation** - Size, type, and format checking
- ⚡ **Multiple Output Formats** - Text, JSON, HTML, Markdown
- 🛠️ **Error Handling** - Comprehensive error management
- 🌐 **OCR Support** - Multi-language text recognition
- 📊 **Document Structure** - Tables, headers, paragraphs
- 🎨 **Modern UI** - Beautiful upload component
- 🚦 **Status Indicators** - Real-time processing feedback

## 🧩 Component Usage

```tsx
import UploadPdfComponent from '@/components/pdf-upload/UploadPdfComponent';

export default function MyPage() {
  return <UploadPdfComponent />;
}
```

## 🔍 Error Handling

The API returns appropriate HTTP status codes:

- `200` - Success
- `400` - Bad Request (invalid file)
- `502` - Bad Gateway (docling-serve error)
- `504` - Gateway Timeout
- `500` - Internal Server Error

## 📝 TypeScript Types

All types are properly defined in `/types/docling-serve.ts`:

```typescript
interface DoclingConvertOptions {
  from_formats?: string[];
  to_formats?: string[];
  do_ocr?: boolean;
  ocr_engine?: 'easyocr' | 'tesseract' | 'rapidocr';
  // ... complete type definitions
}
```

## 🧪 Testing

1. **Manual Testing:**
   ```bash
   curl -X POST http://localhost:3000/api/process-pdf \
     -F "pdfFile=@sample.pdf"
   ```

2. **Demo Page:**
   Visit `/upload-demo` for interactive testing

## 📚 Documentation References

Based on official docling-serve documentation:
- [Usage Guide](https://github.com/docling-project/docling-serve/blob/main/docs/usage.md)
- [Configuration](https://github.com/docling-project/docling-serve/blob/main/docs/configuration.md)
- [Best Practices](https://github.com/docling-project/docling-serve/blob/main/docs/deployment.md)

## 🎉 What's New

### Converted to TypeScript:
- ✅ `process-pdf.js` → `app/api/process-pdf/route.ts`
- ✅ `upload-pdf.js` → `components/pdf-upload/UploadPdfComponent.tsx`
- ✅ Added comprehensive type definitions
- ✅ Implemented docling-serve best practices
- ✅ Added proper error handling
- ✅ Created demo page

### Improvements:
- 🔒 **Security**: File validation and sanitization
- ⚡ **Performance**: Efficient file handling and cleanup
- 🛡️ **Reliability**: Timeout handling and error recovery
- 📊 **Monitoring**: Detailed logging and status tracking
- 🎨 **UX**: Beautiful UI with loading states and feedback

All files now follow TypeScript best practices and docling-serve recommendations! 