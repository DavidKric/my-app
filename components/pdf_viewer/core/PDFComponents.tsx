'use client';

import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react';
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

// Token extraction function using the PDF.js instance from @davidkric/pdf-components
async function extractTokenBBoxes(pdfDocument: any): Promise<Array<{ page: number; top: number; left: number; width: number; height: number; text: string }>> {
  if (!pdfDocument) return [];
  
  const allTokens: Array<{ page: number; top: number; left: number; width: number; height: number; text: string }> = [];

  for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1.0 });
    const pageHeight = viewport.height;

    textContent.items.forEach((item: any) => {
      // Explicitly check if item.str is null or undefined
      if (typeof item.str === 'undefined' || item.str === null) {
        console.warn('extractTokenBBoxes: item.str is undefined or null. Item structure:', JSON.stringify(item));
        return;
      }

      // Check if item.str is a string and then if it's non-empty after trimming
      if (typeof item.str === 'string' && item.str.trim()) {
        // PDF.js uses a bottom-left origin; y increases up the page.
        // item.transform = [scaleX, skewX, skewY, scaleY, transX, transY]
        const [,, , , x, y] = item.transform;

        allTokens.push({
          text: item.str,
          left: x,
          // Convert from bottom-left to top-left origin
          top: pageHeight - y - item.height,
          width: item.width,
          height: item.height,
          page: pageNum - 1, // Convert to 0-indexed
        });
      } else if (typeof item.str !== 'string') {
        // Log if item.str is not a string (but not null/undefined, handled above)
        console.warn('extractTokenBBoxes: item.str is not a string. Item structure:', JSON.stringify(item));
      }
    });
  }
  
  return allTokens;
}

// Component to extract tokens using DocumentContext
const TokenExtractor: React.FC<{ onTokensExtracted: (tokens: Array<{ page: number; top: number; left: number; width: number; height: number; text: string }>) => void }> = ({ onTokensExtracted }) => {
  const documentContext = React.useContext(DocumentContext as any) as any;
  const pdfDocProxy = documentContext.pdfDocProxy;

  useEffect(() => {
    const extractTokens = async () => {
      console.log('DocumentContext pdfDocProxy:', pdfDocProxy);
      
      if (pdfDocProxy) {
        try {
          const tokens = await extractTokenBBoxes(pdfDocProxy);
          onTokensExtracted(tokens);
          console.log(`Extracted ${tokens.length} tokens from PDF`);
        } catch (error) {
          console.error('Failed to extract tokens from PDF:', error);
        }
      } else {
        console.log('PDF document not yet loaded');
      }
    };
    
    extractTokens();
  }, [pdfDocProxy, onTokensExtracted]);

  return null; // This component doesn't render anything
};

// Basic overlay renderer for annotations
const BasicOverlayRenderer: React.FC<{
  pageIndex: number;
  annotations: any[];
  onAnnotationSelected?: (annotation: any) => void;
}> = ({ pageIndex, annotations, onAnnotationSelected }) => {
  const documentContext = React.useContext(DocumentContext as any) as any;
  const transformContext = React.useContext(TransformContext as any) as any;
  const { pageDimensions } = documentContext;
  const { scale } = transformContext;
  
  if (!pageDimensions) {
    return null;
  }

  const renderedWidth = pageDimensions.width * scale;
  const renderedHeight = pageDimensions.height * scale;

  // Filter annotations for this page
  const pageAnnotations = annotations.filter(annotation => 
    annotation.pageNumber === pageIndex + 1
  );

  const styleFromBounds = (bounds: any) => {
    if (!bounds) return {};
    
    return {
      position: 'absolute' as const,
      left: bounds.x || bounds.left || 0,
      top: bounds.y || bounds.top || 0,
      width: bounds.width || 100,
      height: bounds.height || 20,
    };
  };

  return (
    <>
      {pageAnnotations.map((annotation) => (
        <div
          key={annotation.id}
          data-annotation-id={annotation.id}
          style={styleFromBounds(annotation.boundingRect)}
          className="absolute bg-yellow-200 bg-opacity-40 border border-yellow-400 cursor-pointer hover:bg-opacity-60 transition-all"
          onClick={() => onAnnotationSelected?.(annotation)}
          title={annotation.content || annotation.textSnippet}
        />
      ))}
    </>
  );
};

// PDF rendering component that follows the exact same pattern as the working demo
const PDFCore: React.FC<{ 
  annotations?: any[]; 
  onTextSelection?: (text: string, boundingRect: any, pageNumber: number) => void; 
  onAnnotationSelected?: (annotation: any) => void;
  onDocumentLoadSuccess?: (data: { numPages: number; outline?: any[] }) => void;
}> = ({ 
  annotations = [],
  onTextSelection,
  onAnnotationSelected,
  onDocumentLoadSuccess
}) => {
  const { numPages, outline } = useContext(DocumentContext);
  const [extractedTokens, setExtractedTokens] = useState<Array<{ page: number; top: number; left: number; width: number; height: number; text: string }>>([]);

  // Callback to receive extracted tokens
  const handleTokensExtracted = useCallback((tokens: Array<{ page: number; top: number; left: number; width: number; height: number; text: string }>) => {
    console.log('Received extracted tokens:', tokens.length);
    setExtractedTokens(tokens);
  }, []);

  // Call external handler when document loads
  useEffect(() => {
    if (numPages > 0 && onDocumentLoadSuccess) {
      onDocumentLoadSuccess({ numPages, outline: outline || undefined });
    }
  }, [numPages, outline, onDocumentLoadSuccess]);

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
      {/* Token extractor component */}
      <TokenExtractor onTokensExtracted={handleTokensExtracted} />
      
      {Array.from({ length: numPages }).map((_, pageIndex) => (
        <div key={pageIndex} className="w-full flex justify-center mb-4">
          <PageWrapper
            pageIndex={pageIndex}
            renderType={RENDER_TYPE.MULTI_CANVAS}
          >
            {/* Add overlay for annotations and other interactive elements */}
            <Overlay>
              <BasicOverlayRenderer
                pageIndex={pageIndex}
                annotations={annotations}
                onAnnotationSelected={onAnnotationSelected}
              />
              
              {/* Token highlights for debugging */}
              <>
                {extractedTokens
                  .filter(token => token.page === pageIndex)
                  .slice(0, 10) // Limit to first 10 tokens per page for demo
                  .map((token, tokenIndex) => (
                    <div
                      key={`token-${pageIndex}-${tokenIndex}`}
                      style={{
                        position: 'absolute',
                        left: token.left,
                        top: token.top,
                        width: token.width,
                        height: token.height,
                        backgroundColor: 'rgba(255, 255, 0, 0.2)',
                        border: '1px solid rgba(255, 255, 0, 0.5)',
                        pointerEvents: 'none',
                        fontSize: '10px',
                        color: 'red',
                        zIndex: 10
                      }}
                      title={token.text}
                    />
                  ))
                }
              </>
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
  onAnnotationSelected,
  onDocumentLoadSuccess,
  onDocumentLoadError
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
        onDocumentLoadSuccess={onDocumentLoadSuccess}
      />
    </DocumentWrapper>
  );
};

export default PDFComponents; 