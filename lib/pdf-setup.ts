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
    PDFJSLib?: {
      disableWorker?: boolean;
      GlobalWorkerOptions?: {
        workerSrc?: string;
      };
    };
  }
}

/**
 * Initialize the PDF.js worker and prevent service worker registration
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
  
  // Add meta tags to disable worker and service worker
  if (typeof document !== 'undefined') {
    const metaTags = [
      { name: 'pdfjs.disableWorker', content: 'true' },
      { name: 'pdfjs.disableServiceWorker', content: 'true' },
      { name: 'x-pdf-no-worker', content: 'true' }
    ];
    
    metaTags.forEach(meta => {
      // Only add if not already present
      if (!document.querySelector(`meta[name="${meta.name}"]`)) {
        const metaTag = document.createElement('meta');
        metaTag.name = meta.name;
        metaTag.content = meta.content;
        document.head.appendChild(metaTag);
      }
    });
  }

  console.log(`[PDF Setup] Configuring PDF.js ${pdfjs.version} worker...`);

  // Ensure direct worker is used instead of service worker
  try {
    // Set the worker path - using CDN for reliability
    const workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
    console.log(`[PDF Setup] Setting worker source to: ${workerSrc}`);
    
    // Force set the worker URL to prevent any override
    Object.defineProperty(pdfjs.GlobalWorkerOptions, 'workerSrc', {
      value: workerSrc,
      writable: false,
      configurable: false
    });
    
    // Disable any PDF.js-specific service worker
    if (typeof window.PDFJSLib !== 'undefined') {
      // Disable worker if possible
      if ('disableWorker' in window.PDFJSLib) {
        window.PDFJSLib.disableWorker = true;
      }
      
      // Force the worker source if available
      if (window.PDFJSLib.GlobalWorkerOptions) {
        Object.defineProperty(window.PDFJSLib.GlobalWorkerOptions, 'workerSrc', {
          value: workerSrc,
          writable: false,
          configurable: false
        });
      }
    }
    
    // Override Navigator serviceWorker.register to prevent PDF.js from registering workers
    if (typeof navigator !== 'undefined' && navigator.serviceWorker) {
      const originalRegister = navigator.serviceWorker.register;
      navigator.serviceWorker.register = function(scriptURL: string | URL, options?: RegistrationOptions) {
        if (typeof scriptURL === 'string' && 
            (scriptURL.includes('pdf-worker-sw.js') || 
             scriptURL.includes('register-pdf-worker.js'))) {
          console.log(`[PDF Setup] Blocked service worker registration for: ${scriptURL}`);
          return Promise.reject(new Error('PDF service worker registration disabled'));
        }
        return originalRegister.call(this, scriptURL, options);
      };
    }
    
    console.log('[PDF Setup] Service worker registration disabled');
    
    // Mark as configured
    window._PDFJS_WORKER_CONFIGURED = true;
    console.log('[PDF Setup] Worker configuration complete');
  } catch (err) {
    console.error('[PDF Setup] Error configuring PDF.js worker:', err);
  }
}

// Ensure initialization runs when this module is imported on the client
if (typeof window !== 'undefined') {
  console.log('[PDF Setup] Initializing PDF.js worker...');
  
  // Multiple initialization strategies to ensure it runs
  // 1. Immediate with setTimeout to move to end of event queue
  setTimeout(initializePdf, 0);
  
  // 2. On DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePdf);
  } 
  // 3. On window load
  else if (document.readyState !== 'complete') {
    window.addEventListener('load', initializePdf);
  }
  // 4. Immediate if already complete
  else {
    initializePdf();
  }
}

export default initializePdf; 