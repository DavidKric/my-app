'use client';

/**
 * Service Worker Cleanup Utility
 * 
 * This utility is designed to identify and unregister any PDF.js related service workers
 * that might be registered from previous versions of the application.
 */

export function cleanupPdfServiceWorkers() {
  // Only run in browser environment
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  console.log('[Service Worker] Checking for registered PDF service workers...');

  // Get all registered service workers
  navigator.serviceWorker.getRegistrations().then(registrations => {
    if (registrations.length === 0) {
      console.log('[Service Worker] No service workers found');
      return;
    }

    console.log(`[Service Worker] Found ${registrations.length} registered service workers`);

    // Check for PDF worker service workers
    let pdfWorkersFound = false;

    registrations.forEach(registration => {
      const scriptURL = registration.active?.scriptURL || '';
      const scope = registration.scope || '';

      // If the service worker URL or scope contains pdf-worker, it's likely a PDF.js service worker
      if (
        scriptURL.includes('pdf-worker') || 
        scriptURL.includes('pdf.worker') || 
        scope.includes('pdf-worker')
      ) {
        pdfWorkersFound = true;
        console.log('[Service Worker] Found PDF service worker:', scriptURL);

        // Unregister the service worker
        registration.unregister().then(() => {
          console.log('[Service Worker] Successfully unregistered:', scriptURL);
          
          // Force a refresh to ensure clean state if needed
          if (navigator.serviceWorker.controller) {
            console.log('[Service Worker] Reloading page to complete cleanup');
            window.location.reload();
          }
        }).catch(error => {
          console.error('[Service Worker] Failed to unregister service worker:', error);
        });
      }
    });

    if (!pdfWorkersFound) {
      console.log('[Service Worker] No PDF service workers found');
    }
  }).catch(error => {
    console.error('[Service Worker] Error checking service workers:', error);
  });
}

// Export a function to manually clear IndexedDB caches from PDF.js
export function clearPdfCaches() {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return;
  }
  
  // List of known PDF.js related IndexedDB databases
  const pdfDatabases = [
    'pdf.js',
    'pdfjs-history',
    'pdfjs-storage'
  ];
  
  pdfDatabases.forEach(dbName => {
    try {
      const request = indexedDB.deleteDatabase(dbName);
      
      request.onsuccess = () => {
        console.log(`[Cache] Successfully deleted IndexedDB: ${dbName}`);
      };
      
      request.onerror = (event) => {
        console.error(`[Cache] Failed to delete IndexedDB: ${dbName}`, event);
      };
    } catch (error) {
      console.error(`[Cache] Error deleting IndexedDB: ${dbName}`, error);
    }
  });
}

// Auto-clean on import when in the browser
if (typeof window !== 'undefined') {
  // Wait for the page to fully load
  if (document.readyState === 'complete') {
    cleanupPdfServiceWorkers();
  } else {
    window.addEventListener('load', () => {
      cleanupPdfServiceWorkers();
    });
  }
}

export default { cleanupPdfServiceWorkers, clearPdfCaches }; 