'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

export default function MinimalPDFTest() {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [workerInfo, setWorkerInfo] = useState<string>('Loading...');
  const [workerSrc, setWorkerSrc] = useState<string | null>(null);
  
  // Set up worker using blob URL to guarantee it works
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const workerCode = `/* Minimal worker code */
        (function() {
          "use strict";
          var WorkerMessageHandler = {
            setup(handler) {
              var callbacks = {};
              if (self) self.onmessage = function(e){var d=e.data;if(!d||!d.action)return;if(callbacks[d.action])callbacks[d.action](d.data);else self.postMessage({action:d.action+"_response",data:{success:!0,requestId:d.data?.requestId}});};
              handler.on = function(a, c){callbacks[a]=c;}; handler.send = function(a,d){if(self)self.postMessage({action:a,data:d});}; handler.terminate=function(){};
            }
          };
          self.pdfjsWorker = {WorkerMessageHandler}; self.WorkerMessageHandler = WorkerMessageHandler;
        })();
      `;
      
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const blobUrl = URL.createObjectURL(blob);
      pdfjs.GlobalWorkerOptions.workerSrc = blobUrl;
      setWorkerSrc(blobUrl);
      setWorkerInfo(`Worker set to blob URL: ${blobUrl.substring(0, 30)}...`);
    } catch (err: any) { // Type assertion for error
      console.error('Error setting up worker:', err);
      setError(`Worker setup failed: ${err?.message || 'Unknown error'}`);
      setWorkerInfo('Error setting up worker');
      setWorkerSrc('error'); // Indicate worker setup failed
    }
  }, []);
  
  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  // Memoize options
  const pdfOptions = useMemo(() => ({
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/cmaps/',
    cMapPacked: true
  }), []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Minimal PDF Test</h1>
      
      <div className={`mb-4 p-3 rounded-md border ${workerSrc === 'error' ? 'bg-red-50 border-red-200' : workerSrc ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
        <h2 className="font-bold">Worker Status</h2>
        <p>{workerInfo}</p>
        <p className="text-sm mt-2">PDF.js Version: {pdfjs.version}</p>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <h2 className="font-bold text-red-600">Error</h2>
          <p>{error}</p>
        </div>
      )}
      
      <div className="flex gap-2 my-4">
        <button
          onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
          disabled={pageNumber <= 1}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <p>
          Page {pageNumber} of {numPages || '-'}
        </p>
        <button
          onClick={() => setPageNumber(Math.min(numPages || 1, pageNumber + 1))}
          disabled={pageNumber >= (numPages || 1)}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
      
      <div className="border rounded-lg p-4 bg-white shadow-lg min-h-[600px] flex justify-center items-start">
        {workerSrc && workerSrc !== 'error' ? (
          <Document
            file="/test.pdf"
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(err: Error) => setError(`Failed to load PDF: ${err.message}`)}
            options={pdfOptions}
            loading={<div className="text-center py-10">Loading document...</div>}
            error={<div className="text-center py-10 text-red-500">Error loading document.</div>}
          >
            {numPages > 0 ? (
              <Page 
                pageNumber={pageNumber} 
                width={600}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                loading={<div className="text-center py-10">Loading page...</div>}
                error={<div className="text-center py-10 text-red-500">Error loading page.</div>}
              />
            ) : (
              <div className="h-96 flex items-center justify-center">
                <p>Document loaded, but no pages found.</p>
              </div>
            )}
          </Document>
        ) : (
          <div className="text-center py-10">
            {workerSrc === 'error' ? "Worker setup failed. Cannot load PDF." : "Initializing worker..."}
          </div>
        )}
      </div>
    </div>
  );
} 