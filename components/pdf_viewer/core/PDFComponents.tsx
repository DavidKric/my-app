'use client';

// Import the centralized PDF setup
import '@/lib/pdf-setup';

import React, { useState, useEffect, useCallback, useRef, useContext, useMemo } from 'react';
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
import { AnnotationOverlay, Annotation, AnnotationType } from '../annotations/AnnotationOverlay';
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
  
  // Debug fileUrl
  useEffect(() => {
    console.log('PDF URL being loaded:', fileUrl);
    
    // Try to prefetch the PDF to see if it's accessible
    if (typeof window !== 'undefined' && fileUrl) {
      console.log('Attempting to fetch PDF file:', fileUrl);
      
      // For external URLs, use a different approach to avoid CORS issues
      if (fileUrl.startsWith('http') && !fileUrl.startsWith(window.location.origin)) {
        console.log('Loading external PDF URL - skipping prefetch check to avoid CORS issues');
      } else {
        fetch(fileUrl)
          .then(response => {
            if (!response.ok) {
              console.error('PDF file fetch failed:', response.status, response.statusText);
              setError(`Failed to load PDF: ${response.status} ${response.statusText}`);
            } else {
              console.log('PDF file fetch successful');
              // Check content type to ensure it's a PDF
              const contentType = response.headers.get('content-type');
              console.log('Content type:', contentType);
              
              if (contentType && !contentType.includes('application/pdf')) {
                console.warn('Warning: Resource does not appear to be a PDF based on content-type:', contentType);
              }
              
              // Try to get file size
              const contentLength = response.headers.get('content-length');
              if (contentLength) {
                console.log('PDF file size:', (parseInt(contentLength) / 1024).toFixed(2), 'KB');
              }
            }
          })
          .catch(err => {
            console.error('PDF file fetch error:', err);
            setError(`Failed to load PDF: ${err.message}`);
          });
      }
        
      // Also verify PDF.js is properly initialized
      if (typeof pdfjs !== 'undefined') {
        console.log('PDF.js version:', pdfjs.version);
        console.log('PDF.js worker source:', pdfjs.GlobalWorkerOptions.workerSrc);
      } else {
        console.error('PDF.js is not properly imported or initialized');
        setError('PDF viewer library not properly initialized');
      }
    }
  }, [fileUrl]);
  
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
    
    console.log('PDF document loaded successfully:', { numPages, hasOutline: !!outline });
    
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
    const errorMessage = `Failed to load PDF: ${err.message}`;
    setError(errorMessage);
    setLoading(false);
    
    // Try to provide more context based on the error message
    if (err.message.includes('worker')) {
      console.error('This appears to be a PDF.js worker issue - check that the worker URL is accessible');
      setError(`PDF worker initialization failed. Try refreshing the page.`);
    } else if (err.message.includes('network')) {
      console.error('This appears to be a network issue - check the file URL accessibility');
      setError(`Network error loading PDF. Check your connection and try again.`);
    }
    
    // Update context state if available
    if (setErrorMessage) setErrorMessage(errorMessage);
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
  
  // Ensure we have a valid fileUrl by normalizing it
  const normalizedFileUrl = useMemo(() => {
    // Make sure fileUrl is a string and prepend with the proper format if needed
    if (!fileUrl) {
      console.error('No fileUrl provided to PDFComponents');
      return '';
    }
    
    // If it's already an absolute URL with http/https, use it as is
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }
    
    // If it's a path starting with /, make it an absolute path
    if (fileUrl.startsWith('/')) {
      const baseUrl = window.location.origin;
      const absoluteUrl = `${baseUrl}${fileUrl}`;
      console.log('Normalized PDF URL (absolute path):', absoluteUrl);
      return absoluteUrl;
    }
    
    // Handle relative paths by adding origin and a leading slash
    const baseUrl = window.location.origin;
    const absoluteUrl = `${baseUrl}/${fileUrl}`;
    console.log('Normalized PDF URL (relative path):', absoluteUrl);
    return absoluteUrl;
  }, [fileUrl]);
  
  // Render content based on loading state
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading PDF document...</p>
          <p className="text-xs text-muted-foreground">{normalizedFileUrl}</p>
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
          <p className="text-xs text-muted-foreground mt-1">URL: {normalizedFileUrl}</p>
          <button 
            className="mt-4 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
  
  // Filter annotations for the current page to keep rendering efficient
  const filteredAnnotations = annotations.filter(a => a.pageNumber === currentPage);
  
  return (
    <div className="pdf-container w-full h-full relative">
      <DocumentWrapper 
        file={normalizedFileUrl}
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