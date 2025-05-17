import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import AnnotationListItem from '@/components/context_panel/annotations/AnnotationListItem';
import { Annotation } from '@/components/pdf_viewer/annotations/AnnotationOverlay';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AnnotationListProps {
  annotations: Annotation[];
  bulkMode: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
}

export default function AnnotationList(props: AnnotationListProps) {
  const { annotations, bulkMode, selectedIds, onToggleSelect } = props;
  const parentRef = useRef<HTMLDivElement | null>(null);

  // Setup TanStack Virtual
  const rowVirtualizer = useVirtualizer({
    count: annotations.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // estimate item height
  });

  return (
    <ScrollArea ref={parentRef} className="h-full w-full overflow-auto">
      <div
        style={{
          height: rowVirtualizer.getTotalSize(),
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const ann = annotations[virtualRow.index];
          return (
            <div
              key={ann.id}
              style={{
                position: 'absolute',
                top: virtualRow.start,
                width: '100%',
              }}
            >
              <AnnotationListItem
                annotation={ann}
                bulkMode={bulkMode}
                selected={selectedIds.includes(ann.id)}
                onToggleSelect={() => onToggleSelect(ann.id)}
              />
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
