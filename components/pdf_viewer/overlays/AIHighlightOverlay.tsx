import { HighlightOverlay, BoundingBox } from '@davidkric/pdf-components';
import React from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

export interface AIHighlight {
  page: number;
  top: number;
  left: number;
  width: number;
  height: number;
  label?: string; // e.g., 'Goal', 'Method', 'Result'
  excerpt?: string; // Optional: text excerpt for popover
}

interface AIHighlightOverlayProps {
  pageIndex: number;
  highlights: AIHighlight[];
}

const AIHighlightOverlay: React.FC<AIHighlightOverlayProps> = ({ pageIndex, highlights }) => {
  return (
    <HighlightOverlay pageIndex={pageIndex}>
      {highlights
        .filter(h => h.page === pageIndex)
        .map((h, i) =>
          h.label ? (
            <Popover key={i}>
              <PopoverTrigger asChild>
                <BoundingBox
                  page={h.page}
                  top={h.top}
                  left={h.left}
                  width={h.width}
                  height={h.height}
                  isHighlighted={false}
                />
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div>
                  <div className="font-semibold mb-1">{h.label}</div>
                  {h.excerpt && <div className="text-xs text-muted-foreground">{h.excerpt}</div>}
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
              isHighlighted={false}
            />
          )
        )}
    </HighlightOverlay>
  );
};

export default AIHighlightOverlay; 