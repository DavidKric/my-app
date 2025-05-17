'use client';

// Import the centralized PDF setup
import '@/lib/pdf-setup';

import React, { useState, useEffect, useRef, Suspense, useContext, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useAnnotations } from '@/components/context_panel/annotations/AnnotationProvider';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  List, 
  Image, 
  Loader2,
  RotateCw,
  RotateCcw, 
  Highlighter,
  FileText,
  PenTool,
  Search,
  BookMarked,
  MessageSquare,
  AlertCircle,
  X,
  Keyboard,
  Download,
  ArrowDownToLine,
  Minimize,
  ListTree,
  LayoutGrid,
  Printer
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Annotation, AnnotationType } from '../annotations/AnnotationOverlay';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip } from '@/components/ui/tooltip';
import PDFErrorBoundary from './PDFErrorBoundary';
import scrollService, { ScrollPosition } from '@/lib/scroll-service';
import { 
  DEFAULT_ZOOM_SCALE,
  RENDER_TYPE,
  ZoomInButton, 
  ZoomOutButton,
  PageNumberControl,
  PercentFormatter,
  BoundingBox,
  DownloadButton,
  TransformContext,
  ScrollContext,
  UiContext,
  DocumentContext,
  ContextProvider,
  rotateClockwise as libraryRotateClockwise,
  rotateCounterClockwise as libraryRotateCounterClockwise,
  scrollToPdfPageIndex,
  PrintButton,
  Outline
} from '@allenai/pdf-components';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

// Import Toolbar components
import Toolbar from '../controls/Toolbar';
// Cast PDFToolbar as any to bypass type checking
import { PDFToolbar as PDFToolbarComponent } from '../controls/EnhancedPDFToolbar';
const PDFToolbar = PDFToolbarComponent as any;

// Dynamic imports to prevent SSR issues
const PDFComponents = dynamic(() => import('./PDFComponents'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center min-h-[500px]">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
        <p>Loading PDF viewer...</p>
      </div>
    </div>
  )
}) as any;  // Cast to any to bypass type checking

// Dynamically import the outline and thumbnails components
const PDFThumbnails = dynamic(() => import('./PDFThumbnails'), { ssr: false }) as any;
const PDFOutline = dynamic(() => import('./PDFOutline'), { ssr: false }) as any;

interface PDFViewerProps {
  fileUrl: string | null | undefined;
  pdfData?: Uint8Array | null;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  annotations?: Annotation[];
  showSearchBar?: boolean;
  onCreateAnnotation?: (annotationData: Partial<Annotation>) => string;
  activeAnnotationTool?: AnnotationType | null;
  initialPage?: number;
  annotationToolbarPosition?: 'top' | 'bottom';
  externalAnnotationControl?: boolean;
  onToolChange?: (tool: AnnotationType | null) => void;
  onTextSelected?: (text: string, boundingRect: any, pageNumber: number) => void;
  onAnnotationSelected?: (annotation: Annotation) => void;
  documentOutline?: any[];
  onDocumentLoaded?: (numPages: number, outline?: any[]) => void;
  autoScrollToPage?: boolean;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  fileUrl: rawFileUrl,
  pdfData,
  currentPage = 1,
  onPageChange,
  annotations = [],
  showSearchBar = true,
  onCreateAnnotation,
  activeAnnotationTool: externalActiveAnnotationTool,
  initialPage = 1,
  annotationToolbarPosition = 'top',
  externalAnnotationControl,
  onToolChange,
  onTextSelected,
  documentOutline,
  onDocumentLoaded,
  autoScrollToPage
}) => {
  // Process file URL to ensure it works correctly
  const fileUrl = useMemo(() => {
    if (!rawFileUrl) {
      // If we have PDF data, we don't need a URL
      if (pdfData) {
        console.log('Using provided binary PDF data instead of URL');
        return null;
      }
      console.error('No file URL provided to PDFViewer');
      return '';
    }
    
    console.log('Processing raw file URL:', rawFileUrl);
    
    // If it includes "file-" in the URL, it's likely a reference to one of our sample PDFs
    if (rawFileUrl.includes('file=') || rawFileUrl.includes('file-')) {
      // Extract the file name from the URL parameter
      let fileName = '';
      
      if (rawFileUrl.includes('file=')) {
        const parts = rawFileUrl.split('file=');
        if (parts.length > 1) {
          fileName = parts[1].split('&')[0]; // Extract file name and remove any other parameters
        }
      } else if (rawFileUrl.includes('file-')) {
        const parts = rawFileUrl.split('file-');
        if (parts.length > 1) {
          fileName = parts[1].split('&')[0]; // Extract file name and remove any other parameters
        }
      }
      
      // If we have a file name, construct the path to our sample PDF
      if (fileName) {
        const sampleUrl = `/sample-pdfs/${fileName}.pdf`;
        console.log('Using sample PDF URL:', sampleUrl);
        return sampleUrl;
      }
    }
    
    // Handle different URL formats
    if (rawFileUrl.startsWith('http://') || rawFileUrl.startsWith('https://')) {
      console.log('Using external URL:', rawFileUrl);
      return rawFileUrl;
    } else if (rawFileUrl.startsWith('/')) {
      console.log('Using absolute path:', rawFileUrl);
      return rawFileUrl;
    } else {
      // For relative paths, add leading slash
      console.log('Converting relative path to absolute:', `/${rawFileUrl}`);
      return `/${rawFileUrl}`;
    }
  }, [rawFileUrl, pdfData]);

  // Access context values using React's useContext hook
  const transformContext = useContext(TransformContext);
  const scrollContext = useContext(ScrollContext);
  const uiContext = useContext(UiContext);
  const documentContext = useContext(DocumentContext);
  
  // Destructure the context values
  const { 
    scale: contextScale, 
    setScale: setContextScale,
    rotation: contextRotation,
    setRotation: setContextRotation
  } = transformContext;
  
  const {
    scrollToPage,
    isPageVisible,
    setScrollRoot
  } = scrollContext;
  
  const {
    isLoading: uiIsLoading,
    setIsLoading: setUiIsLoading,
    errorMessage,
    setErrorMessage,
    isShowingOutline,
    setIsShowingOutline,
    isShowingThumbnail,
    setIsShowingThumbnail
  } = uiContext;
  
  const {
    numPages: docNumPages,
    setNumPages: setDocNumPages,
    outline: docOutline,
    setOutline: setDocOutline
  } = documentContext;
  
  // Keep some local state for compatibility and UI-specific features
  const [page, setPage] = useState<number>(currentPage);
  const [numPages, setNumPages] = useState<number>(0);
  const [outline, setOutline] = useState<any[]>([]);
  const [activeAnnotationTool, setActiveAnnotationTool] = useState<AnnotationType | null>(null);
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const { state, dispatch } = useAnnotations();
  const [hasAutoAnnotations, setHasAutoAnnotations] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showOutlinePanel, setShowOutlinePanel] = useState<boolean>(false);
  const [showThumbnailsPanel, setShowThumbnailsPanel] = useState<boolean>(false);
  const [showShortcutsDialog, setShowShortcutsDialog] = useState<boolean>(false);
  
  // Keep local state for scale and rotation
  const [scale, setScale] = useState(contextScale || 1);
  const [rotation, setRotation] = useState(contextRotation || 0);
  
  // Synchronize local state with context
  useEffect(() => {
    if (contextScale && contextScale !== scale) {
      setScale(contextScale);
    }
  }, [contextScale, scale]);

  useEffect(() => {
    if (contextRotation !== undefined && contextRotation !== rotation) {
      setRotation(contextRotation);
    }
  }, [contextRotation, rotation]);
  
  // Update error state to match context
  useEffect(() => {
    if (errorMessage) {
      setError(errorMessage);
    }
  }, [errorMessage]);
  
  // Set scroll root on component mount
  useEffect(() => {
    if (containerRef.current) {
      try {
        // Make sure setScrollRoot exists before calling it
        if (typeof setScrollRoot === 'function') {
          console.log('[PDF] Setting scroll root element');
          setScrollRoot(containerRef.current);
        } else {
          console.warn('[PDF] setScrollRoot is not available. ScrollContext may not be properly initialized.');
        }
      } catch (error) {
        console.error('[PDF] Error setting scroll root:', error);
      }
    }
  }, [containerRef, setScrollRoot]);

  // Sync the internal and external active annotation tool
  useEffect(() => {
    if (externalActiveAnnotationTool !== undefined) {
      setActiveAnnotationTool(externalActiveAnnotationTool);
    }
  }, [externalActiveAnnotationTool]);

  // Update internal page when prop changes
  useEffect(() => {
    if (currentPage !== page) {
      setPage(currentPage);
    }
  }, [currentPage]);

  // Update annotation context when page changes
  useEffect(() => {
    dispatch({ type: 'SET_CURRENT_PAGE', page });
  }, [page, dispatch]);

  // Check if we have auto-generated annotations
  useEffect(() => {
    if (annotations.some(a => a.isAutoGenerated)) {
      setHasAutoAnnotations(true);
    }
  }, [annotations]);

  // Update handleDocumentLoadSuccess to use context
  const handleDocumentLoadSuccess = ({ numPages, outline }: { numPages: number, outline?: any[] }) => {
    // Update both local and context state
    setNumPages(numPages);
    setDocNumPages(numPages);
    setUiIsLoading(false);
    
    if (outline) {
      setOutline(outline);
      setDocOutline(outline);
    }
    
    // Auto-fit to width on initial load
    handleFitToWidth();
  };

  // Update handleDocumentLoadError to use context
  const handleDocumentLoadError = (err: Error) => {
    console.error('Error loading PDF document:', err);
    const errorMessage = `Failed to load the PDF document: ${err.message}`;
    setError(errorMessage);
    setErrorMessage(errorMessage);
    setUiIsLoading(false);
  };

  // Update handlePageChange to use ScrollContext
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= numPages) {
      setPage(newPage);
      
      // Use the ScrollContext's scrollToPage function
      scrollToPage({ pageNumber: newPage });
      
      if (onPageChange) {
        onPageChange(newPage);
      }
    }
  };

  // Update zoom and rotation functions to use TransformContext
  const handleZoomIn = useCallback(() => {
    const newScale = parseFloat((scale * 1.2).toFixed(1));
    setScale(newScale);
    setContextScale(newScale);
  }, [scale, setContextScale]);

  const handleZoomOut = useCallback(() => {
    const newScale = parseFloat((scale / 1.2).toFixed(1));
    setScale(newScale);
    setContextScale(newScale);
  }, [scale, setContextScale]);

  const handleRotate = useCallback(() => {
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    setContextRotation(newRotation);
  }, [rotation, setContextRotation]);

  // Manual implementation of fit to width
  const handleFitToWidth = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth - 40; // Subtract padding
      // Use standard A4 width for calculation
      const pdfWidth = 595; // Standard A4 width in points
      const newScale = containerWidth / pdfWidth;
      setScale(newScale);
      setContextScale(newScale);
    }
  }, [containerRef, setContextScale]);

  // Handle outline item click
  const handleOutlineItemClick = (item: any) => {
    if (item && typeof item.pageNumber === 'number') {
      handlePageChange(item.pageNumber);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    
    // Here you would implement actual search functionality
    // For now, let's simulate it
    console.log('Searching for:', searchInput);
    
    // Dummy search results - in a real app, you'd use PDF.js's text search
    setSearchResults([
      { pageNumber: Math.ceil(Math.random() * numPages), text: `Found "${searchInput}" on this page...` },
      { pageNumber: Math.ceil(Math.random() * numPages), text: `Another match for "${searchInput}"...` }
    ]);
  };

  const handleSearchResultClick = (pageNumber: number) => {
    handlePageChange(pageNumber);
  };

  // Handle annotation selection
  const handleAnnotationSelected = (annotation: Annotation) => {
    console.log('Selection annotation in PDF:', annotation.id);
    
    // Set the page if needed
    if (annotation.pageNumber !== currentPage) {
      handlePageChange(annotation.pageNumber);
    }
    
    // Find and flash highlight the annotation element
    setTimeout(() => {
      const annotationElement = document.querySelector(`[data-annotation-id="${annotation.id}"]`);
      if (annotationElement) {
        annotationElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        
        // Add a flash highlight
        annotationElement.classList.add('flash-highlight');
        setTimeout(() => {
          annotationElement.classList.remove('flash-highlight');
        }, 2000);
      }
    }, 300); // Small delay to allow page render
  };

  // Text selection handling
  const handleTextSelection = (selectedText: string, boundingRect: any, pageNumber: number) => {
    if (activeAnnotationTool && onCreateAnnotation) {
      onCreateAnnotation({
        textSnippet: selectedText,
        boundingRect: boundingRect,
        pageNumber: pageNumber,
        type: activeAnnotationTool,
        content: selectedText
      });
    }
  };

  // Handle jump to annotation
  const handleJumpToAnnotation = (annotation: Annotation) => {
    // Change to the page where the annotation exists
    if (annotation.pageNumber) {
      handlePageChange(annotation.pageNumber);
      
      // You could also implement scrolling to the annotation
      // This would require tracking rendered annotations' positions
    }
  };
  
  // Mock function for generating annotations
  const handleGenerateAnnotations = () => {
    console.log('Generating auto annotations...');
    // In a real implementation, this would trigger an API call
    // to generate annotations for the document
    
    // For now, let's create some dummy auto annotations
    if (onCreateAnnotation) {
      // Simulate an API delay
      setTimeout(() => {
        // Create some sample auto annotations
        const dummyAnnotations = [
          {
            textSnippet: "This is an important insight about the document content.",
            boundingRect: { x: 100, y: 200, width: 300, height: 20 },
            pageNumber: 1,
            type: AnnotationType.KEY_INSIGHT,
            isAutoGenerated: true,
            importance: 5
          },
          {
            textSnippet: "This term refers to a specific concept in the domain.",
            boundingRect: { x: 150, y: 350, width: 250, height: 20 },
            pageNumber: 1,
            type: AnnotationType.DEFINITION,
            isAutoGenerated: true,
            importance: 4
          }
        ];
        
        // Add the annotations
        dummyAnnotations.forEach(annotation => {
          onCreateAnnotation(annotation);
        });
        
        setHasAutoAnnotations(true);
      }, 1500);
    }
  };

  // Add right before the return statement
  useEffect(() => {
    // Register as listener for scroll events
    const scrollListener = (position: ScrollPosition) => {
      // Handle page changes
      if (position.pageNumber && position.pageNumber !== currentPage) {
        handlePageChange(position.pageNumber);
      }
      
      // Handle annotation focus
      if (position.annotationId) {
        const annotation = annotations.find(a => a.id === position.annotationId);
        if (annotation) {
          handleAnnotationSelected(annotation);
        }
      }
    };
    
    scrollService.addListener('pdf-viewer', scrollListener);
    
    return () => {
      scrollService.removeListener('pdf-viewer');
    };
  }, [annotations, currentPage, handlePageChange, handleAnnotationSelected]);

  const renderAnnotationModeIndicator = () => {
    if (!activeAnnotationTool) return null;
    
    let icon;
    let label;
    let className;
    
    switch (activeAnnotationTool) {
      case AnnotationType.HIGHLIGHT:
        icon = <Highlighter className="h-4 w-4" />;
        label = "Highlight Mode";
        className = "annotation-mode-highlight";
        break;
      case AnnotationType.NOTE:
        icon = <MessageSquare className="h-4 w-4" />;
        label = "Note Mode";
        className = "annotation-mode-note";
        break;
      case AnnotationType.DRAW:
        icon = <PenTool className="h-4 w-4" />;
        label = "Draw Mode";
        className = "annotation-mode-draw";
        break;
      case AnnotationType.COMMENT:
        icon = <FileText className="h-4 w-4" />;
        label = "Comment Mode";
        className = "annotation-mode-comment";
        break;
      default:
        return null;
    }
    
    return (
      <div className={`annotation-mode ${className}`}>
        {icon}
        <span>{label}</span>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-5 w-5 ml-2" 
          onClick={() => toggleAnnotationTool(activeAnnotationTool)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  };

  // Update toggleOutlinePanel to use UiContext
  const toggleOutlinePanel = () => {
    const newValue = !showOutlinePanel;
    setShowOutlinePanel(newValue);
    setIsShowingOutline(newValue);
    
    // Close thumbnails if opening outline
    if (newValue) {
      setShowThumbnailsPanel(false);
      setIsShowingThumbnail(false);
    }
  };

  // Update toggleThumbnailsPanel to use UiContext
  const toggleThumbnailsPanel = () => {
    const newValue = !showThumbnailsPanel;
    setShowThumbnailsPanel(newValue);
    setIsShowingThumbnail(newValue);
    
    // Close outline if opening thumbnails
    if (newValue) {
      setShowOutlinePanel(false);
      setIsShowingOutline(false);
    }
  };

  // Inside the PDFViewer component, before the return statement
  const scaleOptions = [
    { value: 0.5, label: '50%' },
    { value: 0.75, label: '75%' },
    { value: 1.0, label: '100%' },
    { value: 1.25, label: '125%' },
    { value: 1.5, label: '150%' },
    { value: 2.0, label: '200%' }
  ];

  // Move the toggleAnnotationTool function before the keyboard event handler useEffect
  // Add this after the handleFitToWidth function and before all keyboard handling
  const toggleAnnotationTool = (tool: AnnotationType | null) => {
    const newToolState = activeAnnotationTool === tool ? null : tool;
    setActiveAnnotationTool(newToolState);
  };

  // Add the keyboard event handlers after the existing useEffect hooks
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Navigation shortcuts
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePageChange(page - 1);
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        handlePageChange(page + 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        handlePageChange(1);
      } else if (e.key === 'End') {
        e.preventDefault();
        handlePageChange(numPages);
      }
      
      // Zoom shortcuts
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        handleZoomIn();
      } else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        handleZoomOut();
      } else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        handleFitToWidth();
      }
      
      // Annotation tool shortcuts
      if (e.key === 'h' || e.key === 'H') {
        toggleAnnotationTool(AnnotationType.HIGHLIGHT);
      } else if (e.key === 'n' || e.key === 'N') {
        toggleAnnotationTool(AnnotationType.NOTE);
      } else if (e.key === 'c' || e.key === 'C') {
        toggleAnnotationTool(AnnotationType.COMMENT);
      } else if (e.key === 'd' || e.key === 'D') {
        toggleAnnotationTool(AnnotationType.DRAW);
      } else if (e.key === 'Escape') {
        if (activeAnnotationTool) {
          toggleAnnotationTool(activeAnnotationTool);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [page, numPages, activeAnnotationTool, handleZoomIn, handleZoomOut, handleFitToWidth, handlePageChange, toggleAnnotationTool]);

  // Add toggle state for context panel
  const [isContextPanelVisible, setIsContextPanelVisible] = useState(true);
  
  // Add handlers for toolbar actions
  const handleToggleContextPanel = useCallback(() => {
    setIsContextPanelVisible(prev => !prev);
  }, []);
  
  const handleAnnotateFromToolbar = useCallback(() => {
    setActiveAnnotationTool('annotation' as AnnotationType);
    if (onToolChange) onToolChange('annotation' as AnnotationType);
  }, [onToolChange]);
  
  const handleHighlightFromToolbar = useCallback(() => {
    setActiveAnnotationTool('highlight' as AnnotationType);
    if (onToolChange) onToolChange('highlight' as AnnotationType);
  }, [onToolChange]);
  
  const handleCommentFromToolbar = useCallback(() => {
    setActiveAnnotationTool('comment' as AnnotationType);
    if (onToolChange) onToolChange('comment' as AnnotationType);
  }, [onToolChange]);

  const handleNextPage = useCallback(() => {
    handlePageChange(page + 1);
  }, [page, handlePageChange]);

  const handlePrevPage = useCallback(() => {
    handlePageChange(page - 1);
  }, [page, handlePageChange]);

  const handleToolbarSearch = useCallback((searchText: string) => {
    console.log('Searching for:', searchText);
    // Implement the search functionality here
    setSearchInput(searchText);
    // Simulate search results
    setSearchResults([
      { pageNumber: Math.ceil(Math.random() * numPages), text: `Found "${searchText}" on this page...` },
      { pageNumber: Math.ceil(Math.random() * numPages), text: `Another match for "${searchText}"...` }
    ]);
  }, [numPages]);

  const handleDownload = useCallback(() => {
    console.log('Downloading PDF');
    // Implement download with null check
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    } else if (pdfData) {
      // For binary data, create a Blob URL and open it
      const blob = new Blob([pdfData], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'document.pdf';
      link.click();
      // Clean up the Blob URL after download
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    }
  }, [fileUrl, pdfData]);

  const handlePrint = useCallback(() => {
    console.log('Printing PDF');
    window.print();
  }, []);

  // Render the PDF viewer UI
  return (
    <ContextProvider>
      <div 
        className="pdf-viewer-container flex flex-col w-full h-full relative" 
        ref={containerRef}
        tabIndex={0}
      >
        {/* Toolbar at top */}
        <div className={cn(
          "pdf-toolbar-container w-full flex-none",
          annotationToolbarPosition === 'top' ? 'order-first' : 'order-last'
        )}>
          <PDFToolbar
            currentPage={page}
            totalPages={numPages}
            onPrevPage={() => handlePageChange(Math.max(1, page - 1))}
            onNextPage={() => handlePageChange(Math.min(numPages, page + 1))}
            onPageChange={handlePageChange}
            zoomLevel={scale}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onRotate={handleRotate}
            data-toggle-outline="true"
            data-toggle-thumbnails="true"
            onDownload={() => {/* Download functionality */}}
            onPrint={() => {/* Print functionality */}}
            data-show-search={showSearchBar ? 'true' : 'false'}
            data-active-annotation-tool={activeAnnotationTool}
            data-has-auto-annotations={hasAutoAnnotations ? 'true' : 'false'}
            onShowShortcuts={() => setShowShortcutsDialog(true)}
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
              // Handle toggle events by checking data attributes and event target
              const target = e.target as HTMLElement;
              if (target.closest('[data-toggle-outline]')) {
                toggleOutlinePanel();
              } else if (target.closest('[data-toggle-thumbnails]')) {
                toggleThumbnailsPanel();
              }
            }}
          />
        </div>
        
        {/* Main content area with sidebar and PDF */}
        <div className="flex-1 flex overflow-hidden w-full h-full">
          {/* Side panels for outline and thumbnails */}
          <aside className={cn(
            "pdf-sidebar-container flex-none transition-all duration-200 ease-in-out",
            (showOutlinePanel || showThumbnailsPanel) ? "w-72" : "w-0"
          )}>
            {/* Outline panel */}
            {showOutlinePanel && (
              <div className="h-full overflow-auto">
                <div className="p-4 flex items-center justify-between">
                  <h3 className="font-medium">Document Outline</h3>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7" 
                    onClick={() => setShowOutlinePanel(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="px-2">
                  {outline && outline.length > 0 ? (
                    <PDFOutline
                      outline={outline}
                      onItemClick={handleOutlineItemClick}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground p-4">
                      No outline available for this document.
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* Thumbnails panel */}
            {showThumbnailsPanel && (
              <div className="h-full overflow-auto">
                <div className="p-4 flex items-center justify-between">
                  <h3 className="font-medium">Page Thumbnails</h3>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7" 
                    onClick={() => setShowThumbnailsPanel(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-2">
                  <PDFThumbnails
                    currentPage={page}
                    numPages={numPages}
                    onPageChange={handlePageChange}
                    fileUrl={fileUrl}
                  />
                </div>
              </div>
            )}
          </aside>
          
          {/* PDF content area */}
          <main className={cn(
            "pdf-content-container flex-1 overflow-auto",
            activeAnnotationTool && "cursor-crosshair"
          )}>
            {error ? (
              <div className="flex h-full w-full items-center justify-center p-8">
                <div className="max-w-md p-8 bg-destructive/10 rounded-lg shadow">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
                  <h3 className="text-xl font-medium text-center mb-2">Error Loading Document</h3>
                  <p className="text-center">{error}</p>
                  <div className="flex justify-center mt-4">
                    <Button onClick={() => window.location.reload()}>Reload</Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Show annotation mode indicator when an annotation tool is active */}
                {activeAnnotationTool && renderAnnotationModeIndicator()}
                
                {/* Main PDF component */}
                <div className="flex-1 w-full">
                  <PDFComponents
                    fileUrl={typeof fileUrl === 'string' ? fileUrl : undefined}
                    pdfData={pdfData}
                    currentPage={page}
                    scale={scale}
                    rotation={rotation}
                    onDocumentLoadSuccess={handleDocumentLoadSuccess}
                    onDocumentLoadError={handleDocumentLoadError}
                    annotations={annotations}
                    activeAnnotationTool={activeAnnotationTool}
                    onTextSelection={handleTextSelection}
                    onAnnotationSelected={handleAnnotationSelected}
                  />
                </div>
              </>
            )}
          </main>
        </div>
        
        {/* Search results panel */}
        {searchResults.length > 0 && (
          <div className="search-results-panel absolute right-4 top-[72px] w-80 max-h-96 overflow-auto bg-white shadow-lg rounded-md border border-border z-10">
            <div className="p-4 border-b">
              <h3 className="font-medium">Search Results</h3>
              <p className="text-sm text-muted-foreground">Found {searchResults.length} results</p>
            </div>
            <ul className="py-2">
              {searchResults.map((result, index) => (
                <li key={`search-result-${index}`} className="px-4 py-2 hover:bg-muted cursor-pointer" onClick={() => handleSearchResultClick(result.pageNumber)}>
                  <div className="flex items-center">
                    <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-md mr-2">Page {result.pageNumber}</span>
                    <span className="text-sm flex-1">{result.text}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Keyboard shortcuts dialog */}
        <Dialog open={showShortcutsDialog} onOpenChange={setShowShortcutsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Keyboard className="mr-2 h-5 w-5" />
                Keyboard Shortcuts
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              {[
                { key: 'Left Arrow / Page Up', action: 'Previous page' },
                { key: 'Right Arrow / Page Down', action: 'Next page' },
                { key: 'Home', action: 'Go to first page' },
                { key: 'End', action: 'Go to last page' },
                { key: '+ / =', action: 'Zoom in' },
                { key: '- / _', action: 'Zoom out' },
                { key: 'r', action: 'Rotate document' },
                { key: 'f', action: 'Fit to width' },
                { key: 'o', action: 'Toggle outline' },
                { key: 't', action: 'Toggle thumbnails' },
                { key: 'h', action: 'Toggle highlighter tool' },
                { key: 'Esc', action: 'Clear active tool' }
              ].map((shortcut, i) => (
                <div key={`shortcut-${i}`} className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded text-sm">{shortcut.key}</code>
                  <span className="text-sm">{shortcut.action}</span>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ContextProvider>
  );
};

export default PDFViewer;
