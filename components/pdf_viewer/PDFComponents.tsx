'use client';

// Import the centralized PDF setup
import '@/lib/pdf-setup';

import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
// Import pdfjs for types only (worker setup is handled by pdf-setup.ts)
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
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
  Overlay
} from '@allenai/pdf-components';
import { AnnotationOverlay, Annotation, AnnotationType } from './AnnotationOverlay';
import PDFErrorBoundary from './PDFErrorBoundary';
import { Loader2 } from 'lucide-react';

// Worker is initialized in pdf-setup.ts, no need to set it here
// This avoids conflicts with the Allen AI library's worker configuration

interface PDFComponentsProps {
  fileUrl: string;
  currentPage: number;
  scale: number;
  rotation?: number;
  onDocumentLoadSuccess: (data: { numPages: number, outline?: any[] }) => void;
  onPageChange?: (pageNumber: number) => void;
  activeAnnotationTool?: AnnotationType | null;
  annotations?: Annotation[];
  onTextSelection?: (selectedText: string, boundingRect: any, pageNumber: number) => void;
  onAnnotationSelected?: (annotation: Annotation) => void;
}

export default function PDFComponents({ 
  fileUrl, 
  currentPage, 
  scale, 
  rotation = 0,
  onDocumentLoadSuccess,
  onPageChange,
  activeAnnotationTool,
  annotations = [],
  onTextSelection,
  onAnnotationSelected
}: PDFComponentsProps) {
  // Use contexts from Allen AI library
  const documentContext = useContext(DocumentContext);
  const scrollContext = useContext(ScrollContext);
  const uiContext = useContext(UiContext);
  const transformContext = useContext(TransformContext);
  
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

  const {
    scale: transformScale,
    rotation: transformRotation
  } = transformContext || {};
  
  // Keep some local state for compatibility
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  
  // Use visible pages from context instead of maintaining local state
  const visiblePages = Array.from(visiblePageRatios.keys());
  
  // We still need refs for local component behavior
  const pageRefsMap = useRef<Map<number, HTMLDivElement | null>>(new Map());
  
  // Memoized callback for setting the ref
  const setPageRef = useCallback((pageNumber: number, node: HTMLDivElement | null) => {
    // Store the ref in our Map
    if (node !== null) {
      pageRefsMap.current.set(pageNumber, node);
    } else {
      pageRefsMap.current.delete(pageNumber);
    }
  }, []);
  
  // Handle document loading success
  const handleLoadSuccess = useCallback((pdfDoc: any) => {
    const { numPages = 0, outline = [] } = pdfDoc || {};
    
    // Set local state
    setNumPages(numPages);
    setLoading(false);
    
    // Update context state if available
    if (setDocNumPages) setDocNumPages(numPages);
    if (setDocOutline && outline) setDocOutline(outline);
    if (setPdfDocProxy) setPdfDocProxy(pdfDoc);
    
    // Notify parent
    if (onDocumentLoadSuccess) {
      onDocumentLoadSuccess({ numPages, outline });
    }
  }, [onDocumentLoadSuccess, setDocNumPages, setDocOutline, setPdfDocProxy]);
  
  // Handle document loading error
  const handleLoadError = useCallback((err: Error) => {
    console.error('Error loading PDF document:', err);
    setError(err.message);
    setLoading(false);
    
    // Update context state if available
    if (setErrorMessage) setErrorMessage(err.message);
  }, [setErrorMessage]);
  
  // Handle visible pages changes
  useEffect(() => {
    if (visiblePages.length > 0 && onPageChange) {
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
  
  // Render content based on loading state
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading PDF document...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-96">
        <div className="text-center max-w-lg">
          <p className="text-destructive font-medium">Error loading PDF document:</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }
  
  // Filter annotations for the current page to keep rendering efficient
  const filteredAnnotations = annotations.filter(a => a.pageNumber === currentPage);
  
  return (
    <div className="pdf-container w-full h-full relative">
      <DocumentWrapper 
        file={fileUrl}
        onLoadSuccess={handleLoadSuccess}
        onLoadError={handleLoadError}
        renderType={RENDER_TYPE.SINGLE_CANVAS}
        className="w-full"
      >
        {Array.from(new Array(numPages)).map((_, index) => {
          const pageNumber = index + 1;
          
          // Check if we should render this page
          const shouldRenderPage = 
            Math.abs(pageNumber - currentPage) <= 3 || // Render nearby pages
            visiblePages.includes(pageNumber);         // And visible pages
            
          return (
            <div 
              key={`page-container-${pageNumber}`}
              ref={node => setPageRef(pageNumber, node)}
              data-page-number={pageNumber}
              className="pdf-page-container mb-8"
            >
              {shouldRenderPage ? (
                <PDFErrorBoundary>
                  <div 
                    className="relative" 
                    data-pdf-page-number={pageNumber}
                    onMouseUp={handleTextSelection(pageNumber)}
                  >
                    {/* Main PDF Page */}
                    <PageWrapper
                      key={`page-${pageNumber}`}
                      pageIndex={pageNumber - 1} // PageWrapper uses 0-indexed pages
                      className="bg-white shadow-md mx-auto"
                      renderType={RENDER_TYPE.SINGLE_CANVAS}
                    />
                    
                    {/* Annotation Overlay with proper props */}
                    {pageNumber === currentPage && (
                      <div className="absolute top-0 left-0 right-0 bottom-0">
                        <AnnotationOverlay 
                          annotations={filteredAnnotations}
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
  );
} 