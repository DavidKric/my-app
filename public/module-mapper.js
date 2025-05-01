/**
 * Module Import Mapper for PDF.js
 * 
 * This script directly intercepts and overrides specific dynamic imports
 * to work around PDF.js worker loading issues.
 */
(function() {
  console.log('[Module Mapper] Initializing...');
  
  // Define a mapping of problematic URLs to their replacements
  const MODULE_MAPPINGS = {
    // Map HTTP to HTTPS
    'http://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.js': 
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.js',
      
    // Provide backup mappings for other URLs
    'http://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.worker.min.js':
      'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.worker.min.js'
  };
  
  // Keep track of which modules we've tried to load
  const LOAD_ATTEMPTS = new Map();
  
  // Store the original dynamic import function
  const originalImport = window.import;
  
  // Create a stub module that won't break the application
  const createStubModule = () => {
    return Promise.resolve({
      default: {
        WorkerMessageHandler: {
          setup: function() {
            console.log('[Module Mapper] Using stub PDF worker handler');
          }
        }
      }
    });
  };
  
  // Function to preload a script
  const preloadScript = (url) => {
    return new Promise((resolve, reject) => {
      // If we've already tried this URL and failed, don't try again
      if (LOAD_ATTEMPTS.get(url) === false) {
        reject(new Error(`Already failed to load ${url}`));
        return;
      }
      
      console.log(`[Module Mapper] Preloading: ${url}`);
      const script = document.createElement('script');
      script.src = url;
      script.type = 'text/javascript';
      script.async = true;
      
      script.onload = () => {
        console.log(`[Module Mapper] Successfully loaded: ${url}`);
        LOAD_ATTEMPTS.set(url, true);
        resolve();
      };
      
      script.onerror = (e) => {
        console.warn(`[Module Mapper] Failed to load: ${url}`, e);
        LOAD_ATTEMPTS.set(url, false);
        reject(e);
      };
      
      document.head.appendChild(script);
    });
  };
  
  // Try to preload all mapped URLs
  Object.values(MODULE_MAPPINGS).forEach(url => {
    preloadScript(url).catch(() => console.warn(`[Module Mapper] Failed to preload: ${url}`));
  });
  
  // Also try to preload our local worker
  const localWorkerUrl = `${window.location.origin}/pdf.worker.min.js`;
  preloadScript(localWorkerUrl).catch(() => {
    console.warn('[Module Mapper] Failed to preload local worker, trying worker shim');
    
    const shimUrl = `${window.location.origin}/pdfjs-worker-shim.js`;
    preloadScript(shimUrl).catch(() => {
      console.error('[Module Mapper] All preload attempts failed');
    });
  });
  
  // Override the dynamic import function
  window.import = function(moduleSpecifier) {
    // Check if this is a PDF.js worker
    if (typeof moduleSpecifier === 'string' && (
        moduleSpecifier.includes('pdf.worker') || 
        moduleSpecifier.includes('pdfjs-dist')
    )) {
      console.log(`[Module Mapper] Intercepted import: ${moduleSpecifier}`);
      
      // Use mapped URL if available
      let targetUrl = MODULE_MAPPINGS[moduleSpecifier] || moduleSpecifier;
      
      // Try the properly mapped URL first
      console.log(`[Module Mapper] Trying import: ${targetUrl}`);
      
      return originalImport(targetUrl)
        .catch(error => {
          console.warn(`[Module Mapper] Failed to import: ${targetUrl}`, error);
          
          // Try our local worker next
          console.log(`[Module Mapper] Trying local worker fallback...`);
          return originalImport(localWorkerUrl)
            .catch(secondError => {
              console.warn('[Module Mapper] Local worker import failed:', secondError);
              
              // As a last resort, create a stub module to prevent application failure
              console.log('[Module Mapper] All imports failed, using stub module');
              return createStubModule();
            });
        });
    }
    
    // For all other imports, use the original function
    return originalImport.apply(this, arguments);
  };
  
  // Fix import() in Function constructor too
  const originalFunctionConstructor = window.Function.prototype.constructor;
  window.Function.prototype.constructor = function() {
    const code = arguments.length > 0 ? arguments[arguments.length - 1] : '';
    
    if (typeof code === 'string') {
      // Check for PDF.js worker imports
      if (code.includes('pdf.worker') || code.includes('pdfjs-dist')) {
        let modifiedCode = code;
        
        // Replace all HTTP imports with HTTPS
        modifiedCode = modifiedCode.replace(
          /(['"])http:\/\/([^'"]+)(['"])/g, 
          "'https://$2'"
        );
        
        // Add special handling for PDF.js dynamic imports
        modifiedCode = modifiedCode.replace(
          /import\s*\(\s*(['"])([^'"]+pdf\.worker[^'"]+)(['"])\s*\)/g,
          `
          (async function() {
            try {
              console.log('[Module Mapper] Dynamic import in code: $2');
              
              // Try direct import first
              try {
                return await import('https://' + $2.replace(/^https?:\\/\\//, ''));
              } catch (e) {
                console.warn('[Module Mapper] Direct import failed:', e);
                
                // Try local worker
                try {
                  return await import('${localWorkerUrl}');
                } catch (e2) {
                  console.warn('[Module Mapper] Local import failed:', e2);
                  
                  // Return stub as last resort
                  return {
                    default: {
                      WorkerMessageHandler: {
                        setup: function() {
                          console.log('[Module Mapper] Using stub worker from code mapper');
                        }
                      }
                    }
                  };
                }
              }
            } catch (error) {
              console.error('[Module Mapper] All import attempts failed:', error);
              
              // Return minimal stub
              return { default: {} };
            }
          })()
          `
        );
        
        // Replace the code
        if (arguments.length > 0) {
          arguments[arguments.length - 1] = modifiedCode;
        }
      }
    }
    
    // Pass to original constructor
    return originalFunctionConstructor.apply(this, arguments);
  };
  
  console.log('[Module Mapper] Initialization complete');
})(); 