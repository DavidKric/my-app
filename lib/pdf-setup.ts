'use client';

// Define the global types for PDF.js
declare global {
  interface Window {
    _PDFJS_WORKER_CONFIGURED?: boolean;
    pdfjsLib?: any;
  }
}

import { pdfjs } from 'react-pdf';

// Configuration options for the PDF components
const PDF_OPTIONS = {
  cMapUrl: '/cmaps/',  // Local cmaps
  cMapPacked: true,
  standardFontDataUrl: '/standard_fonts/',  // Local fonts
};

// PDF.js version
const PDFJS_VERSION = pdfjs.version;

// Determine the environment
const isProd = process.env.NODE_ENV === 'production';
const isSSR = typeof window === 'undefined';

/**
 * Initialize the PDF.js worker - this function handles both local and production environments
 * and ensures the worker is only set up once
 */
export function initializePdf() {
  // Skip if running on server-side
  if (isSSR) {
    return Promise.resolve();
  }

  // Prevent initializing multiple times
  if (window._PDFJS_WORKER_CONFIGURED) {
    console.log('[PDF Setup] Worker already configured.');
    return Promise.resolve();
  }

  try {
    console.log(`[PDF Setup] Configuring PDF.js ${PDFJS_VERSION} worker`);

    // Determine the worker URL based on environment
    let workerUrl;

    // In development, we can use a CDN for simplicity
    // In production, we'll use a worker that gets bundled with the app
    if (isProd) {
      // In production, use the local worker file that will be placed in /public
      workerUrl = '/pdf.worker.min.js';
    } else {
      // In development, use the CDN version
      workerUrl = `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.js`;
    }

    console.log(`[PDF Setup] Using worker from: ${workerUrl}`);
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

    // Make pdfjsLib globally available
    if (!window.pdfjsLib) {
      window.pdfjsLib = pdfjs;
    }

    // Mark as configured
    window._PDFJS_WORKER_CONFIGURED = true;
    console.log(`[PDF Setup] PDF.js worker configured successfully`);

    // Return a resolved promise
    return Promise.resolve();
  } catch (error) {
    console.error('[PDF Setup] Error configuring PDF.js worker:', error);
    return Promise.reject(error);
  }
}

/**
 * Get PDF options for the Document component
 */
export function getPdfOptions() {
  return PDF_OPTIONS;
}

// Auto-initialize when this module is imported on client-side
if (!isSSR) {
  initializePdf().catch(error => {
    console.error('[PDF Setup] Failed to initialize PDF worker:', error);
  });
}

export default initializePdf; 