'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  ContextProvider,
  DocumentWrapper,
  DocumentContext,
  TransformContext,
  PageWrapper,
  RENDER_TYPE,
} from '@davidkric/pdf-components';
import '@davidkric/pdf-components/dist/style.css';

interface SelectedEntity {
  type: string;
  label: string;
  content?: string;
  page?: number;
  coords?: { top: number; left: number; width: number; height: number };
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
      if (typeof item.str === 'string' && item.str.trim()) {
        const [,, , , x, y] = item.transform;
        allTokens.push({
          text: item.str,
          left: x,
          top: pageHeight - y - item.height,
          width: item.width,
          height: item.height,
          page: pageNum - 1, // Convert to 0-indexed
        });
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
      if (pdfDocProxy) {
        try {
          const tokens = await extractTokenBBoxes(pdfDocProxy);
          onTokensExtracted(tokens);
          console.log(`Extracted ${tokens.length} tokens from PDF`);
        } catch (error) {
          console.error('Failed to extract tokens from PDF:', error);
        }
      }
    };
    
    extractTokens();
  }, [pdfDocProxy, onTokensExtracted]);

  return null;
};

// Simple toolbar for demo
const DemoToolbar: React.FC<{ 
  showTokens: boolean; 
  onToggleTokens: () => void;
}> = ({ showTokens, onToggleTokens }) => (
  <div className="fixed top-0 left-0 right-0 h-12 bg-gray-800 text-gray-100 flex items-center px-4 z-40 shadow">
    <span className="font-bold text-sm text-yellow-400 mr-4">
      PDF Components Demo
    </span>
    <button 
      className={`px-2 py-1 rounded text-xs ${
        showTokens 
          ? 'bg-gray-700 text-yellow-300'        
          : 'bg-gray-800 hover:bg-gray-700'
      }`}
      onClick={onToggleTokens}
    >
      Show Tokens
    </button>
  </div>
);

// Pages component
const Pages: React.FC<{
  showTokens: boolean;
  tokenHighlights: Array<{ page: number; top: number; left: number; width: number; height: number; text: string }>;
  onEntitySelect: (entity: SelectedEntity | null) => void;
}> = React.memo(({ showTokens, tokenHighlights, onEntitySelect }) => {
  const documentContext = React.useContext(DocumentContext as any) as any;
  const transformContext = React.useContext(TransformContext as any) as any;
  const numPages = documentContext.numPages;
  const { pageDimensions } = documentContext;
  const { scale } = transformContext;

  if (!numPages || numPages <= 0 || !pageDimensions) return null;

  const renderedWidth = pageDimensions.width * scale;
  const renderedHeight = pageDimensions.height * scale;
  
  return (
    <>
      {Array.from({ length: numPages }).map((_, pageIndex) => (
                 <PageWrapper key={pageIndex} pageIndex={pageIndex} renderType={RENDER_TYPE.MULTI_CANVAS}>
           <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
             {/* Token overlays */}
             {showTokens && tokenHighlights
               .filter(token => token.page === pageIndex)
               .slice(0, 50) // Show first 50 tokens per page
               .map((token, i) => {
                 // Convert relative coordinates to absolute
                 const pageWidth = pageDimensions.width;
                 const pageHeight = pageDimensions.height;
                 
                 const relativeLeft = token.left / pageWidth;
                 const relativeTop = token.top / pageHeight;
                 const relativeWidth = token.width / pageWidth;
                 const relativeHeight = token.height / pageHeight;
                 
                 const absoluteLeft = relativeLeft * renderedWidth;
                 const absoluteTop = relativeTop * renderedHeight;
                 const absoluteWidth = relativeWidth * renderedWidth;
                 const absoluteHeight = relativeHeight * renderedHeight;
                 
                 return (
                   <div
                     key={`token-${pageIndex}-${i}`}
                     style={{
                       position: 'absolute',
                       left: absoluteLeft,
                       top: absoluteTop,
                       width: absoluteWidth,
                       height: absoluteHeight,
                       backgroundColor: 'rgba(255, 255, 0, 0.3)',
                       border: '1px solid rgba(255, 255, 0, 0.6)',
                       pointerEvents: 'auto',
                       cursor: 'pointer',
                       fontSize: '10px',
                       zIndex: 10
                     }}
                     onClick={() => {
                       onEntitySelect({
                         type: 'token',
                         label: 'Token',
                         content: token.text,
                         page: pageIndex + 1,
                         coords: { 
                           top: relativeTop, 
                           left: relativeLeft, 
                           width: relativeWidth, 
                           height: relativeHeight 
                         }
                       });
                     }}
                     title={token.text}
                   />
                 );
               })}
           </div>
         </PageWrapper>
      ))}
    </>
  );
});

Pages.displayName = 'Pages';

// Inspector sidebar
const InspectorSidebar: React.FC<{ 
  entity: SelectedEntity | null; 
  onClose: () => void; 
}> = ({ entity, onClose }) => {
  if (!entity) return null;

  return (
    <div className="fixed right-0 top-12 bottom-0 w-80 bg-white border-l border-gray-300 shadow-lg p-4 text-sm overflow-y-auto z-30">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
        <h2 className="font-bold text-lg text-gray-800">{entity.label}</h2>
        <button
          className="text-gray-600 hover:text-gray-800 text-xl font-bold"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      
      <div className="space-y-4">
        {entity.page && (
          <div>
            <span className="font-semibold text-gray-600">Page:</span> 
            <span className="ml-2 text-gray-800">{entity.page}</span>
          </div>
        )}
        
        {entity.coords && (
          <div>
            <span className="font-semibold text-gray-600">Coordinates:</span>
            <div className="mt-1 text-xs text-gray-600 font-mono bg-gray-50 p-2 rounded">
              top: {entity.coords.top.toFixed(3)}<br/>
              left: {entity.coords.left.toFixed(3)}<br/>
              width: {entity.coords.width.toFixed(3)}<br/>
              height: {entity.coords.height.toFixed(3)}
            </div>
          </div>
        )}
        
        {entity.content && (
          <div>
            <span className="font-bold text-gray-700">Content:</span>
            <div className="bg-gray-50 p-3 border rounded-md mt-1">
              <pre className="whitespace-pre-wrap text-xs text-gray-800 font-mono">
                {entity.content}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PDFDemo: React.FC = () => {
  const [showTokens, setShowTokens] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntity | null>(null);
  const [extractedTokens, setExtractedTokens] = useState<Array<{ page: number; top: number; left: number; width: number; height: number; text: string }>>([]);

  const handleTokensExtracted = useCallback((tokens: Array<{ page: number; top: number; left: number; width: number; height: number; text: string }>) => {
    setExtractedTokens(tokens);
  }, []);

  const handleEntitySelect = useCallback((entity: SelectedEntity | null) => {
    setSelectedEntity(entity);
  }, []);

  return (
    <ContextProvider>
      <DemoToolbar 
        showTokens={showTokens}
        onToggleTokens={() => setShowTokens(!showTokens)}
      />
      
      <div style={{ marginTop: '48px', height: 'calc(100vh - 48px)', overflow: 'auto', backgroundColor: '#f5f5f5' }}>
        <DocumentWrapper 
          file="/sample-pdfs/contract.pdf"
          renderType={RENDER_TYPE.MULTI_CANVAS}
        >
          <TokenExtractor onTokensExtracted={handleTokensExtracted} />
          <Pages
            showTokens={showTokens}
            tokenHighlights={extractedTokens}
            onEntitySelect={handleEntitySelect}
          />
        </DocumentWrapper>
      </div>

      <InspectorSidebar 
        entity={selectedEntity} 
        onClose={() => setSelectedEntity(null)} 
      />
    </ContextProvider>
  );
};

export default PDFDemo; 