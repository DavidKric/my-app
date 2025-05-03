# PDF.js Setup Documentation

This document explains how the PDF.js integration is configured in this project for both development and production environments.

## Overview

This project uses PDF.js via the following libraries:
- `react-pdf` - Core React components for rendering PDFs
- `@allenai/pdf-components` - Enhanced PDF components from Allen AI

## Key Components

1. **PDF Setup Module**: `lib/pdf-setup.ts`
   - Central configuration for PDF.js worker
   - Environment-aware configuration (development vs. production)
   - Handles initialization and provides PDF options

2. **Worker File Handling**:
   - Development: Uses CDN-hosted worker file
   - Production: Uses locally bundled worker file in public directory

3. **Build Process**:
   - Script to copy PDF.js cMaps and fonts to public directory
   - Next.js configuration to handle PDF.js in build

## How It Works

### Development Mode

In development mode:
- PDF worker is loaded from CDN (`https://unpkg.com/pdfjs-dist@[version]/build/pdf.worker.min.js`)
- cMaps and standard fonts are loaded from CDN
- No local files are required

### Production Mode

In production mode:
- PDF worker is loaded from local public directory (`/pdf.worker.min.js`)
- cMaps and standard fonts are loaded from local public directory
- All required files are copied during build process

## Configuration Details

### PDF Setup Module (`lib/pdf-setup.ts`)

This is the central module that configures PDF.js for the application:

```typescript
// Determines environment and sets appropriate worker URL
if (isProd) {
  // In production, use the local worker file
  workerUrl = '/pdf.worker.min.js';
} else {
  // In development, use the CDN version
  workerUrl = `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.js`;
}

// Sets the worker source
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
```

### Next.js Configuration (`next.config.js`)

The Next.js configuration handles:
1. Transpiling the PDF components package
2. Mock canvas and other browser-only modules in SSR
3. Copy PDF.js worker to public directory in production build

### Setup Script (`scripts/setup-pdfjs.js`)

This script:
1. Copies PDF.js worker to public directory
2. Copies cMaps files to public/cmaps
3. Copies standard fonts to public/standard_fonts

## Usage

### Running in Development

```bash
npm run dev
```

### Building for Production

```bash
npm run build
# This automatically runs setup-pdfjs script first
```

### Manual Setup of PDF.js Files

```bash
npm run setup-pdfjs
```

## Troubleshooting

If you encounter issues with PDF rendering:

1. Check browser console for errors related to PDF.js worker
2. Verify that worker URL is correctly configured
3. For production, ensure cMaps and fonts are properly copied to public directory
4. In development, check network requests for CDN resources

## Implementation Notes

- The worker configuration is centralized to avoid conflicts between libraries
- Dynamic imports are used to prevent SSR issues with PDF.js
- cMaps are required for international character support in PDFs
- Standard fonts are used as fallbacks when PDF fonts are not available 