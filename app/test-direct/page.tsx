'use client';

import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

export default function TestDirectPDFPage() {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize worker only on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Set worker directly
      const workerUrl = `${window.location.origin}/pdf.worker.min.js.actual`;
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
      console.log('Worker set to:', workerUrl);
    }
  }, []);
  
  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setLoading(false);
  }
  
  function onDocumentLoadError(error: Error): void {
    console.error('Error loading PDF:', error);
    setError(error.message);
    setLoading(false);
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Direct PDF Test</h1>
      
      <p className="mb-4">
        Testing direct PDF loading using react-pdf components
        <br />
        <span className="text-sm text-gray-500">File: /test.pdf</span>
      </p>
      
      <div className="flex gap-2 my-4">
        <button
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          disabled={pageNumber <= 1}
          onClick={() => setPageNumber(pageNumber - 1)}
        >
          Previous
        </button>
        <p>
          Page {pageNumber} of {numPages}
        </p>
        <button
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          disabled={pageNumber >= numPages}
          onClick={() => setPageNumber(pageNumber + 1)}
        >
          Next
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md mb-4">
          <p className="text-red-500 font-medium">Error loading PDF:</p>
          <p>{error}</p>
        </div>
      )}
      
      <div className="border border-gray-200 p-4 rounded-lg shadow-lg bg-white">
        {loading && <p>Loading PDF...</p>}
        
        <Document
          file="/test.pdf"
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<p>Loading document...</p>}
          error={<p>Failed to load PDF file.</p>}
          options={{
            cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/cmaps/',
            cMapPacked: true,
            standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/standard_fonts/'
          }}
        >
          <Page
            pageNumber={pageNumber}
            renderTextLayer
            renderAnnotationLayer
            loading={<p>Loading page {pageNumber}...</p>}
            error={<p>Error loading page {pageNumber}!</p>}
            width={600}
          />
        </Document>
      </div>
      
      <div className="mt-4 p-4 bg-gray-100 rounded-md">
        <h2 className="font-bold mb-2">Debug Info</h2>
        <pre className="text-xs overflow-auto">
          {JSON.stringify({
            pdfjsVersion: pdfjs.version,
            workerSrc: pdfjs.GlobalWorkerOptions.workerSrc,
            hasWorker: !!pdfjs.GlobalWorkerOptions.workerPort,
            numPages,
            pageNumber,
            loading,
            error
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
} 