'use client';

import React from 'react';
import { Outline, OutlineItem } from '@davidkric/pdf-components';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface OutlineItem {
  title: string;
  pageNumber?: number;
  items?: OutlineItem[];
  expanded?: boolean;
}

interface PDFOutlineProps {
  outline: OutlineItem[];
  onItemClick: (item: OutlineItem) => void;
}

const PDFOutline: React.FC<PDFOutlineProps> = ({ outline, onItemClick }) => {
  const [expandAll, setExpandAll] = React.useState(false);

  // Toggle expansion of all outline items
  const toggleExpandAll = () => {
    setExpandAll(!expandAll);
  };

  const handleItemClick = (node: any) => {
    if (node.pageNumber || node.dest) {
      // Create a compatible item with the format expected by the parent component
      const item = {
        title: node.title,
        pageNumber: node.pageNumber,
        items: node.items
      };
      onItemClick(item);
    }
  };

  return (
    <div className="pdf-outline h-full flex flex-col">
      <div className="flex items-center justify-between p-2 border-b">
        <h3 className="font-medium">Document Outline</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleExpandAll}
          className="text-xs"
        >
          {expandAll ? 'Collapse All' : 'Expand All'}
          {expandAll ? 
            <ChevronUp className="h-3 w-3 ml-1" /> : 
            <ChevronDown className="h-3 w-3 ml-1" />
          }
        </Button>
      </div>
      
      <div className="overflow-auto flex-1">
        {outline && outline.length > 0 ? (
          <div className="outline-container p-2">
            {outline.map((node, index) => (
              <div 
                key={index} 
                className="outline-item px-1 py-1.5 hover:bg-accent/50 rounded cursor-pointer"
                onClick={() => handleItemClick(node)}
              >
                <span className="text-sm truncate">{node.title}</span>
                {node.pageNumber && (
                  <span className="text-xs text-muted-foreground ml-2">
                    Page {node.pageNumber}
                  </span>
                )}
                {node.items && node.items.length > 0 && (
                  <div className="pl-4 mt-1">
                    {node.items.map((child, childIndex) => (
                      <div 
                        key={childIndex}
                        className="outline-item py-1 hover:bg-accent/50 rounded cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick(child);
                        }}
                      >
                        <span className="text-sm truncate">{child.title}</span>
                        {child.pageNumber && (
                          <span className="text-xs text-muted-foreground ml-2">
                            Page {child.pageNumber}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-4 text-muted-foreground text-sm">
            No outline available for this document
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFOutline; 