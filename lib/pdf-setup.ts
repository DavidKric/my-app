'use client';

// Make TypeScript happy with our window property
declare global {
  interface Window {
    _PDFJS_WORKER_CONFIGURED?: boolean;
    _PDFJS_WORKER_RETRIED?: boolean;
    pdfjsLib?: any;
  }
}

import { pdfjs } from 'react-pdf';

// Configure PDF.js worker
if (typeof window !== 'undefined' && !window._PDFJS_WORKER_CONFIGURED) {
  console.log('Configuring PDF.js worker');
  
  try {
    // Try multiple CDN options for better reliability
    // Option 1: JSDelivr CDN
    let WORKER_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.269/build/pdf.worker.min.js';
    
    // Option 2: Unpkg CDN (backup)
    const UNPKG_WORKER_URL = 'https://unpkg.com/pdfjs-dist@4.0.269/build/pdf.worker.min.js';
    
    // Option 3: CDNJS (another backup)
    const CDNJS_WORKER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.269/pdf.worker.min.js';
    
    console.log('Setting PDF.js worker source to:', WORKER_URL);
    
    // Set the worker source
    pdfjs.GlobalWorkerOptions.workerSrc = WORKER_URL;
    
    // Some browsers might have CORS issues with external PDFs
    // We rely on the default configuration to handle this instead of
    // setting potentially unsupported properties
    
    // Expose to global scope for libraries that might need it
    if (!window.pdfjsLib) {
      window.pdfjsLib = {};
    }
    if (window.pdfjsLib && !window.pdfjsLib.GlobalWorkerOptions) {
      window.pdfjsLib.GlobalWorkerOptions = {};
    }
    if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_URL;
    }
    
    // Mark as configured to prevent multiple initializations
    window._PDFJS_WORKER_CONFIGURED = true;
    
    console.log('PDF.js worker configured successfully');
    
    // Set up a backup mechanism to try another worker if the first one fails
    window.addEventListener('error', function(e) {
      // Only handle PDF.js worker errors
      if (e.message && e.message.includes('PDF.js') && !window._PDFJS_WORKER_RETRIED) {
        console.warn('Detected possible PDF.js worker error, trying backup CDN');
        pdfjs.GlobalWorkerOptions.workerSrc = UNPKG_WORKER_URL;
        if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = UNPKG_WORKER_URL;
        }
        window._PDFJS_WORKER_RETRIED = true;
      }
    });
    
  } catch (error) {
    console.error('Error configuring PDF.js worker:', error);
  }
} 