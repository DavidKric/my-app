'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';

interface ToolbarProps {
  currentPage: number;
  numPages?: number;
  scale: number;
  onZoomChange: (scale: number) => void;
  onPageChange: (page: number) => void;
}

export default function Toolbar({ currentPage, numPages, scale, onZoomChange, onPageChange }: ToolbarProps) {
  return (
    <div className="flex items-center justify-between border-b p-2 bg-white">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => onZoomChange(scale - 0.1)}>
          <ZoomOut size={16} />
        </Button>
        <span>{Math.round(scale * 100)}%</span>
        <Button variant="outline" size="icon" onClick={() => onZoomChange(scale + 0.1)}>
          <ZoomIn size={16} />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>
          <ChevronLeft size={16} />
        </Button>
        <span>Page {currentPage} of {numPages}</span>
        <Button variant="outline" size="icon" disabled={currentPage >= (numPages || 0)} onClick={() => onPageChange(currentPage + 1)}>
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
