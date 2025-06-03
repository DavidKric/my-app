'use client';

import React, { useContext, useEffect, useState } from 'react';
import { 
  DocumentWrapper, 
  PageWrapper, 
  DocumentContext,
  TransformContext,
  Overlay,
  RENDER_TYPE
} from '@davidkric/pdf-components';

interface PDFComponentsProps {
  fileUrl: string | null;
  pdfData?: Uint8Array | null;  
  currentPage?: number;
  onDocumentLoadSuccess?: (data: { numPages: number; outline?: any[] }) => void;
  onDocumentLoadError?: (error: Error) => void;
  onPageChange?: (page: number) => void;
  annotations?: any[];
  activeAnnotationTool?: string | null;
  onTextSelection?: (text: string, boundingRect: any, pageNumber: number) => void;
  onAnnotationSelected?: (annotation: any) => void;
}

// PDF rendering component that follows the exact same pattern as the working demo
const PDFCore: React.FC<{ annotations?: any[]; onTextSelection?: (text: string, boundingRect: any, pageNumber: number) => void; onAnnotationSelected?: (annotation: any) => void }> = ({ 
  annotations = [],
  onTextSelection,
  onAnnotationSelected 
}) => {
  const { numPages } = useContext(DocumentContext);

  if (!numPages) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p>Loading PDF...</p>
        </div>
      </div>
    );
  }

  // Follow the exact same pattern as nextjs-pdf-viewer demo
  return (
    <div className="flex flex-col items-center w-full">
      {Array.from({ length: numPages }).map((_, pageIndex) => (
        <div key={pageIndex} className="w-full flex justify-center">
          <PageWrapper
            pageIndex={pageIndex}
            renderType={RENDER_TYPE.MULTI_CANVAS}
          >
            {/* Only add overlays for annotations - let library handle PDF display */}
            <Overlay>
              <div className="pdf-annotations-container" data-page={pageIndex + 1}>
                {/* This div serves as a container for external annotation overlays */}
              </div>
            </Overlay>
          </PageWrapper>
        </div>
      ))}
    </div>
  );
};

const PDFComponents: React.FC<PDFComponentsProps> = ({ 
  fileUrl, 
  pdfData, 
  annotations,
  onTextSelection,
  onAnnotationSelected
}) => {
  if (!fileUrl && !pdfData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600">
          <p>Error: No PDF file provided</p>
        </div>
      </div>
    );
  }

  return (
    <DocumentWrapper 
      file={fileUrl || undefined} 
      renderType={RENDER_TYPE.MULTI_CANVAS}
    >
      <PDFCore 
        annotations={annotations}
        onTextSelection={onTextSelection}
        onAnnotationSelected={onAnnotationSelected}
      />
    </DocumentWrapper>
  );
};

export default PDFComponents; 