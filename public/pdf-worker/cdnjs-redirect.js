// This script intercepts the specific CDN request that Allen AI is making
(function() {
  const cdnUrl = 'cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.269/pdf.worker.min.js';
  const localUrl = '/pdf-worker/pdf.worker.min.mjs';
  
  // Save original fetch
  const originalFetch = window.fetch;
  
  // Override fetch to redirect CDN requests
  window.fetch = function(url, options) {
    if (typeof url === 'string' && url.includes(cdnUrl)) {
      console.log('Intercepting CDN request:', url);
      console.log('Redirecting to local file:', localUrl);
      return originalFetch(localUrl, options);
    }
    return originalFetch.apply(this, arguments);
  };
  
  // Also patch XMLHttpRequest
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    if (typeof url === 'string' && url.includes(cdnUrl)) {
      console.log('Intercepting XHR CDN request:', url);
      url = localUrl;
    }
    return originalOpen.call(this, method, url, ...args);
  };
  
  // Intercept dynamic imports via Error.prepareStackTrace
  const originalPrepareStackTrace = Error.prepareStackTrace;
  if (originalPrepareStackTrace) {
    Error.prepareStackTrace = function(error, stack) {
      if (error.message && error.message.includes(cdnUrl)) {
        console.log('Intercepted dynamic import error for CDN');
        error.message = error.message.replace(cdnUrl, localUrl);
      }
      return originalPrepareStackTrace(error, stack);
    };
  }
  
  // Set up a global interception for require/import
  const originalImport = window.import;
  if (originalImport) {
    window.import = function(url) {
      if (url.includes(cdnUrl)) {
        console.log('Intercepting import for CDN URL:', url);
        return import(localUrl);
      }
      return originalImport.apply(this, arguments);
    };
  }
  
  console.log('CDN interception setup complete');
})(); 