# PDF.js Worker Configuration Documentation

## Overview

This document explains how the PDF.js worker is configured in our Next.js application to ensure consistent PDF rendering in both development and production environments.

## The PDF Worker

PDF.js relies on a "worker" script to handle computationally intensive tasks like parsing and rendering PDFs in a separate thread. This worker script (typically `pdf.worker.min.js`) needs to be properly configured for the PDF viewer to function correctly.

## Our Implementation

We've implemented a robust approach to PDF.js worker configuration with multiple fallback mechanisms:

### 1. Configuration in `lib/pdf-setup.ts`

Our main configuration file (`lib/pdf-setup.ts`) sets up the PDF.js worker with the following priority:

1. **Local file in public directory** (preferred method)
   - Uses `pdf.worker.min.js` from the public directory
   - Most reliable for both development and production
   - Works offline and avoids CORS issues

2. **CDN fallback**
   - Uses a version-matched worker from unpkg.com
   - Provides a backup if the local file is missing
   - Ensures version compatibility with our installed PDF.js library

3. **Inline minimal worker** (last resort)
   - Implements a minimal worker as a blob URL
   - Limited functionality but allows basic PDF rendering
   - Useful for development when other methods fail

### 2. Worker File Management with `scripts/copy-pdf-worker.js`

We've added a script that automatically copies the appropriate PDF.js worker file from node_modules to the public directory:

- Runs automatically before both `npm run dev` and `npm run build`
- Searches for worker files across multiple possible locations
- Supports both `.js` and `.mjs` worker file formats
- Handles various package structures (standard PDF.js, AllenAI version, etc.)

## Usage in Components

When creating PDF viewer components, you don't need to configure the worker directly. Simply:

1. Import the PDF setup at the top of your component:
   ```typescript
   // At the top of your PDF viewer component
   import '@/lib/pdf-setup';
   ```

2. Use PDF.js or AllenAI PDF components as normal:
   ```typescript
   // The worker is already configured by the import above
   import { Document, Page } from 'react-pdf';
   // Or when using AllenAI components
   import { DocumentWrapper, PageWrapper } from '@allenai/pdf-components';
   ```

## Troubleshooting

If PDF rendering fails:

1. Check the console for specific error messages related to the worker
2. Verify that the copy-pdf-worker script ran successfully
3. Check that the worker file exists in the public directory
4. Try manually copying the worker file if needed

## References

- [PDF.js Documentation](https://mozilla.github.io/pdf.js/getting_started/)
- [react-pdf Documentation](https://www.npmjs.com/package/react-pdf)
- [AllenAI PDF Components](https://www.npmjs.com/package/@allenai/pdf-components) 