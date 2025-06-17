import React, { useContext, useState } from 'react';
import { DocumentContext, Overlay as PdfOverlay } from '@davidkric/pdf-components';
import type { BoundingBoxProps } from '@davidkric/pdf-components';
import { TransformContext } from '@davidkric/pdf-components';
import { relativeToAbsoluteBox, RelativeBBox } from '../utils/bboxUtils';

// Cast Overlay so it will accept any React nodes instead of only <BoundingBox>
const Overlay = PdfOverlay as unknown as React.FC<{ children?: React.ReactNode }>;

type Props = {
  toggles?: { [key: string]: boolean };
  tokenHighlights?: Array<RelativeBBox & { text: string }>;
  annotations?: Array<any>;
  selectionMode?: boolean;
  onEntitySelect?: (entity: { type: string; label: string; content?: string; page?: number; coords?: any } | null) => void;
  onAnnotationSelect?: (annotation: any) => void;
  onlyPage?: number;
  isFocusMode?: boolean;
  selectedEntity?: { type: string; label: string; content?: string; page?: number; coords?: any } | null;
};

const AdvancedOverlayRenderer: React.FC<Props> = (props) => {
  const documentContext = React.useContext(DocumentContext as any) as any;
  const transformContext = React.useContext(TransformContext as any) as any;
  const numPages = documentContext.numPages;
  const pageDimensions = documentContext.pageDimensions;
  const scale = transformContext.scale;
  
  if (!pageDimensions) {
    return null;
  }

  // Use the same coordinate system as React-PDF and core library components
  const renderedWidth = pageDimensions.width * scale;
  const renderedHeight = pageDimensions.height * scale;
  
  const toAbs = (box: RelativeBBox) => relativeToAbsoluteBox(box, renderedWidth, renderedHeight);

  const styleFromRel = (b: RelativeBBox) => {
    const { left, top, width, height } = toAbs(b);
    return { left, top, width, height } as React.CSSProperties;
  };

  const {
    toggles = {},
    tokenHighlights = [],
    annotations = [],
    selectionMode = false,
    onEntitySelect,
    onAnnotationSelect,
    onlyPage,
    isFocusMode = false,
    selectedEntity,
  } = props;

  if (!numPages || numPages <= 0) return null;

  /** Helper: common handler for text-based highlight click */
  const selectTextEntity = (
    type: string, label: string, content: string, page: number, coords: { top: number; left: number; width: number; height: number }
  ) => {
    onEntitySelect?.({ type, label, content, page: page + 1, coords });  // use 1-indexed page in label for user-friendliness
  };

  // If onlyPage supplied, we limit to that single page; else render all pages
  const pageIndices = onlyPage !== undefined ? [onlyPage] : Array.from({ length: numPages }).map((_, i) => i);

  return (
    <>
      {/* Render each page and its overlay layers */}
      {pageIndices.map((pageIndex) => (
        <Overlay key={pageIndex}>
          {/* Token highlights (yellow translucent boxes over individual text tokens) */}
          {toggles.tokens && tokenHighlights.filter(t => t.page === pageIndex).map((token, i) => {
            const tokenId = `tok-${pageIndex}-${i}`;
            return (
              <div
                key={tokenId}
                className="absolute bg-yellow-300 bg-opacity-40 border border-yellow-500 hover:bg-opacity-60 cursor-pointer transition-all"
                style={{
                  position: 'absolute',
                  ...styleFromRel(token),
                }}
                onClick={() => {
                  selectTextEntity('token', 'Token', token.text, pageIndex, token);
                }}
                title={token.text}
              />
            );
          })}

          {/* User annotations */}
          {annotations.filter(annotation => annotation.pageNumber === pageIndex + 1).map((annotation) => (
            <div
              key={annotation.id}
              data-annotation-id={annotation.id}
              style={{
                position: 'absolute',
                left: annotation.boundingRect?.x || annotation.boundingRect?.left || 0,
                top: annotation.boundingRect?.y || annotation.boundingRect?.top || 0,
                width: annotation.boundingRect?.width || 100,
                height: annotation.boundingRect?.height || 20,
              }}
              className="absolute bg-blue-200 bg-opacity-40 border border-blue-400 cursor-pointer hover:bg-opacity-60 transition-all"
              onClick={() => onAnnotationSelect?.(annotation)}
              title={annotation.content || annotation.textSnippet}
            />
          ))}

          {/* Focus mode highlight */}
          {isFocusMode && selectedEntity && selectedEntity.coords && selectedEntity.page === pageIndex + 1 && (
            <div
              style={{
                position: 'absolute',
                left: selectedEntity.coords.left,
                top: selectedEntity.coords.top,
                width: selectedEntity.coords.width,
                height: selectedEntity.coords.height,
              }}
              className="absolute bg-yellow-300 bg-opacity-30 border border-yellow-500 animate-pulse"
            />
          )}
        </Overlay>
      ))}
    </>
  );
};

export default React.memo(AdvancedOverlayRenderer); 