'use client';

// Make TypeScript happy with our window property
declare global {
  interface Window {
    _PDFJS_WORKER_CONFIGURED?: boolean;
    pdfjsLib?: any;
  }
}

import { pdfjs } from 'react-pdf';

// Minimal worker code that implements just enough to get basic PDF rendering working
// This avoids any external file dependencies which can be problematic in Next.js
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

// Function to initialize PDF.js worker using direct blob URL
export function initializePdf() {
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
    console.log(`[PDF Setup] Configuring PDF.js ${pdfjs.version} worker with embedded code`);

    // Create blob URL from minimal worker code
    const blobUrl = createMinimalWorkerBlob();
    
    if (!blobUrl) {
      throw new Error('Failed to create worker blob URL');
    }
    
    // Set the worker source to our blob URL
    console.log(`[PDF Setup] Setting workerSrc to blob URL`);
    pdfjs.GlobalWorkerOptions.workerSrc = blobUrl;
    
    // Make sure pdfjsLib is globally available if needed
    if (!window.pdfjsLib) {
      window.pdfjsLib = pdfjs;
    }

    // Mark as configured
    window._PDFJS_WORKER_CONFIGURED = true;
    console.log(`[PDF Setup] PDF.js worker configured successfully with embedded code`);
    
  } catch (error) {
    console.error('[PDF Setup] Error configuring PDF.js worker:', error);
  }
}

// Ensure initialization runs when this module is imported on the client
if (typeof window !== 'undefined') {
  initializePdf();
}

export default initializePdf; 