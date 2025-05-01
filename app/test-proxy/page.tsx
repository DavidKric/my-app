'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

export default function ProxyPDFTest() {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [workerSrc, setWorkerSrc] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
  const [fetchController, setFetchController] = useState<AbortController | null>(null);

  // Initialize PDF.js worker with blob URL only on client
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let isMounted = true;
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
      if (isMounted) {
        pdfjs.GlobalWorkerOptions.workerSrc = blobUrl;
        setWorkerSrc(blobUrl);
        console.log("Worker URL set via blob");
      }
    } catch (err: any) {
      console.error('Worker setup error:', err);
      if (isMounted) {
        setError(`Worker setup failed: ${err?.message || 'Unknown error'}`);
        setWorkerSrc('error');
      }
    }
    return () => { isMounted = false; };
  }, []);

  // Test various PDF URLs
  const pdfUrls = [
    '/test.pdf', // Local test PDF
    '/api/proxy/pdf?url=https%3A%2F%2Faclanthology.org%2F2023.emnlp-demo.45.pdf' // Proxied PDF
  ];

  const [activeUrl, setActiveUrl] = useState(pdfUrls[0]);

  // Effect to fetch PDF data manually when activeUrl changes
  useEffect(() => {
    // Abort previous fetch if any
    if (fetchController) {
      fetchController.abort();
    }
    const controller = new AbortController();
    setFetchController(controller);
    
    setPdfData(null); // Clear previous data
    setLoading(true);
    setError(null);
    setNumPages(0);
    setPageNumber(1);

    // Only fetch manually for the proxy URL
    if (activeUrl === pdfUrls[1]) { 
      console.log(`Manually fetching PDF data from: ${activeUrl}`);
      fetch(activeUrl, { signal: controller.signal })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const arrayBuffer = await response.arrayBuffer();
          console.log(`Successfully fetched ${arrayBuffer.byteLength} bytes for proxied PDF.`);
          setPdfData(arrayBuffer);
          // setLoading(false); // Loading state managed by Document component now
        })
        .catch((err) => {
          if (err.name === 'AbortError') {
            console.log('Fetch aborted');
          } else {
            console.error('Manual fetch error:', err);
            setError(`Failed to fetch PDF data: ${err.message}`);
            setLoading(false);
          }
        });
    } else {
      // For local URL, let react-pdf handle it, just set loading state
      console.log(`Using react-pdf internal fetch for local URL: ${activeUrl}`);
      setLoading(true); // react-pdf will set loading to false via callbacks
    }

    // Cleanup function to abort fetch on unmount or URL change
    return () => {
      controller.abort();
    };
  }, [activeUrl]); // Re-run when activeUrl changes

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    console.log(`Loaded PDF with ${numPages} pages from ${activeUrl}`);
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError(err: Error) {
    // Filter out AbortError coming from react-pdf's internal fetch
    if (err.name === 'AbortError') {
        console.log('React-PDF internal fetch aborted, likely due to URL change.');
        return; 
    }
    console.error(`Error loading PDF from ${activeUrl} in Document component:`, err);
    setError(`Failed to load PDF in component: ${err.message}`);
    setLoading(false);
    setNumPages(0);
  }

  // Memoize the options object
  const pdfOptions = useMemo(() => ({
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/cmaps/',
    cMapPacked: true,
    withCredentials: false, // Important for proxy/CORS
    disableStream: true, // Disable streaming to work around proxy issues
    disableAutoFetch: true // Complementary option
  }), []);

  // Handle URL change
  const handleUrlChange = (url: string) => {
    // No need to set loading/error here, useEffect handles it
    setActiveUrl(url);
  };

  // Determine the file source for the Document component
  const documentFileSource = activeUrl === pdfUrls[1] ? pdfData : activeUrl;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Proxy PDF Test</h1>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h2 className="text-lg font-bold mb-2">PDF Source Selection</h2>
        <div className="space-x-2">
          {pdfUrls.map((url, index) => (
            <button
              key={url}
              className={`px-3 py-1 rounded ${activeUrl === url ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => handleUrlChange(url)}
            >
              {index === 0 ? 'Local PDF' : 'Proxied PDF'}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-gray-500 break-all">
          Current URL: {activeUrl}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <h2 className="font-bold text-red-600">Error</h2>
          <p>{error}</p>
          <button 
            className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
          disabled={pageNumber <= 1 || loading}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="flex items-center">
          Page {pageNumber} of {numPages || '-'}
        </span>
        <button
          onClick={() => setPageNumber(Math.min(numPages || 1, pageNumber + 1))}
          disabled={pageNumber >= (numPages || 1) || loading}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <div className="border rounded-lg p-6 bg-white shadow-lg min-h-[600px] flex items-center justify-center">
        {/* Conditionally render Document only when workerSrc and file source are ready */} 
        {workerSrc && workerSrc !== 'error' && documentFileSource && !loading && !error && (
          <Document
            key={activeUrl} // Force re-render on URL change
            file={documentFileSource} // Use fetched data or URL
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<div className="text-center py-20">Loading document...</div>}
            error={<div className="text-center py-20 text-red-500">Error displaying PDF.</div>}
            options={pdfOptions}
          >
            {numPages > 0 ? (
              <Page
                key={`page_${pageNumber}`}
                pageNumber={pageNumber}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                width={600}
                loading={<div className="text-center py-10">Loading page {pageNumber}...</div>}
                error={<div className="text-center py-10 text-red-500">Error loading page {pageNumber}</div>}
              />
            ) : (
               <div className="text-center text-gray-500">Document loaded but has no pages.</div>
            )}
          </Document>
        )}
        {/* Updated loading/error states */} 
        {loading && <div className="text-center py-20">Loading PDF...</div>}
        {error && !loading && <div className="text-center py-20 text-red-500">Failed to load PDF: {error}</div>}
        {workerSrc === 'error' && <div className="text-center py-20 text-red-500">Worker setup failed.</div>}
        {!workerSrc && <div className="text-center py-20">Initializing worker...</div>}
        {activeUrl === pdfUrls[1] && !pdfData && !loading && !error && workerSrc !== 'error' && 
          <div className="text-center py-20">Fetching PDF data...</div>}
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded-md text-sm">
        <h2 className="font-bold mb-2">Debug Information</h2>
        <div className="overflow-auto">
          <table className="w-full">
            <tbody>
              <tr>
                <td className="font-medium p-1">PDF.js Version:</td>
                <td>{pdfjs.version}</td>
              </tr>
              <tr>
                <td className="font-medium p-1">Worker Source Status:</td>
                {/* Reflect worker status based on state */}
                {workerSrc === 'error' ? (
                  <td className="text-red-500">Error during setup</td>
                ) : workerSrc ? (
                  <td className="break-all text-green-600">Ready (Blob URL)</td>
                ) : (
                  <td>Initializing...</td>
                )}
              </tr>
              <tr>
                <td className="font-medium p-1">Active URL:</td>
                <td className="break-all">{activeUrl}</td>
              </tr>
              <tr>
                <td className="font-medium p-1">File Source Type:</td>
                <td>{activeUrl === pdfUrls[1] ? (pdfData ? 'ArrayBuffer' : 'Fetching...') : 'URL'}</td>
              </tr>
              <tr>
                <td className="font-medium p-1">Loading State:</td>
                <td>{loading ? 'Loading' : 'Idle'}</td>
              </tr>
              <tr>
                <td className="font-medium p-1">Pages:</td>
                <td>{numPages || 'N/A'}</td>
              </tr>
              <tr>
                <td className="font-medium p-1">Current Page:</td>
                <td>{pageNumber}</td>
              </tr>
              {error && (
                 <tr>
                    <td className="font-medium p-1 text-red-500">Last Error:</td>
                    <td className="text-red-500">{error}</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 