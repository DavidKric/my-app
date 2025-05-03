'use client';

// Import the PDF setup file which configures the PDF.js worker
import '@/lib/pdf-setup';

import React, { useState, useEffect, useCallback, useRef, useMemo, useContext } from 'react';
// Use only AllenAI PDF Components imports - no direct react-pdf imports
import { 
  DocumentWrapper, 
  PageWrapper, 
  HighlightOverlay,
  BoundingBox,
  RENDER_TYPE,
  TransformContext,
  ScrollContext,
  DocumentContext,
  UiContext,
  Overlay,
  computeBoundingBoxStyle,
  ContextProvider
} from '@allenai/pdf-components';

import { AnnotationOverlay, Annotation, AnnotationType } from '../annotations/AnnotationOverlay';
import PDFErrorBoundary from './PDFErrorBoundary';
import { Loader2, AlertTriangle } from 'lucide-react';

// Types
interface PDFComponentsProps {
  fileUrl?: string;
  pdfData?: Uint8Array | null;  
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

// Normalize URL function
const normalizeFileUrl = (url: string): string => {
  if (!url) {
    console.log('[PDF] No URL provided');
    return '';
  }
  
  // Already a full URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Server-side rendering
  if (typeof window === 'undefined') {
    return url;
  }
  
  // Ensure local path starts with slash
  if (!url.startsWith('/')) {
    url = '/' + url;
  }
  
  // Avoid double origin
  if (url.startsWith(window.location.origin)) {
    return url;
  }
  
  // Create full URL
  try {
    return new URL(url, window.location.origin).toString();
  } catch (e) {
    console.error(`[PDF] Failed to normalize URL: ${url}`, e);
    return url;
  }
};

export default function PDFComponents({ 
  fileUrl, 
  pdfData, 
  currentPage, 
  scale, 
  rotation = 0,
  onDocumentLoadSuccess,
  onDocumentLoadError,
  onPageChange,
  activeAnnotationTool,
  annotations = [],
  onTextSelection,
  onAnnotationSelected
}: PDFComponentsProps) {
  // Use contexts from AllenAI library
  const documentContext = useContext(DocumentContext);
  const scrollContext = useContext(ScrollContext);
  const uiContext = useContext(UiContext);
  const transformContext = useContext(TransformContext);
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefsMap = useRef<Map<number, HTMLDivElement | null>>(new Map());
  
  // Get values from contexts
  const { 
    setNumPages: setDocNumPages, 
    setOutline: setDocOutline, 
    setPdfDocProxy
  } = documentContext || {};
  
  const { 
    visiblePageRatios = new Map(), 
    pagesScrolledIntoView 
  } = scrollContext || {};
  
  const { 
    isLoading: uiIsLoading, 
    setIsLoading: setUiIsLoading,
    setErrorMessage
  } = uiContext || {};

  // Normalize URL once
  const normalizedFileUrl = useMemo(() => {
    return normalizeFileUrl(fileUrl || '');
  }, [fileUrl]);
  
  // Memoized callback for setting the page ref
  const setPageRef = useCallback((pageNumber: number, node: HTMLDivElement | null) => {
    // Store the ref in our Map
    if (node !== null) {
      pageRefsMap.current.set(pageNumber, node);
    } else {
      pageRefsMap.current.delete(pageNumber);
    }
  }, []);

  // Handle document load success
  const handleLoadSuccess = useCallback((pdfDoc: any) => {
    console.log(`[PDF] Document loaded successfully with ${pdfDoc.numPages} pages`);
    const numPages = pdfDoc.numPages || 0;
    const outline = pdfDoc.outline || [];
    
    // Set local state
    setNumPages(numPages);
    setLoading(false);
    setError(null);
    
    // Update context state if available
    if (setDocNumPages) setDocNumPages(numPages);
    if (setDocOutline) setDocOutline(outline);
    if (setPdfDocProxy) setPdfDocProxy(pdfDoc);
    
    // Notify parent
    if (onDocumentLoadSuccess) {
      onDocumentLoadSuccess({ 
        numPages: numPages, 
        outline: outline 
      });
    }
  }, [onDocumentLoadSuccess, setDocNumPages, setDocOutline, setPdfDocProxy]);

  // Handle document load error
  const handleLoadError = useCallback((err: Error) => {
    console.error('[PDF] Error loading document:', err.message);
    setError(`Failed to load PDF: ${err.message}`);
    setLoading(false);
    
    // Update context state if available
    if (setErrorMessage) setErrorMessage(err.message);
    
    if (onDocumentLoadError) {
      onDocumentLoadError(err);
    }
  }, [setErrorMessage, onDocumentLoadError]);

  // Determine what to pass as the file prop
  const fileSource = useMemo(() => {
    if (pdfData && pdfData.byteLength > 0) {
      return { data: pdfData };
    }
    
    if (!normalizedFileUrl) {
      setError('No valid PDF source provided');
      return undefined;
    }
    
    return normalizedFileUrl;
  }, [pdfData, normalizedFileUrl]);

  // Handle visible pages changes for pagination
  useEffect(() => {
    if (visiblePageRatios.size > 0 && onPageChange) {
      // Find the most visible page (highest visibility ratio)
      let maxVisibility = 0;
      let mostVisiblePage = currentPage;
      
      for (const [page, ratio] of visiblePageRatios.entries()) {
        if (ratio > maxVisibility) {
          maxVisibility = ratio;
          mostVisiblePage = page;
        }
      }
      
      // Only call onPageChange if the most visible page has changed
      if (mostVisiblePage !== currentPage) {
        onPageChange(mostVisiblePage);
      }
    }
  }, [visiblePageRatios, currentPage, onPageChange]);

  // Handle text selection for annotations
  const handleTextSelection = useCallback((pageNumber: number) => (e: React.MouseEvent) => {
    if (!onTextSelection || !activeAnnotationTool) return;
    
    // Get the selection from the window
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
    
    // Get the selected text
    const selectedText = selection.toString().trim();
    if (!selectedText) return;
    
    // Get the parent PDF container
    const pdfContainer = pageRefsMap.current.get(pageNumber);
    if (!pdfContainer) return;
    
    // Get the selection range and its bounding client rect
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // Calculate position relative to the PDF container
    const containerRect = pdfContainer.getBoundingClientRect();
    const boundingRect = {
      x: rect.left - containerRect.left,
      y: rect.top - containerRect.top,
      width: rect.width,
      height: rect.height,
      pageNumber
    };
    
    // Call the callback with selected text and position
    onTextSelection(selectedText, boundingRect, pageNumber);
    
    // Clear selection
    selection.removeAllRanges();
  }, [onTextSelection, activeAnnotationTool]);

  // Loading indicator
  const LoadingIndicator = useCallback(() => (
    <div className="w-full h-full flex items-center justify-center min-h-96 absolute top-0 left-0 z-10 bg-background/80">
      <div className="text-center max-w-md">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
        <p className="mb-2">Loading PDF document...</p>
      </div>
    </div>
  ), []);

  // Error display
  const ErrorDisplay = useCallback(() => (
    <div className="w-full h-full flex items-center justify-center min-h-96 p-4">
      <div className="text-center max-w-lg p-6 bg-destructive/10 border border-destructive/30 rounded-lg">
        <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
        <p className="text-destructive font-semibold text-lg mb-2">Error Loading PDF</p>
        <p className="text-sm text-destructive/90 mb-3">{error}</p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-2">
          <button 
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
          
          {normalizedFileUrl && (
            <button
              className="px-4 py-2 text-sm bg-muted text-muted-foreground rounded-md"
              onClick={() => window.open(normalizedFileUrl, '_blank')}
            >
              Open Directly
            </button>
          )}
        </div>
      </div>
    </div>
  ), [error, normalizedFileUrl]);

  // Show loading indicator while loading
  if (loading) {
    return <LoadingIndicator />;
  }

  // Show error display if there's an error
  if (error) {
    return <ErrorDisplay />;
  }

  // Check for valid file source
  if (!fileSource) {
    console.error('[PDF] No valid file source available:', { fileUrl, normalizedFileUrl });
    return (
      <div className="w-full h-full flex items-center justify-center min-h-96 p-4">
        <div className="text-center max-w-lg p-6 bg-amber-500/10 border border-amber-300 rounded-lg">
          <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
          <p className="font-semibold text-lg mb-2">PDF Source Missing</p>
          <p className="text-sm mb-3">No valid PDF source was provided. Please check the console for details.</p>
        </div>
      </div>
    );
  }

  // Log information for debugging
  console.log('[PDF] Rendering with file source:', fileSource);

  // Filter annotations for the current page to keep rendering efficient
  const currentPageAnnotations = annotations.filter(a => a.pageNumber === currentPage);

  // Main PDF viewer using AllenAI components
  return (
    <ContextProvider>
      <div 
        className="pdf-container w-full h-full relative overflow-auto" 
        ref={containerRef}
      >
        {/* Development debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed top-2 right-2 bg-black/80 text-white p-2 rounded text-xs z-50 max-w-xs overflow-hidden">
            <div>URL: {normalizedFileUrl?.substring(0, 30)}...</div>
            <div>Pages: {numPages}, Current: {currentPage}</div>
            <div>Loading: {loading ? 'Yes' : 'No'}</div>
            <div>Error: {error ? 'Yes' : 'No'}</div>
          </div>
        )}
        
        {/* Main PDF Document component using AllenAI's DocumentWrapper */}
        <DocumentWrapper 
          file={fileSource}
          onLoadSuccess={handleLoadSuccess}
          onLoadError={handleLoadError}
          renderType={RENDER_TYPE.SINGLE_CANVAS}
          className={error ? "hidden" : ""}
        >
          {Array.from(new Array(numPages || 0), (_, index) => {
            const pageNumber = index + 1;
            
            // Check if we should render this page (for performance)
            const shouldRenderPage = 
              Math.abs(pageNumber - currentPage) <= 2 || // Render nearby pages
              visiblePageRatios.has(pageNumber);         // And visible pages
            
            return (
              <div 
                key={`page-container-${pageNumber}`}
                ref={node => setPageRef(pageNumber, node)}
                className="pdf-page-container flex justify-center mb-4"
                data-page-number={pageNumber}
              >
                {shouldRenderPage ? (
                  <PDFErrorBoundary>
                    <div 
                      className="relative" 
                      data-pdf-page={pageNumber}
                      onMouseUp={handleTextSelection(pageNumber)}
                    >
                      {/* Main PDF Page using AllenAI's PageWrapper */}
                      <PageWrapper
                        key={`page_${pageNumber}`}
                        pageIndex={pageNumber - 1} // PageWrapper uses 0-indexed pages
                        renderType={RENDER_TYPE.SINGLE_CANVAS}
                        className={`bg-white shadow-md ${rotation ? `rotate-${rotation}` : ''}`}
                      />
                      
                      {/* Annotation Overlay */}
                      {pageNumber === currentPage && currentPageAnnotations.length > 0 && (
                        <div className="absolute top-0 left-0 right-0 bottom-0">
                          <AnnotationOverlay 
                            annotations={currentPageAnnotations}
                            scale={scale}
                            onAnnotationClick={onAnnotationSelected}
                            currentPage={pageNumber}
                          />
                        </div>
                      )}
                    </div>
                  </PDFErrorBoundary>
                ) : (
                  <div 
                    className="w-full bg-muted/20 animate-pulse shadow-md"
                    style={{ 
                      height: '800px',
                      aspectRatio: '1 / 1.4142' // A4 aspect ratio
                    }}
                  />
                )}
              </div>
            );
          })}
        </DocumentWrapper>
      </div>
    </ContextProvider>
  );
} 