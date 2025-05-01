'use client';

// Import the centralized PDF setup - this now configures the worker path
import '@/lib/pdf-setup';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
// Import Document and Page from react-pdf
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

import { AnnotationOverlay, Annotation, AnnotationType } from '../annotations/AnnotationOverlay';
import PDFErrorBoundary from './PDFErrorBoundary';
import { Loader2, AlertTriangle } from 'lucide-react';

// Types remain the same
interface PDFComponentsProps {
  fileUrl: string;
  currentPage: number;
  scale: number;
  rotation?: number;
  onDocumentLoadSuccess: (data: { numPages: number, outline?: any[] }) => void;
  onDocumentLoadError?: (err: Error) => void;
  onPageChange?: (pageNumber: number) => void;
  activeAnnotationTool?: AnnotationType | null;
  annotations?: Annotation[];
  onTextSelection?: (selectedText: string, boundingRect: any, pageNumber: number) => void;
  onAnnotationSelected?: (annotation: Annotation) => void;
}

// Normalize function remains the same
const normalizeFileUrl = (url: string): string => {
  if (!url) {
    console.error('[normalizeFileUrl] No URL provided');
    return '';
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (typeof window === 'undefined') {
    return url; // Cannot resolve further without window
  }
  // Ensure it starts with a slash if it's a local path
  if (!url.startsWith('/')) {
      url = '/' + url;
  }
  // Avoid double origin if url already contains it (e.g. from proxy)
  if (url.startsWith(window.location.origin)) {
      return url;
  }
  // Construct full URL for relative/absolute paths
  try {
    // Use URL constructor for robust handling
    return new URL(url, window.location.origin).toString();
  } catch (e) {
    console.error(`[normalizeFileUrl] Failed to construct URL for: ${url}`, e);
    return url; // Fallback to original url if construction fails
  }
};

export default function PDFComponents({ 
  fileUrl, 
  currentPage, 
  scale, 
  rotation = 0,
  onDocumentLoadSuccess,
  onDocumentLoadError,
  // onPageChange not used directly by react-pdf,
  activeAnnotationTool,
  annotations = [],
  onTextSelection,
  onAnnotationSelected
}: PDFComponentsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());

  // Normalize the URL once
  const normalizedFileUrl = useMemo(() => normalizeFileUrl(fileUrl), [fileUrl]);
  
  // Log worker configuration on mount
  useEffect(() => {
    console.log('[PDF Components] Initializing with worker src:', pdfjs.GlobalWorkerOptions.workerSrc || 'NOT SET');
  }, []);

  // Simplify the options object for react-pdf Document
  const pdfOptions = useMemo(() => ({
    cMapUrl: 'https://unpkg.com/pdfjs-dist/cmaps/',
    cMapPacked: true
  }), []);

  // Handle document load success
  const handleLoadSuccess = useCallback((pdf: any) => {
    console.log(`[PDF Components] Document loaded successfully. Pages: ${pdf.numPages}`);
    setNumPages(pdf.numPages);
    setLoading(false);
    setError(null);
    if (onDocumentLoadSuccess) {
      onDocumentLoadSuccess({ numPages: pdf.numPages, outline: [] });
    }
  }, [onDocumentLoadSuccess]);

  // Handle document load error - simplified
  const handleLoadError = useCallback((err: Error) => {
    console.error('[PDF Components] Error loading document:', err);
    setError(`Failed to load PDF: ${err.message}`);
    setLoading(false);
    if (onDocumentLoadError) {
      onDocumentLoadError(err);
    }
  }, [onDocumentLoadError]);

  // Text selection handler - simplified
  const handleTextSelect = useCallback(() => {
    if (!onTextSelection || !activeAnnotationTool) return;
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    selection.removeAllRanges();
  }, [onTextSelection, activeAnnotationTool]);

  // Page ref setter
  const setPageRef = useCallback((pageNumber: number, element: HTMLDivElement | null) => {
    if (element) {
      pageRefs.current.set(pageNumber, element);
    } else {
      pageRefs.current.delete(pageNumber);
    }
  }, []);

  // Loading indicator
  const LoadingIndicator = useCallback(() => (
    <div className="w-full h-full flex items-center justify-center min-h-96 absolute top-0 left-0 z-10 bg-background/80">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
        <p>Loading PDF document...</p>
      </div>
    </div>
  ), []);

  // Error display
  const ErrorDisplay = useCallback(({ message }: { message: string }) => (
    <div className="w-full h-full flex items-center justify-center min-h-96 p-4">
      <div className="text-center max-w-lg p-6 bg-destructive/10 border border-destructive/30 rounded-lg">
        <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
        <p className="text-destructive font-semibold text-lg mb-2">Error loading PDF</p>
        <p className="text-sm text-destructive/90 mb-3">{message}</p>
        <button 
          className="mt-4 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          onClick={() => window.location.reload()}
        >
          Reload Page
        </button>
      </div>
    </div>
  ), []);

  return (
    <div 
      className="pdf-container w-full h-full relative overflow-auto" 
      ref={containerRef} 
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {/* Show error overlay if error exists */}
      {error && !loading && <ErrorDisplay message={error} />}
      
      {/* Render PDF document */}
      <Document
        file={normalizedFileUrl}
        onLoadSuccess={handleLoadSuccess}
        onLoadError={handleLoadError}
        loading={<LoadingIndicator />}
        options={pdfOptions}
        className={error ? "hidden" : ""}
      >
        {Array.from(new Array(numPages), (_, index) => {
          const pageNumber = index + 1;
          
          // Render only current page and 1 page before/after for performance
          const isVisible = Math.abs(pageNumber - currentPage) <= 1;

          return (
            <div 
              key={`page-container-${pageNumber}`}
              ref={(el) => setPageRef(pageNumber, el)}
              className="pdf-page-container flex justify-center mb-4"
            >
              <PDFErrorBoundary>
                <div 
                  className="relative pdf-page-wrapper"
                  onMouseUp={handleTextSelect}
                >
                  {isVisible ? (
                    <Page
                      key={`page_${pageNumber}`}
                      pageNumber={pageNumber}
                      scale={scale}
                      rotate={rotation}
                      renderAnnotationLayer={false} // Disable for first attempt
                      renderTextLayer={false}       // Disable for first attempt
                      className="bg-white shadow-md"
                      loading={
                        <div 
                          className="bg-muted/30 animate-pulse shadow-md" 
                          style={{ 
                            width: `${scale * 595}px`, 
                            height: `${scale * 842}px` 
                          }}
                        />
                      }
                    />
                  ) : (
                    <div 
                      className="w-full bg-muted/20 shadow-md"
                      style={{ 
                        width: `${scale * 595}px`,
                        height: `${scale * 842}px`
                      }}
                    />
                  )}
                  
                  {/* Annotation Overlay - only for visible current page */}
                  {isVisible && pageNumber === currentPage && annotations && annotations.length > 0 && (
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                      <AnnotationOverlay 
                        annotations={annotations.filter(a => a.pageNumber === pageNumber)}
                        scale={scale}
                        onAnnotationClick={onAnnotationSelected}
                        currentPage={pageNumber}
                      />
                    </div>
                  )}
                </div>
              </PDFErrorBoundary>
            </div>
          );
        })}
      </Document>
    </div>
  );
} 