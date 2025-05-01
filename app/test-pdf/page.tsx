'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// Use dynamic import to prevent SSR issues
const PDFComponents = dynamic(
  () => import('@/components/pdf_viewer/core/PDFComponents'),
  { ssr: false, loading: () => <div>Loading PDF viewer...</div> }
);

export default function TestPDFPage() {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  
  const handleDocumentLoadSuccess = (data: { numPages: number }) => {
    console.log('PDF loaded successfully:', data);
    setNumPages(data.numPages);
  };
  
  const handleDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PDF Test Page</h1>
      
      <div className="mb-4">
        <p>Testing PDF loading with a simple PDF file</p>
        <p className="text-sm text-gray-500">File: /test.pdf</p>
        
        <div className="flex gap-2 my-2">
          <button 
            className="px-3 py-1 bg-gray-200 rounded"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {numPages}
          </span>
          <button 
            className="px-3 py-1 bg-gray-200 rounded"
            onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
            disabled={currentPage >= numPages}
          >
            Next
          </button>
        </div>
      </div>
      
      <div className="border rounded-lg p-4 bg-white shadow-lg">
        <PDFComponents 
          fileUrl="/test.pdf"
          currentPage={currentPage}
          scale={1.0}
          onDocumentLoadSuccess={handleDocumentLoadSuccess}
          onDocumentLoadError={handleDocumentLoadError}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
} 