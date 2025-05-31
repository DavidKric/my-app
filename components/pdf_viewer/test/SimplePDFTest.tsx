'use client';

import React, { useContext } from 'react';
import {
  ContextProvider,
  DocumentWrapper,
  PageWrapper,
  DocumentContext,
  RENDER_TYPE,
} from '@davidkric/pdf-components';
import '@davidkric/pdf-components/dist/style.css';

const PDF_URL = 'https://arxiv.org/pdf/2404.16130';

function PDFContent() {
  const { numPages } = useContext(DocumentContext);
  
  console.log('[SimplePDFTest] numPages:', numPages);
  
  return (
    <div className="w-full h-screen overflow-auto bg-gray-100">
      <DocumentWrapper file={PDF_URL} renderType={RENDER_TYPE.MULTI_CANVAS}>
        <React.Fragment>
          {Array.from({ length: numPages ?? 0 }).map((_, idx) => (
            <PageWrapper key={idx} pageIndex={idx} renderType={RENDER_TYPE.MULTI_CANVAS}>
              <React.Fragment />
            </PageWrapper>
          ))}
        </React.Fragment>
      </DocumentWrapper>
    </div>
  );
}

export default function SimplePDFTest() {
  console.log('[SimplePDFTest] Rendering...');
  
  return (
    <ContextProvider>
      <div className="fixed inset-0 w-screen h-screen">
        <h1 className="absolute top-4 left-4 z-10 bg-white px-4 py-2 rounded shadow">
          Simple PDF Test - Check Network Tab for Worker
        </h1>
        <PDFContent />
      </div>
    </ContextProvider>
  );
} 