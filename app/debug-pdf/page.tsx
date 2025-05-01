'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

export default function DebugPDFPage() {
  const [pdfContent, setPdfContent] = useState<any>(null);
  const [loading, setLoading] = useState(false); // Start as idle
  const [error, setError] = useState<string | null>(null);
  const [selectedUrl, setSelectedUrl] = useState<string>('https://aclanthology.org/2023.emnlp-demo.45.pdf');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [workerSrc, setWorkerSrc] = useState<string | null>(null); // State for worker source
  
  // Setup PDF worker only on client
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
      
      // Set worker source in global options and state
      pdfjs.GlobalWorkerOptions.workerSrc = blobUrl;
      setWorkerSrc(blobUrl);
      console.log("Worker URL set to blob URL on Debug Page");
    } catch (err: any) {
      console.error('Worker setup error:', err);
      setError(`Worker setup failed: ${err?.message || 'Unknown error'}`);
      setWorkerSrc('error'); // Indicate worker setup failed
    }
  }, []);
  
  // Function to check PDF
  const checkPDF = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo(null);
    
    try {
      const response = await fetch(`/api/pdf-check?url=${encodeURIComponent(selectedUrl)}`);
      if (!response.ok) {
         throw new Error(`API check failed with status ${response.status}`);
      }
      const data = await response.json();
      setDebugInfo(data);
      
      if (data.error) {
         setError(`API check returned error: ${data.error}`);
      } else if (!data.isPDF) {
        setError(`The proxy did not return a valid PDF. Content starts with: ${data.summary || '[empty]'}`);
      } else {
        // Optionally clear error if PDF check is successful
        // setError(null);
      }
      
      setLoading(false);
    } catch (err: any) {
      console.error('Error checking PDF:', err);
      setError(`Failed to check PDF: ${err.message}`);
      setLoading(false);
    }
  };
  
  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkPDF();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PDF Debug Page</h1>
      
      {/* Display Worker Status */} 
      <div className={`mb-4 p-3 rounded-md border ${workerSrc === 'error' ? 'bg-red-50 border-red-200' : workerSrc ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <span className="font-semibold">Worker Status:</span> 
          {workerSrc === 'error' ? <span className="text-red-600"> Error during setup</span> : workerSrc ? <span className="text-green-700"> Ready (Blob URL)</span> : ' Initializing...'}
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h2 className="text-lg font-bold mb-2">PDF URL Checker</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            type="text"
            value={selectedUrl}
            onChange={(e) => setSelectedUrl(e.target.value)}
            className="p-2 border rounded w-full"
            placeholder="Enter PDF URL to check"
          />
          <div className="flex gap-2 flex-wrap">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              disabled={loading || !workerSrc || workerSrc === 'error'}
            >
              {loading ? 'Checking...' : 'Check PDF'}
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              onClick={() => {
                window.open(`/api/proxy/pdf?url=${encodeURIComponent(selectedUrl)}`, '_blank');
              }}
            >
              Open Proxied URL
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              onClick={() => {
                window.open(`/test-proxy`, '_self');
              }}
            >
              Go to Proxy Test Page
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              onClick={() => {
                window.open(`/test-minimal`, '_self');
              }}
            >
              Go to Minimal Test Page
            </button>
          </div>
        </form>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <h2 className="font-bold text-red-600">Error</h2>
          <p className="whitespace-pre-wrap break-words">{error}</p>
        </div>
      )}
      
      {debugInfo && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md overflow-auto">
          <h2 className="font-bold text-green-800 mb-2">PDF Check Result</h2>
          <pre className="text-xs overflow-auto max-h-96">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
      
      {!debugInfo && !error && !loading && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
              <p>Enter a PDF URL and click "Check PDF" to analyze the response from your proxy.</p>
          </div>
      )}

      <div className="bg-white p-4 border rounded-md mt-6">
        <h2 className="font-bold mb-4">Troubleshooting Steps</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Use the "Check PDF" button to analyze the response from your <code>/api/proxy/pdf</code> endpoint.
          </li>
           <li>
            Look at the <span className="font-semibold">PDF Check Result</span> above. Is <code>isPDF</code> true? Is the <code>contentType</code> correct (application/pdf)?
          </li>
          <li>
            If the check fails or shows incorrect data, investigate your proxy endpoint (<code>/api/proxy/pdf</code>).
          </li>
          <li>
            Use the "Open Proxied URL" button to see what the browser receives directly from the proxy.
          </li>
          <li>
            Check the browser console (F12 or Right-click -&gt; Inspect -&gt; Console) for additional errors.
          </li>
        </ul>
      </div>
    </div>
  );
} 