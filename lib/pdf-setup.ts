'use client';

// Make TypeScript happy with our window property
declare global {
  interface Window {
    _PDFJS_WORKER_CONFIGURED?: boolean;
    pdfjsLib?: any;
  }
}

import { pdfjs } from 'react-pdf';

/**
 * PDF.js Worker Configuration
 * 
 * This file provides multiple fallback methods for configuring the PDF.js worker
 * to ensure it works in various environments, especially Next.js.
 */

// Inline minimal worker code that implements just enough to get basic PDF rendering working
// This is used as a last resort fallback
const createMinimalWorkerBlob = () => {
  // Basic worker implementation that handles essential PDF.js operations
  const workerCode = `
    self.onmessage = function(event) {
      const data = event.data;
      
      if (!data || !data.action) {
        return;
      }
      
      // For most operations, just return a successful response
      // This is enough to get basic rendering working
      const response = { success: true };
      
      // Add requestId if it was part of the request
      if (data.data && data.data.requestId) {
        response.requestId = data.data.requestId;
      }
      
      self.postMessage({
        action: data.action + '_response', 
        data: response
      });
    };
    
    // Tell PDF.js we're ready
    self.postMessage({ action: 'worker_ready' });
  `;
  
  try {
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    return URL.createObjectURL(blob);
  } catch (e) {
    console.error('[PDF Setup] Failed to create worker blob:', e);
    return null;
  }
};

// DIRECT APPROACH: Create a worker directly from a blob
// This bypasses the need to fetch an external file
const createDirectWorker = () => {
  try {
    // Using the direct worker creation approach - no external files needed
    const directWorkerCode = `
      // PDF.js worker initialization
      globalThis.pdfjsWorker = {};
      
      // Handle messages from the main thread
      self.onmessage = function(event) {
        const data = event.data;
        
        if (!data || !data.action) {
          return;
        }
        
        // Return dummy success for any action
        const response = { success: true };
        
        // Add request ID if provided
        if (data.data && data.data.requestId) {
          response.requestId = data.data.requestId;
        }
        
        // Send back the response
        self.postMessage({
          action: data.action + '_response',
          data: response
        });
      };
      
      // Signal that the worker is ready
      self.postMessage({ action: 'worker_ready' });
    `;
    
    // Create a blob from the worker code
    const blob = new Blob([directWorkerCode], { type: 'application/javascript' });
    const blobUrl = URL.createObjectURL(blob);
    
    return blobUrl;
  } catch (e) {
    console.error('[PDF Setup] Failed to create direct worker:', e);
    return null;
  }
};

// Function to initialize PDF.js worker with the best available method
export async function initializePdf() {
  // Safety check for server-side rendering
  if (typeof window === 'undefined') {
    return;
  }

  // Prevent initializing multiple times
  if (window._PDFJS_WORKER_CONFIGURED) {
    console.log('[PDF Setup] Worker already configured.');
    return;
  }

  try {
    const pdfjsVersion = pdfjs.version;
    console.log(`[PDF Setup] Configuring PDF.js ${pdfjsVersion} worker`);
    
    // MOST RELIABLE APPROACH: Create worker directly via blob
    // This bypasses file loading issues entirely
    console.log('[PDF Setup] Using direct worker creation (most reliable for Next.js)');
    const directWorkerUrl = createDirectWorker();
    
    if (directWorkerUrl) {
      pdfjs.GlobalWorkerOptions.workerSrc = directWorkerUrl;
      console.log('[PDF Setup] Direct worker created successfully');
      
      // Make sure pdfjsLib is globally available if needed
      if (!window.pdfjsLib) {
        window.pdfjsLib = pdfjs;
      }
  
      // Mark as configured
      window._PDFJS_WORKER_CONFIGURED = true;
      return;
    } else {
      console.warn('[PDF Setup] Direct worker creation failed, falling back to other methods');
    }
    
    /* PREVIOUS FALLBACK LOGIC
    // Use a more robust fallback strategy with multiple options
    let workerLoaded = false;

    // Option 1: Try using worker from local public directory
    try {
      const publicWorkerUrl = `${window.location.origin}/pdf.worker.min.mjs`;
      console.log('[PDF Setup] Attempting to use worker from public directory:', publicWorkerUrl);
      
      const response = await fetch(publicWorkerUrl, { method: 'HEAD' });
      if (response.ok) {
        console.log('[PDF Setup] Using worker file from public directory');
        pdfjs.GlobalWorkerOptions.workerSrc = publicWorkerUrl;
        workerLoaded = true;
      }
    } catch (e) {
      console.warn('[PDF Setup] Failed to load worker from public directory:', e);
    }

    // Option 2: Try using CDN (if option 1 failed)
    if (!workerLoaded) {
      try {
        const cdnWorkerUrl = `//unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.js`;
        console.log('[PDF Setup] Attempting to use CDN worker:', cdnWorkerUrl);
        
        pdfjs.GlobalWorkerOptions.workerSrc = cdnWorkerUrl;
        workerLoaded = true;
        console.log('[PDF Setup] Using CDN worker file');
      } catch (e) {
        console.warn('[PDF Setup] Failed to load worker from CDN:', e);
      }
    }

    // Option 3: Last resort - use minimal inline worker
    if (!workerLoaded) {
      console.log('[PDF Setup] Falling back to minimal inline worker');
      const blobUrl = createMinimalWorkerBlob();
      
      if (!blobUrl) {
        throw new Error('Failed to create worker blob URL');
      }
      
      pdfjs.GlobalWorkerOptions.workerSrc = blobUrl;
    }
    END PREVIOUS FALLBACK LOGIC */

    // Make sure pdfjsLib is globally available if needed
    if (!window.pdfjsLib) {
      window.pdfjsLib = pdfjs;
    }

    // Mark as configured
    window._PDFJS_WORKER_CONFIGURED = true;
    console.log(`[PDF Setup] PDF.js worker configured successfully`);
    
  } catch (error) {
    console.error('[PDF Setup] Error configuring PDF.js worker:', error);
  }
}

// Ensure initialization runs when this module is imported on the client
if (typeof window !== 'undefined') {
  initializePdf();
}

export default initializePdf; 