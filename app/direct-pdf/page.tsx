'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Import the worker manually without using GlobalWorkerOptions
// which can be tricky with Next.js
const pdfjsVersion = '4.8.69';

export default function DirectPDFTest() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfInfo, setPdfInfo] = useState<{numPages: number, currentPage: number}>({
    numPages: 0,
    currentPage: 1
  });
  const [pdfUrl, setPdfUrl] = useState('/test.pdf'); // Default to local
  
  // Set up worker code directly - avoid external file dependency
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const workerScript = `
      (function() {
        "use strict";
        var WorkerMessageHandler = {
          setup(handler) {
            var callbacks = {};
            
            self.onmessage = function(event) {
              const data = event.data;
              if (!data || !data.action) return;
              
              if (callbacks[data.action]) {
                callbacks[data.action](data.data);
              } else {
                self.postMessage({
                  action: data.action + "_response",
                  data: { success: true, requestId: data.data?.requestId }
                });
              }
            };
            
            handler.on = function(action, callback) {
              callbacks[action] = callback;
            };
            
            handler.send = function(action, data) {
              self.postMessage({ action, data });
            };
            
            handler.terminate = function() {};
          }
        };
        
        self.pdfjsWorker = { WorkerMessageHandler };
        self.WorkerMessageHandler = WorkerMessageHandler;
      })();
    `;
    
    // Create a blob URL for the worker
    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    
    // Point PDF.js to our worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
    
    console.log('PDF.js worker initialized with blob URL');
  }, []);
  
  // Function to load and render PDF directly
  const loadPDF = async (url: string) => {
    if (!canvasRef.current) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Loading PDF directly from: ${url}`);
      
      // For proxy URL, fetch the data manually first
      let loadingTask;
      if (url.includes('/api/proxy/pdf')) {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        console.log(`Fetched ${arrayBuffer.byteLength} bytes`);
        
        // Load PDF from ArrayBuffer
        loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsVersion}/cmaps/`,
          cMapPacked: true,
        });
      } else {
        // Direct URL loading
        loadingTask = pdfjsLib.getDocument({
          url,
          cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsVersion}/cmaps/`,
          cMapPacked: true,
        });
      }
      
      // Get the PDF document
      const pdf = await loadingTask.promise;
      console.log(`PDF loaded successfully. Number of pages: ${pdf.numPages}`);
      
      setPdfInfo({
        numPages: pdf.numPages,
        currentPage: 1
      });
      
      // Get page and render on canvas
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });
      
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Check if context is valid before continuing
      if (!context) {
        throw new Error('Could not get 2D context from canvas');
      }
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      console.log('Page rendered successfully');
      
      setLoading(false);
    } catch (err: any) {
      console.error('Error loading PDF:', err);
      setError(`Failed to load PDF: ${err.message}`);
      setLoading(false);
    }
  };
  
  // Function to change page
  const changePage = async (newPage: number) => {
    if (!canvasRef.current || loading) return;
    
    try {
      setLoading(true);
      
      // Load the PDF again
      let loadingTask;
      if (pdfUrl.includes('/api/proxy/pdf')) {
        const response = await fetch(pdfUrl);
        const arrayBuffer = await response.arrayBuffer();
        
        loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsVersion}/cmaps/`,
          cMapPacked: true,
        });
      } else {
        loadingTask = pdfjsLib.getDocument({
          url: pdfUrl,
          cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsVersion}/cmaps/`,
          cMapPacked: true,
        });
      }
      
      const pdf = await loadingTask.promise;
      
      // Make sure the requested page is valid
      if (newPage < 1 || newPage > pdf.numPages) {
        throw new Error(`Invalid page number: ${newPage}`);
      }
      
      // Get the page and render it
      const page = await pdf.getPage(newPage);
      const viewport = page.getViewport({ scale: 1.5 });
      
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Check if context is valid before continuing
      if (!context) {
        throw new Error('Could not get 2D context from canvas');
      }
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      
      setPdfInfo(prev => ({
        ...prev,
        currentPage: newPage
      }));
      
      setLoading(false);
    } catch (err: any) {
      console.error('Error changing page:', err);
      setError(`Failed to change page: ${err.message}`);
      setLoading(false);
    }
  };
  
  // Function to handle URL change
  const handleUrlChange = (url: string) => {
    setPdfUrl(url);
    loadPDF(url);
  };
  
  // Load PDF on mount and URL change
  useEffect(() => {
    loadPDF(pdfUrl);
  }, []);
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Direct PDF.js Rendering</h1>
      
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h2 className="text-lg font-bold mb-2">PDF Source Selection</h2>
        <div className="space-x-2">
          <button
            className={`px-3 py-1 rounded ${pdfUrl === '/test.pdf' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => handleUrlChange('/test.pdf')}
          >
            Local PDF
          </button>
          <button
            className={`px-3 py-1 rounded ${pdfUrl.includes('proxy') ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => handleUrlChange('/api/proxy/pdf?url=https%3A%2F%2Faclanthology.org%2F2023.emnlp-demo.45.pdf')}
          >
            Proxied PDF
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500 break-all">
          Current URL: {pdfUrl}
        </p>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <h2 className="font-bold text-red-600">Error</h2>
          <p>{error}</p>
          <button 
            className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm"
            onClick={() => loadPDF(pdfUrl)}
          >
            Try Again
          </button>
        </div>
      )}
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => changePage(pdfInfo.currentPage - 1)}
          disabled={pdfInfo.currentPage <= 1 || loading}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="flex items-center">
          Page {pdfInfo.currentPage} of {pdfInfo.numPages || '-'}
        </span>
        <button
          onClick={() => changePage(pdfInfo.currentPage + 1)}
          disabled={pdfInfo.currentPage >= pdfInfo.numPages || loading || pdfInfo.numPages === 0}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
      
      <div className="border rounded-lg p-6 bg-white shadow-lg flex items-center justify-center overflow-auto">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <div className="text-center">
              <svg className="inline-block animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-2">Loading PDF...</p>
            </div>
          </div>
        )}
        <canvas ref={canvasRef} className="max-w-full"></canvas>
      </div>
      
      <div className="mt-6 p-4 bg-gray-100 rounded-md text-sm">
        <h2 className="font-bold mb-2">Why this approach?</h2>
        <p>This page uses PDF.js directly instead of through react-pdf to eliminate potential compatibility issues. It:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Creates the worker in memory as a blob URL</li>
          <li>Directly renders to a canvas element</li>
          <li>Manually handles PDF fetching and rendering</li>
          <li>Avoids any dependencies on external worker files</li>
        </ul>
      </div>
    </div>
  );
} 