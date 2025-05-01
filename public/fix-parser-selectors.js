/**
 * Parser Selectors Fix
 * This script fixes common parser selector issues with PDF viewer components
 */

(function() {
  console.log('[Parser Fix] Initializing parser selectors fix...');
  
  // Fix function to apply to the document
  function fixParsers(rootNode) {
    try {
      // Find all PDF page elements
      const pdfElements = rootNode.querySelectorAll('[data-page-number]');
      if (pdfElements && pdfElements.length > 0) {
        console.log('[Parser Fix] Found PDF elements:', pdfElements.length);
        
        pdfElements.forEach(elem => {
          // Ensure the element has the necessary classes
          if (!elem.classList.contains('page')) {
            elem.classList.add('page');
          }
          
          // Add annotation-ready attributes
          if (!elem.hasAttribute('data-parser-id')) {
            elem.setAttribute('data-parser-id', `page-${elem.getAttribute('data-page-number')}`);
          }
          
          // Ensure text layer is properly configured
          const textLayer = elem.querySelector('.textLayer, .react-pdf__Page__textContent');
          if (textLayer) {
            textLayer.setAttribute('data-parser-target', 'true');
            // Make sure text nodes are selectable
            const textNodes = textLayer.querySelectorAll('span');
            textNodes.forEach(node => {
              node.style.userSelect = 'text';
              node.style.cursor = 'text';
            });
          }
        });
        
        console.log('[Parser Fix] Fixed page elements');
      }
      
      // Fix annotation containers
      const annotationContainers = rootNode.querySelectorAll('.react-pdf__Page__annotations');
      if (annotationContainers && annotationContainers.length > 0) {
        annotationContainers.forEach(container => {
          if (!container.hasAttribute('data-parser-annotations')) {
            container.setAttribute('data-parser-annotations', 'true');
          }
        });
      }
    } catch (e) {
      console.warn('[Parser Fix] Error while fixing parser selectors:', e);
    }
  }
  
  // Run on DOM ready
  function onDOMReady() {
    fixParsers(document.body);
    console.log('[Parser Fix] Initial parser fix applied');
  }
  
  // Run on each DOM mutation
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) { // Element node
            fixParsers(node);
          }
        });
      }
    });
  });
  
  // Set up initial run and observer
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onDOMReady);
  } else {
    onDOMReady();
  }
  
  // Start observing the document
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Create a global helper function for manual fixing
  window.fixParserSelectors = function(rootElement) {
    fixParsers(rootElement || document.body);
    return true;
  };
  
  console.log('[Parser Fix] Parser selectors fix initialized');
})(); 