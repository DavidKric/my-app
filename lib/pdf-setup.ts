'use client';

/**
 * PDF.js Worker Configuration for AllenAI PDF Components
 * 
 * This file configures the PDF.js worker used by the AllenAI PDF components.
 * The AllenAI library uses PDF.js under the hood and needs this configuration.
 */

import { pdfjs } from 'react-pdf';

// Type declaration for window to support custom property
declare global {
  interface Window {
    _PDFJS_WORKER_CONFIGURED?: boolean;
  }
}

/**
 * Initialize the PDF.js worker
 * This is required for the AllenAI PDF components to work properly
 */
export function initializePdf() {
  // Safety check for server-side rendering
  if (typeof window === 'undefined') {
    return;
  }

  // Prevent initializing multiple times 
  if (window._PDFJS_WORKER_CONFIGURED) {
    console.log('[PDF Setup] Worker already configured');
    return;
  }

  console.log(`[PDF Setup] Configuring PDF.js ${pdfjs.version} worker...`);

  // Set the worker path - using CDN for reliability
  // Force set the worker URL, overriding any previous value
  const workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
  console.log(`[PDF Setup] Setting worker source to: ${workerSrc}`);
  
  // Force set the worker URL to prevent any override
  Object.defineProperty(pdfjs.GlobalWorkerOptions, 'workerSrc', {
    value: workerSrc,
    writable: false,
    configurable: false
  });
  
  // Mark as configured
  window._PDFJS_WORKER_CONFIGURED = true;
  console.log('[PDF Setup] Worker configuration complete');
}

// Ensure initialization runs when this module is imported on the client
if (typeof window !== 'undefined') {
  console.log('[PDF Setup] Initializing PDF.js worker...');
  // Run with a slight delay to ensure it runs after any other initialization
  setTimeout(initializePdf, 0);
}

export default initializePdf; 