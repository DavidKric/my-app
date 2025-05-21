import { BoundingBox } from 'davidkric-pdf-components';
import React from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

export interface CitationBox {
  id: string;
  page: number;
  top: number;
  left: number;
  width: number;
  height: number;
  label?: string;
  paperId?: string;
}

interface CitationOverlayProps {
  pageIndex: number;
  citations: CitationBox[];
}

const CitationOverlay: React.FC<CitationOverlayProps> = ({ pageIndex, citations }) => {
  return (
    <>
      {citations
        .filter(c => c.page === pageIndex)
        .map((c, i) => (
          <Popover key={c.id || i}>
            <PopoverTrigger asChild>
              <BoundingBox
                page={c.page}
                top={c.top}
                left={c.left}
                width={c.width}
                height={c.height}
                isHighlighted={true}
                voiceOverLabel={c.label}
              />
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div>
                <div className="font-semibold mb-1">Citation</div>
                {c.label && <div className="mb-1 text-sm">{c.label}</div>}
                <div className="text-xs text-muted-foreground">Citation details will appear here.</div>
              </div>
            </PopoverContent>
          </Popover>
        ))}
    </>
  );
};

export default CitationOverlay; 