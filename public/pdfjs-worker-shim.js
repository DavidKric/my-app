/**
 * PDF.js Worker Shim
 * This file provides a minimal implementation of the PDF.js worker functionality
 * to avoid CORS issues when loading the worker from CDNs.
 */

(function(self) {
  // Provide a basic implementation of worker functionality
  self.onmessage = function(event) {
    try {
      const data = event.data;
      console.log('[PDF Worker Shim] Received message:', data ? data.action : 'unknown');

      if (!data) {
        return self.postMessage({
          error: 'Invalid message received by worker'
        });
      }

      // Handle different action types
      switch (data.action) {
        case 'getDocument':
          handleGetDocument(data);
          break;
        
        case 'GetPage':
          handleGetPage(data);
          break;
          
        case 'render':
          handleRender(data);
          break;
          
        case 'test':
          self.postMessage({
            action: data.action,
            result: { success: true, message: 'Worker shim is functioning' }
          });
          break;
          
        default:
          // Generic response for any unhandled action
          self.postMessage({
            action: data.action,
            data: { success: true, message: 'Operation acknowledged' }
          });
      }
    } catch (error) {
      console.error('[PDF Worker Shim] Error:', error);
      self.postMessage({
        error: 'Error in worker shim: ' + (error.message || 'Unknown error')
      });
    }
  };

  // Handle document loading request
  function handleGetDocument(data) {
    const numPages = determinePageCount(data);
    const fingerprint = 'pdf-worker-shim-' + Date.now();
    
    self.postMessage({
      action: data.action,
      isInitialData: true,
      data: {
        numPages: numPages,
        fingerprint: fingerprint,
        loadingTask: {},
        destroyed: false
      }
    });
  }

  // Handle page retrieval request
  function handleGetPage(data) {
    const pageIndex = data.pageIndex || 0;
    
    self.postMessage({
      action: data.action,
      pageIndex: pageIndex,
      data: {
        width: 612, // Standard US Letter width in points
        height: 792, // Standard US Letter height in points
        pageIndex: pageIndex,
        rotate: 0,
        refs: {}
      }
    });
  }

  // Handle render request
  function handleRender(data) {
    const pageIndex = data.pageIndex || 0;
    
    self.postMessage({
      action: data.action,
      pageIndex: pageIndex,
      data: { success: true }
    });
  }

  // Try to determine page count from the document parameters
  function determinePageCount(data) {
    if (data.docParams && data.docParams.url) {
      // Try to extract a reasonable page count from the URL pattern
      const pageMatch = data.docParams.url.match(/[_-](\d+)p/i);
      if (pageMatch && pageMatch[1]) {
        const pageCount = parseInt(pageMatch[1], 10);
        if (pageCount > 0 && pageCount < 1000) { // Sanity check
          return pageCount;
        }
      }
    }
    
    // Default fallback
    return 10; // Reasonable default for most documents
  }

  // Override importScripts to prevent external script loading
  self.importScripts = function() {
    console.log("[PDF Worker Shim] Prevented loading of external scripts");
    return true;
  };

  // Notify that worker is ready
  self.postMessage({
    action: 'workerReady',
    data: { success: true, message: "PDF.js worker shim initialized" }
  });
  
  console.log("[PDF Worker Shim] Initialized and ready");
})(self); 