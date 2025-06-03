'use client';

import React from 'react';
import {
  ContextProvider,
  DocumentWrapper,
  PageWrapper,
  DocumentContext,
  RENDER_TYPE
} from '@davidkric/pdf-components';

function ComparisonPage() {
  return (
    <div className="w-full h-screen bg-gray-100">
      <div className="p-4 bg-white border-b">
        <h1 className="text-xl font-bold">Render Type Comparison</h1>
        <p className="text-sm text-gray-600">Side-by-side comparison of SINGLE_CANVAS vs MULTI_CANVAS</p>
      </div>
      
      <div className="flex h-full">
        {/* Single Canvas (Bad) */}
        <div className="w-1/2 border-r">
          <div className="p-2 bg-red-100 border-b">
            <h3 className="font-medium text-red-800">SINGLE_CANVAS (Broken)</h3>
          </div>
          <div className="h-full overflow-auto">
            <ContextProvider>
              <DocumentWrapper 
                file="/api/proxy/pdf?url=https%3A%2F%2Farxiv.org%2Fpdf%2F2404.16130"
                renderType={RENDER_TYPE.SINGLE_CANVAS}
              >
                <SingleCanvasPDF />
              </DocumentWrapper>
            </ContextProvider>
          </div>
        </div>
        
        {/* Multi Canvas (Good) */}
        <div className="w-1/2">
          <div className="p-2 bg-green-100 border-b">
            <h3 className="font-medium text-green-800">MULTI_CANVAS (Correct)</h3>
          </div>
          <div className="h-full overflow-auto">
            <ContextProvider>
              <DocumentWrapper 
                file="/api/proxy/pdf?url=https%3A%2F%2Farxiv.org%2Fpdf%2F2404.16130"
                renderType={RENDER_TYPE.MULTI_CANVAS}
              >
                <MultiCanvasPDF />
              </DocumentWrapper>
            </ContextProvider>
          </div>
        </div>
      </div>
    </div>
  );
}

function SingleCanvasPDF() {
  const { numPages } = React.useContext(DocumentContext);
  
  if (!numPages) {
    return <div className="p-4">Loading single canvas...</div>;
  }
  
  return (
    <div className="flex flex-col items-center py-4 space-y-4">
      {Array.from({ length: Math.min(2, numPages) }, (_, i) => (
        <div key={i} className="shadow-lg bg-white">
          <PageWrapper 
            pageIndex={i} 
            renderType={RENDER_TYPE.SINGLE_CANVAS}
          />
        </div>
      ))}
    </div>
  );
}

function MultiCanvasPDF() {
  const { numPages } = React.useContext(DocumentContext);
  
  if (!numPages) {
    return <div className="p-4">Loading multi canvas...</div>;
  }
  
  return (
    <div className="flex flex-col items-center py-4 space-y-4">
      {Array.from({ length: Math.min(2, numPages) }, (_, i) => (
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

export default ComparisonPage; 