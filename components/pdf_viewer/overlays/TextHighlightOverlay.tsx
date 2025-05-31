import { HighlightOverlay, BoundingBox } from '@davidkric/pdf-components';
import React from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

export interface TextHighlight {
  page: number;
  top: number;
  left: number;
  width: number;
  height: number;
  definition?: string; // Optional: term definition for popover
}

interface TextHighlightOverlayProps {
  pageIndex: number;
  highlights: TextHighlight[];
}

const TextHighlightOverlay: React.FC<TextHighlightOverlayProps> = ({ pageIndex, highlights }) => {
  return (
    <HighlightOverlay pageIndex={pageIndex}>
      {highlights
        .filter(h => h.page === pageIndex)
        .map((h, i) =>
          h.definition ? (
            <Popover key={i}>
              <PopoverTrigger asChild>
                <BoundingBox
                  page={h.page}
                  top={h.top}
                  left={h.left}
                  width={h.width}
                  height={h.height}
                  isHighlighted={true}
                />
              </PopoverTrigger>
              <PopoverContent className="w-72">
                <div>
                  <div className="font-semibold mb-1">Definition</div>
                  <div className="text-sm">{h.definition}</div>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <BoundingBox
              key={i}
              page={h.page}
              top={h.top}
              left={h.left}
              width={h.width}
              height={h.height}
              isHighlighted={true}
            />
          )
        )}
    </HighlightOverlay>
  );
};

export default TextHighlightOverlay; 