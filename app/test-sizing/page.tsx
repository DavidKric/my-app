'use client';

import React from 'react';
import {
  ContextProvider,
  DocumentWrapper,
  PageWrapper,
  DocumentContext,
  RENDER_TYPE
} from '@davidkric/pdf-components';

function PDFTest() {
  return (
    <div className="w-full h-screen bg-gray-100">
      <div className="p-4 bg-white border-b">
        <h1 className="text-xl font-bold">PDF Library Defaults Test</h1>
        <p className="text-sm text-gray-600">Using davidkric library defaults with MULTI_CANVAS</p>
      </div>
      
      <div className="flex-1 overflow-auto">
        <ContextProvider>
          <DocumentWrapper 
            file="/api/proxy/pdf?url=https%3A%2F%2Farxiv.org%2Fpdf%2F2404.16130"
            renderType={RENDER_TYPE.MULTI_CANVAS}
          >
            <PDFCore />
          </DocumentWrapper>
        </ContextProvider>
      </div>
    </div>
  );
}

function PDFCore() {
  const { numPages } = React.useContext(DocumentContext);
  
  if (!numPages) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p>Loading PDF...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center py-4 space-y-4">
      {Array.from({ length: Math.min(3, numPages) }, (_, i) => (
        <div key={i} className="shadow-lg bg-white">
          <PageWrapper 
            pageIndex={i} 
            renderType={RENDER_TYPE.MULTI_CANVAS}
          />
        </div>
      ))}
    </div>
  );
}

export default PDFTest; 