'use client';

import React from 'react';
import { ThumbnailList } from 'davidkric-pdf-components';

interface PDFThumbnailsProps {
  fileUrl: string;
  numPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const PDFThumbnails: React.FC<PDFThumbnailsProps> = ({
  fileUrl,
  numPages,
  currentPage,
  onPageChange,
}) => {
  const handleThumbnailClick = (pageNumber: number) => {
    onPageChange(pageNumber + 1); // Convert from 0-indexed to 1-indexed
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 border-b">
        <h3 className="font-medium">Page Thumbnails</h3>
        <span className="text-xs text-muted-foreground">{numPages} pages</span>
      </div>
      
      <div className="overflow-auto flex-1 p-2">
        <ThumbnailList
          currentPageIndex={currentPage - 1} // Convert to 0-indexed
          file={fileUrl}
          onThumbnailClick={handleThumbnailClick}
          thumbnailWidth={150}
          className="pdf-thumbnails"
        />
      </div>
    </div>
  );
};

export default PDFThumbnails; 