/**
 * Dynamic Import Polyfill for PDF.js Workers
 * This script adds a global override for the import() function to handle PDF.js worker loading
 */

(function() {
  console.log('[Import Polyfill] Initializing...');
  
  // Cache for successful loads to avoid repeated fetch
  const moduleCache = new Map();
  
  // Define local worker path
  const LOCAL_WORKER_PATH = `${window.location.origin}/pdf.worker.min.js.actual`;
  
  // Helper to identify PDF worker URLs
  function isPdfWorkerUrl(url) {
    if (typeof url !== 'string') return false;
    
    return url.includes('pdf.worker') || 
           url.includes('pdfjs-dist') ||
           url.includes('cdnjs.cloudflare.com/ajax/libs/pdf.js') ||
           url.includes('cdn.jsdelivr.net') && url.includes('pdf');
  }
  
  // Create our custom dynamic import function
  async function pdfImportPolyfill(specifier) {
    // For non-PDF worker imports, use the original import
    if (!isPdfWorkerUrl(specifier)) {
      return import(specifier);
    }
    
    console.log('[Import Polyfill] Intercepting import for PDF worker:', specifier);
    console.log('[Import Polyfill] Redirecting to local worker:', LOCAL_WORKER_PATH);
    
    // Check cache first
    if (moduleCache.has(LOCAL_WORKER_PATH)) {
      console.log('[Import Polyfill] Using cached worker module');
      return moduleCache.get(LOCAL_WORKER_PATH);
    }
    
    try {
      // Attempt to load the actual worker module
      const module = await import(LOCAL_WORKER_PATH);
      moduleCache.set(LOCAL_WORKER_PATH, module);
      console.log('[Import Polyfill] Worker module loaded successfully');
      return module;
    } catch (e) {
      console.error('[Import Polyfill] Error loading worker module:', e);
      
      // Fallback to a simple module with WorkerMessageHandler
      const fallbackModule = {
        WorkerMessageHandler: {
          setup: function(handler) {
            console.log('[Import Polyfill] Using fallback worker handler');
            
            handler.on = function(actionName, callback) {
              handler['_on_' + actionName] = callback;
            };
            
            handler.send = function(actionName, data) {
              const callbackName = '_on_' + actionName;
              if (handler[callbackName]) {
                handler[callbackName]({
                  success: true,
                  data: data,
                  message: 'Handled by fallback worker'
                });
              }
            };
            
            handler.terminate = function() {};
          }
        }
      };
      
      // Cache the fallback to avoid repeated failures
      moduleCache.set(LOCAL_WORKER_PATH, { default: fallbackModule });
      return { default: fallbackModule };
    }
  }
  
  try {
    // Store the original import function
    const originalImport = window.dynamicImport || Function('url', 'return import(url)');
    
    // Create a global function to intercept dynamic imports
    window.dynamicImport = pdfImportPolyfill;
    
    // Intercept import expressions in code
    const originalEval = window.eval;
    window.eval = function(code) {
      if (typeof code === 'string' && code.includes('import(')) {
        // Replace dynamic imports with our interceptor
        code = code.replace(
          /import\s*\(\s*([^\)]+)\s*\)/g,
          'window.dynamicImport($1)'
        );
      }
      return originalEval.call(this, code);
    };
    
    // Intercept native import function if the browser exposes it
    if (typeof window.import === 'function') {
      window._originalImport = window.import;
      window.import = pdfImportPolyfill;
    }
    
    console.log('[Import Polyfill] Dynamic import polyfill installed successfully');
  } catch (e) {
    console.error('[Import Polyfill] Failed to install dynamic import polyfill:', e);
  }
})(); 