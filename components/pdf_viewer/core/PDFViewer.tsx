'use client';

import React, { useState, useEffect, useRef, Suspense, useContext, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useAnnotations } from '@/components/context_panel/annotations/AnnotationProvider';
// TemporaryHighlight was already added in a previous successful step, scrollService needs its full import
import scrollService, { ScrollPosition, TemporaryHighlight } from '@/lib/scroll-service';
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
import {
  RENDER_TYPE,
  DocumentContext,
  TransformContext,
  ContextProvider
} from '@davidkric/pdf-components';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

// Import Toolbar components
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
const TextSelectionPopover = dynamic(() => import('../annotations/TextSelectionPopover'), { ssr: false });

interface TextSelectionRect {
  top: number;
  left: number;
  width: number;
  height: number;
  // For positioning relative to viewport if needed
  clientX?: number;
  clientY?: number;
}
interface TextSelectionData {
  text: string;
  rect: TextSelectionRect; // Use our defined interface
  pageNumber: number;
}

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

// PDF Viewer Inner Component - this will be wrapped by ContextProvider
const PDFViewerInner: React.FC<PDFViewerProps> = ({
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
  // Now we can access the library context!
  const { numPages, outline } = useContext(DocumentContext);
  const { scale, setScale, rotate } = useContext(TransformContext) as { // Assuming setScale and rotate exist
    scale: number;
    setScale: (scale: number) => void;
    rotate: (angle: number) => void;
  };

  // Process file URL to ensure it works correctly
  const fileUrl = useMemo(() => {
    if (!rawFileUrl) {
      if (pdfData) {
        console.log('Using provided binary PDF data instead of URL');
        return null;
      }
      console.error('No file URL provided to PDFViewer');
      return '';
    }
    
    console.log('Processing raw file URL:', rawFileUrl);
    return rawFileUrl;
  }, [rawFileUrl, pdfData]);

  // State for PDF document and navigation
  const [page, setPage] = useState<number>(currentPage);
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
  const [showAiHighlights, setShowAiHighlights] = useState<boolean>(true);
  const [textSelectionData, setTextSelectionData] = useState<TextSelectionData | null>(null);
  const [showAnnotationNoteInput, setShowAnnotationNoteInput] = useState<boolean>(false);
  const [currentAnnotationText, setCurrentAnnotationText] = useState<string>('');
  const [temporaryHighlights, setTemporaryHighlights] = useState<TemporaryHighlight[]>([]);


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

  // Call external handler when library loads document
  useEffect(() => {
    if (numPages > 0 && onDocumentLoaded) {
      onDocumentLoaded(numPages, outline || undefined);
    }
  }, [numPages, outline, onDocumentLoaded]);

  const handleDocumentLoadSuccess = ({ numPages, outline }: { numPages: number, outline?: any[] }) => {
    console.log('Document loaded successfully with', numPages, 'pages');
    // The library context will handle this automatically now
  };

  const handleDocumentLoadError = (err: Error) => {
    console.error('Error loading PDF document:', err);
    const errorMessage = `Failed to load the PDF document: ${err.message}`;
    setError(errorMessage);
  };

  // Page navigation
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= numPages) {
      setPage(newPage);
      if (onPageChange) {
        onPageChange(newPage);
      }
    }
  };

  // Handle outline item click
  const handleOutlineItemClick = (item: any) => {
    if (item && typeof item.pageNumber === 'number') {
      handlePageChange(item.pageNumber);
    }
  };

  // Search functionality
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    
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

  // Annotation handling
  const handleAnnotationSelected = (annotation: Annotation) => {
    console.log('Selection annotation in PDF:', annotation.id);
    
    if (annotation.pageNumber !== currentPage) {
      handlePageChange(annotation.pageNumber);
    }
    
    setTimeout(() => {
      const annotationElement = document.querySelector(`[data-annotation-id="${annotation.id}"]`);
      if (annotationElement) {
        annotationElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        
        annotationElement.classList.add('flash-highlight');
        setTimeout(() => {
          annotationElement.classList.remove('flash-highlight');
        }, 2000);
      }
    }, 300);
  };

  const handleTextSelection = (selectedText: string, boundingRect: any, pageNumber: number) => {
    // If an annotation tool is active from the toolbar, create annotation directly
    if (activeAnnotationTool && onCreateAnnotation) {
      onCreateAnnotation({
        textSnippet: selectedText,
        boundingRect: boundingRect,
        pageNumber: pageNumber,
        type: activeAnnotationTool,
        content: activeAnnotationTool === AnnotationType.NOTE || activeAnnotationTool === AnnotationType.COMMENT ? "" : selectedText, // Clear content for notes initially
      });
      // Optionally, clear active tool after one use, or keep it active
      // setActiveAnnotationTool(null);
    } else if (selectedText.trim()) {
      // Otherwise, show popover for user to choose action
      // Adjust boundingRect: The raw rect might be relative to the PDF page's internal coordinate system.
      // We need to transform it to be relative to the viewport or a scrollable container.
      // For simplicity, this example assumes boundingRect is somewhat usable for direct positioning.
      // A more robust solution would involve getting the target page element and calculating relative position.

      // Get the PDF viewer's main scrollable container
      const viewerContainer = containerRef.current?.querySelector('.overflow-auto'); // Adjust selector if needed
      const pageElement = viewerContainer?.querySelector(`[data-page-number="${pageNumber}"]`) as HTMLElement | null; // Assuming PageWrapper adds this

      let popoverRect: TextSelectionRect = { ...boundingRect }; // Start with the raw rect

      if (pageElement && viewerContainer) {
        const pageRect = pageElement.getBoundingClientRect();
        const containerRect = viewerContainer.getBoundingClientRect();

        // Calculate position relative to the scrollable container's viewport
        // This is simplified; true calculation needs to account for scroll offsets within the page if multi-canvas pages are individually scrollable.
        // For now, let's assume boundingRect is relative to the *start* of the PDF page content.
        popoverRect = {
          top: pageRect.top - containerRect.top + viewerContainer.scrollTop + boundingRect.top * scale,
          left: pageRect.left - containerRect.left + viewerContainer.scrollLeft + boundingRect.left * scale,
          width: boundingRect.width * scale,
          height: boundingRect.height * scale,
        };
      } else {
         // Fallback if pageElement not found, adjust by current scale. This might not be perfectly accurate.
        popoverRect = {
          top: boundingRect.top * scale + (containerRef.current?.offsetTop || 0),
          left: boundingRect.left * scale + (containerRef.current?.offsetLeft || 0),
          width: boundingRect.width * scale,
          height: boundingRect.height * scale,
        };
      }
      // Add a small offset to prevent popover from overlapping selection too much
      popoverRect.top += popoverRect.height + 5;


      setTextSelectionData({ text: selectedText, rect: popoverRect, pageNumber });
    } else {
      setTextSelectionData(null); // Clear if no text is selected
    }

    // Also pass to external onTextSelected if provided
    if (onTextSelected) {
      onTextSelected(selectedText, boundingRect, pageNumber);
    }
  };

  const clearTextSelection = () => {
    setTextSelectionData(null);
    setShowAnnotationNoteInput(false);
    setCurrentAnnotationText('');
  };

  const handleCreateHighlightFromPopover = () => {
    if (textSelectionData && onCreateAnnotation) {
      onCreateAnnotation({
        textSnippet: textSelectionData.text,
        boundingRect: textSelectionData.rect, // This rect might need to be transformed back to PDF coordinates
        pageNumber: textSelectionData.pageNumber,
        type: AnnotationType.HIGHLIGHT,
        color: 'yellow', // Default user highlight color
      });
    }
    clearTextSelection();
  };

  const handleOpenAddNoteFromPopover = () => {
    if (textSelectionData) {
      setShowAnnotationNoteInput(true);
      // Popover might be hidden by now or input shown elsewhere
    }
  };

  const handleSaveNote = () => {
    if (textSelectionData && onCreateAnnotation && currentAnnotationText.trim()) {
      onCreateAnnotation({
        textSnippet: textSelectionData.text,
        boundingRect: textSelectionData.rect, // Transform back if needed
        pageNumber: textSelectionData.pageNumber,
        type: AnnotationType.NOTE, // Or COMMENT
        content: currentAnnotationText,
        // Add specific styling for note indicator if needed
      });
    }
    clearTextSelection();
  };

  const handleToggleAiHighlights = () => {
    setShowAiHighlights(prev => !prev);
  };

  const handleJumpToAnnotation = (annotation: Annotation) => {
    if (annotation.pageNumber) {
      handlePageChange(annotation.pageNumber);
    }
  };
  
  const handleGenerateAnnotations = () => {
    console.log('Generating auto annotations...');
    
    if (onCreateAnnotation) {
      setTimeout(() => {
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
        
        dummyAnnotations.forEach(annotation => {
          onCreateAnnotation(annotation);
        });
        
        setHasAutoAnnotations(true);
      }, 1500);
    }
  };

  // Register scroll service listeners
  useEffect(() => {
    const generalScrollListener = (position: ScrollPosition) => {
      if (position.pageNumber && position.pageNumber !== page) { // Use internal 'page' state
        handlePageChange(position.pageNumber);
      }
      
      if (position.annotationId) {
        const annotation = annotations.find(a => a.id === position.annotationId);
        if (annotation) {
          handleAnnotationSelected(annotation);
        }
      }
      // If a temporary highlight was also sent with a general scroll, ensure it's processed
      if (position.temporaryHighlight) {
        setTemporaryHighlights(prev => {
          // Replace if ID exists, otherwise add. Clear others for simplicity.
          return [position.temporaryHighlight!];
        });
      }
    };

    const tempHighlightListenerCallback = (highlight: TemporaryHighlight) => {
      setTemporaryHighlights(prev => [highlight]); // Replace previous temp highlights with the new one
      // Optional: Scroll to the page of this highlight if not already handled by general listener
      if (highlight.pageNumber !== page) {
        handlePageChange(highlight.pageNumber);
      }
      // Optional: Set a timer to clear this temporary highlight
      // setTimeout(() => setTemporaryHighlights(prev => prev.filter(h => h.id !== highlight.id)), 5000);
    };
    
    scrollService.addListener('pdf-viewer-general', generalScrollListener);
    scrollService.addTempHighlightListener('pdf-viewer-temp-highlight', tempHighlightListenerCallback);
    
    return () => {
      scrollService.removeListener('pdf-viewer-general');
      scrollService.removeTempHighlightListener('pdf-viewer-temp-highlight');
    };
  }, [annotations, page, handlePageChange, handleAnnotationSelected]); // Added 'page' to dependencies

  // Annotation mode indicator
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

  // Panel toggle functions
  const toggleOutlinePanel = () => {
    const newValue = !showOutlinePanel;
    setShowOutlinePanel(newValue);
    if (newValue) {
      setShowThumbnailsPanel(false);
    }
  };

  const toggleThumbnailsPanel = () => {
    const newValue = !showThumbnailsPanel;
    setShowThumbnailsPanel(newValue);
    if (newValue) {
      setShowOutlinePanel(false);
    }
  };

  // Annotation tool handling
  const toggleAnnotationTool = (tool: AnnotationType | null) => {
    const newToolState = activeAnnotationTool === tool ? null : tool;
    setActiveAnnotationTool(newToolState);
  };

  // Sync external annotation tool
  useEffect(() => {
    if (externalActiveAnnotationTool !== undefined) {
      setActiveAnnotationTool(externalActiveAnnotationTool);
    }
  }, [externalActiveAnnotationTool]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [page, numPages, activeAnnotationTool, handlePageChange, toggleAnnotationTool]);

  // Toolbar handlers
  const [isContextPanelVisible, setIsContextPanelVisible] = useState(true);
  
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
    setSearchInput(searchText);
    setSearchResults([
      { pageNumber: Math.ceil(Math.random() * numPages), text: `Found "${searchText}" on this page...` },
      { pageNumber: Math.ceil(Math.random() * numPages), text: `Another match for "${searchText}"...` }
    ]);
  }, [numPages]);

  const handleDownload = useCallback(() => {
    console.log('Downloading PDF');
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    } else if (pdfData) {
      const blob = new Blob([new Uint8Array(pdfData)], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'document.pdf';
      link.click();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    }
  }, [fileUrl, pdfData]);

  const handlePrint = useCallback(() => {
    console.log('Printing PDF');
    window.print();
  }, []);

  // Render the PDF viewer UI
  return (
    // Use bg-background for the outermost container
    <div className="pdf-viewer-container fixed inset-0 flex flex-col w-full h-full bg-background text-foreground">
      {/* Toolbar at top - fixed positioned */}
      {/* Toolbar uses bg-background/90 via its own props/styling in EnhancedPDFToolbar, so it's fine */}
      <div className={cn(
        "pdf-toolbar-container w-full flex-none border-b border-border z-50 relative", // Removed bg-white, added border-border
        annotationToolbarPosition === 'top' ? 'order-first' : 'order-last'
      )}>
        <PDFToolbar
          currentPage={page}
          totalPages={numPages}
          onPrevPage={() => handlePageChange(Math.max(1, page - 1))}
          onNextPage={() => handlePageChange(Math.min(numPages, page + 1))}
          onPageChange={handlePageChange}
          zoomLevel={scale} // Pass current scale as zoomLevel
          onZoomIn={() => setScale && setScale(scale * 1.2)} // Example zoom factors
          onZoomOut={() => setScale && setScale(scale / 1.2)}
          onZoomChange={(newScale) => setScale && setScale(newScale)} // New handler
          onToggleOutline={toggleOutlinePanel} // New handler
          onToggleThumbnails={toggleThumbnailsPanel} // New handler
          onRotate={() => rotate && rotate(90)} // Example: rotate 90 deg clockwise
          onDownload={handleDownload} // Connect existing download handler
          onPrint={handlePrint} // Connect existing print handler
          isAiHighlightsVisible={showAiHighlights} // Pass state
          onToggleAiHighlights={handleToggleAiHighlights} // Pass handler
          data-show-search={showSearchBar ? 'true' : 'false'}
          data-active-annotation-tool={activeAnnotationTool}
          data-has-auto-annotations={hasAutoAnnotations ? 'true' : 'false'}
          onShowShortcuts={() => setShowShortcutsDialog(true)}
          // Remove the generic onClick for toggles, as dedicated props are now used.
          // onClick={(e: React.MouseEvent<HTMLDivElement>) => {
          //   const target = e.target as HTMLElement;
          //   if (target.closest('[data-toggle-outline]')) {
          //     toggleOutlinePanel();
          //   } else if (target.closest('[data-toggle-thumbnails]')) {
          //     toggleThumbnailsPanel();
          //   }
          // }}
        />
      </div>
      
      {/* Main content area - full viewport like Semantic Scholar */}
      <div className="flex-1 relative w-full h-full overflow-hidden">
        {/* PDF content area - base layer, full viewport */}
        <div 
          className={cn(
            "absolute inset-0 w-full h-full",
            activeAnnotationTool && "cursor-crosshair"
          )}
          ref={containerRef}
          tabIndex={0}
        >
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
            <div className="w-full h-full overflow-auto" onClick={textSelectionData ? clearTextSelection : undefined}>
              {/* Show annotation mode indicator when an annotation tool is active */}
              {activeAnnotationTool && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                  {renderAnnotationModeIndicator()}
                </div>
              )}

              {/* Text Selection Popover */}
              {textSelectionData && !showAnnotationNoteInput && (
                <TextSelectionPopover
                  position={textSelectionData.rect}
                  onHighlight={handleCreateHighlightFromPopover}
                  onAddNote={handleOpenAddNoteFromPopover}
                />
              )}

              {/* Inline Note Input (simplified) */}
              {textSelectionData && showAnnotationNoteInput && (
                <div
                  style={{
                    position: 'absolute',
                    top: textSelectionData.rect.top + textSelectionData.rect.height + 10, // Position below selection
                    left: textSelectionData.rect.left,
                    zIndex: 101, // Above popover
                  }}
                  className="bg-background p-2 border rounded shadow-lg w-64"
                  onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                >
                  <textarea
                    value={currentAnnotationText}
                    onChange={(e) => setCurrentAnnotationText(e.target.value)}
                    placeholder="Add your note..."
                    className="w-full h-20 p-1 border rounded mb-2 text-sm dark:bg-gray-800 dark:text-white"
                    autoFocus
                    dir="auto" // Handle RTL/LTR automatically
                  />
                  <div className="flex justify-end space-x-2">
                    <Button size="xs" variant="outline" onClick={clearTextSelection}>Cancel</Button>
                    <Button size="xs" onClick={handleSaveNote}>Save Note</Button>
                  </div>
                </div>
              )}
              
              {/* Main PDF component - full viewport rendering */}
              {/* This div is the scrollable area for PDF pages */}
              <div className="w-full h-full flex justify-center py-4"> {/* Added padding for scroll aesthetics */}
                {/* This inner div is for the PDF pages themselves, typically white paper with dark text.
                    It should not change with theme, but its container can.
                    Using bg-muted to provide a slight contrast to bg-background in dark mode for the page area.
                 */}
                <div className="w-full max-w-4xl h-full bg-muted shadow-lg">
                  <PDFComponents
                    fileUrl={fileUrl}
                    pdfData={pdfData}
                  currentPage={page}
                  onDocumentLoadSuccess={handleDocumentLoadSuccess}
                  onDocumentLoadError={handleDocumentLoadError}
                  onPageChange={handlePageChange}
                  annotations={annotations}
                  activeAnnotationTool={activeAnnotationTool}
                  onTextSelection={handleTextSelection}
                  onAnnotationSelected={handleAnnotationSelected}
                  showAiHighlights={showAiHighlights}
                  temporaryHighlights={temporaryHighlights} // Pass temporary highlights
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Side panels - overlaid on top of PDF like Semantic Scholar */}
        <div className={cn(
          "absolute top-0 left-0 h-full bg-card text-card-foreground border-r border-border shadow-lg transition-all duration-200 ease-in-out z-20",
          (showOutlinePanel || showThumbnailsPanel) ? "w-72" : "w-0"
        )}>
          {/* Outline panel */}
          {showOutlinePanel && (
            <div className="h-full overflow-auto">
              <div className="p-4 flex items-center justify-between border-b border-border">
                <h3 className="font-medium text-foreground">Document Outline</h3>
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
              <div className="p-4 flex items-center justify-between border-b border-border">
                <h3 className="font-medium text-foreground">Page Thumbnails</h3>
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
        </div>
        
        {/* Search results panel - overlaid on top right like Semantic Scholar */}
        {searchResults.length > 0 && (
          <div className="absolute right-4 top-4 w-80 max-h-96 overflow-auto bg-card text-card-foreground shadow-lg rounded-md border border-border z-30">
            <div className="p-4 border-b border-border">
              <h3 className="font-medium text-foreground">Search Results</h3>
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
      </div>
      
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
  );
};

// Main PDFViewer component - wraps everything in ContextProvider
const PDFViewer: React.FC<PDFViewerProps> = (props) => {
  // Default showAiHighlights to true if not provided
  const { showAiHighlights: initialShowAiHighlights, ...restProps } = props;

  return (
    <ContextProvider>
      {/* Pass down initialShowAiHighlights if needed, but PDFViewerInner now has its own state */}
      <PDFViewerInner {...restProps} />
    </ContextProvider>
  );
};

export default PDFViewer;
