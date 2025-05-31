'use client';

import React, { useContext, useState, useCallback, useEffect } from 'react';
import {
  ContextProvider,
  DocumentWrapper,
  PageWrapper,
  DocumentContext,
  RENDER_TYPE,
} from '@davidkric/pdf-components';
import '@davidkric/pdf-components/dist/style.css';

interface SimplePDFViewerProps {
  fileUrl: string;
  onDocumentLoad?: (numPages: number) => void;
  onPageChange?: (page: number) => void;
  className?: string;
}

/**
 * SimplePDFCore - The core PDF rendering component that must be inside ContextProvider
 * This follows the exact pattern from the working demo with a workaround for hooks violation
 */
function SimplePDFCore({ fileUrl, onDocumentLoad, onPageChange, className }: SimplePDFViewerProps) {
  const { numPages } = useContext(DocumentContext);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Stable state to prevent PageWrapper component unmounting/remounting
  const [stableNumPages, setStableNumPages] = useState<number | null>(null);
  const [documentReady, setDocumentReady] = useState(false);

  // Only update stableNumPages when numPages is actually available and valid
  useEffect(() => {
    if (numPages && numPages > 0 && !stableNumPages) {
      setStableNumPages(numPages);
      setDocumentReady(true);
    }
  }, [numPages, stableNumPages]);

  // Notify parent when document loads
  useEffect(() => {
    if (stableNumPages && stableNumPages > 0 && onDocumentLoad) {
      onDocumentLoad(stableNumPages);
    }
  }, [stableNumPages, onDocumentLoad]);

  // Handle page visibility changes (simplified)
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    if (onPageChange) {
      onPageChange(page);
    }
  }, [onPageChange]);

  console.log('[SimplePDF] Rendering with fileUrl:', fileUrl, 'numPages:', numPages, 'stableNumPages:', stableNumPages, 'documentReady:', documentReady);

  if (!fileUrl) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        <p>No PDF file provided</p>
      </div>
    );
  }

  return (
    <div className={`simple-pdf-viewer w-full h-full ${className || ''}`}>
      {/* Debug info */}
      <div className="bg-blue-600 text-white p-2 text-xs mb-2">
        <strong>SimplePDF Debug:</strong> URL: {fileUrl} | Pages: {stableNumPages || 'Loading...'} | Ready: {documentReady.toString()}
      </div>
      
      {/* PDF Document - Only render PageWrapper components when document is completely ready */}
      <div className="w-full h-full overflow-auto bg-gray-100">
        <DocumentWrapper file={fileUrl} renderType={RENDER_TYPE.MULTI_CANVAS}>
          <React.Fragment>
            {documentReady && stableNumPages ? (
              // Only render when we have stable page count - prevents hooks violation
              Array.from({ length: stableNumPages }).map((_, pageIndex) => (
                <PageWrapper 
                  key={pageIndex} 
                  pageIndex={pageIndex} 
                  renderType={RENDER_TYPE.MULTI_CANVAS}
                >
                  <React.Fragment>
                    {/* Empty children to match working demo pattern */}
                  </React.Fragment>
                </PageWrapper>
              ))
            ) : (
              // Loading state - no PageWrapper components to avoid hooks issues
              <div className="flex items-center justify-center h-96 text-gray-500">
                <p>Loading PDF pages...</p>
              </div>
            )}
          </React.Fragment>
        </DocumentWrapper>
      </div>
    </div>
  );
}

/**
 * SimplePDFViewer - The main component that wraps everything in ContextProvider
 * This is the component that should be used by consumers
 */
export default function SimplePDFViewer(props: SimplePDFViewerProps) {
  return (
    <ContextProvider>
      <SimplePDFCore {...props} />
    </ContextProvider>
  );
} 