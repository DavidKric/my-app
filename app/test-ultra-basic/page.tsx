'use client';

import React, { useEffect, useRef, useState } from 'react';

// This component uses a minimal approach to render a hardcoded PDF
export default function UltraBasicPDFTest() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  
  // Helper function to add logs
  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]} - ${message}`]);
  };

  // Load PDF.js script directly in the component
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    addLog("Loading PDF.js script...");
    
    // Create a script element
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.min.js';
    script.async = true;
    
    script.onload = () => {
      addLog("PDF.js script loaded successfully!");
      setScriptLoaded(true);
    };
    
    script.onerror = (e) => {
      addLog(`Error loading PDF.js script: ${e}`);
      setError("Failed to load PDF.js library");
    };
    
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Once the script is loaded, render a simple PDF
  useEffect(() => {
    if (!scriptLoaded || !canvasRef.current) return;
    
    // A very small, valid PDF file encoded as base64
    const minimalPdfBase64 = `
      JVBERi0xLjcKJeLjz9MKNSAwIG9iago8PAovRmlsdGVyIC9GbGF0ZURlY29kZQovTGVuZ3RoIDE4Ngo+PgpzdHJlYW0KeJxVj7sOAiEQRfv5ijulGRaXR7GVFtoYC2MP4BKzCQnr8v+FYBQLmGRO7p2ZKxxIXpKClMEJ3QVhYvdEHqPxJR58HxcGfeRsYWbnuQ3QpMCjOHVhTw6rGZ63/8UzaFG+M2rQFLdVL6lZM6gHn0Q1xpiLIw1IxUEGsrZ+AQFOAkjP0EfIRWVmxgcIRRUFCmVuZHN0cmVhbQplbmRvYmoKNyAwIG9iago8PAovQ2F0YWxvZyA0IDAgUgovUGFnZXMgMSAwIFIKL1R5cGUgL09CSkNUCj4+CmVuZG9iagoxIDAgb2JqCjw8Ci9Db3VudCAxCi9LaWRzIFsyIDAgUl0KL1R5cGUgL1BhZ2VzCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9Db250ZW50cyA1IDAgUgovTWVkaWFCb3ggWzAgMCA1OTUgODQyXQovUGFyZW50IDEgMCBSCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDMgMCBSCj4+Cj4+Ci9UeXBlIC9QYWdlCj4+CmVuZG9iagozIDAgb2JqCjw8Ci9CYXNlRm9udCAvSGVsdmV0aWNhCi9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nCi9TdWJ0eXBlIC9UeXBlMQovVHlwZSAvRm9udAo+PgplbmRvYmoKNCAwIG9iago8PAovUGFnZXMgMSAwIFIKL1R5cGUgL0NhdGFsb2cKPj4KZW5kb2JqCjYgMCBvYmoKPDwKL0F1dGhvciAoVGVzdCBBdXRob3IpCi9DcmVhdGlvbkRhdGUgKEQ6MjAyMzA1MjAxMjMwMDBaKQovTW9kRGF0ZSAoRDoyMDIzMDUyMDEyMzAwMFopCi9Qcm9kdWNlciAoVGVzdCBQREYpCi9UaXRsZSAoVGVzdCBQREYpCj4+CmVuZG9iagp4cmVmCjAgOAowMDAwMDAwMDAwIDY1NTM1IGYNCjAwMDAwMDAzNDEgMDAwMDAgbg0KMDAwMDAwMDM5OCAwMDAwMCBuDQowMDAwMDAwNTMzIDAwMDAwIG4NCjAwMDAwMDA2MzAgMDAwMDAgbg0KMDAwMDAwMDAxMCAwMDAwMCBuDQowMDAwMDAwNjc5IDAwMDAwIG4NCjAwMDAwMDAyNjYgMDAwMDAgbg0KdHJhaWxlcgo8PAovSUQgWzw1NTVlODFhNjE4ZWKlKDYyZQ/Pjw1NTVlODFhNjRlOWI0ZGIyZTc4NDhiZmVYXVlDY2U5Pl0KL0luZm8gNiAwIFIKL1JlZnMgWzMgMCBSIDIgMCBSIDUgMCBSIDYgMCBSIDQgMCBSIDcgMCBSIDEgMCBSXQovUm9vdCA3IDAgUgovU2l6ZSA4Cj4+CnN0YXJ0eHJlZgo4MTkKJSVFT0YK
    `;
    
    try {
      // Get the window.pdfjsLib instance
      const pdfjsLib = (window as any).pdfjsLib;
      
      if (!pdfjsLib) {
        throw new Error("PDF.js library not found on window object");
      }
      
      addLog("Starting to render PDF...");
      
      // Convert base64 to binary
      const pdfData = atob(minimalPdfBase64.trim());
      
      // Convert binary to Uint8Array
      const pdfBytes = new Uint8Array(pdfData.length);
      for (let i = 0; i < pdfData.length; i++) {
        pdfBytes[i] = pdfData.charCodeAt(i);
      }
      
      addLog(`PDF data prepared, ${pdfBytes.length} bytes`);
      
      // Load the PDF
      pdfjsLib.getDocument({ data: pdfBytes }).promise.then((pdf: any) => {
        addLog(`PDF loaded successfully. Number of pages: ${pdf.numPages}`);
        
        // Get the first page
        return pdf.getPage(1).then((page: any) => {
          addLog("Page loaded");
          
          // Set up canvas
          const canvas = canvasRef.current;
          const context = canvas?.getContext('2d');
          
          if (!canvas || !context) {
            throw new Error("Canvas or context not available");
          }
          
          // Set viewport
          const viewport = page.getViewport({ scale: 1.5 });
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          
          addLog(`Canvas dimensions set: ${canvas.width}x${canvas.height}`);
          
          // Render the page
          const renderContext = {
            canvasContext: context,
            viewport: viewport
          };
          
          return page.render(renderContext).promise.then(() => {
            addLog("Page rendered successfully!");
          });
        });
      }).catch((err: Error) => {
        addLog(`Error rendering PDF: ${err.message}`);
        setError(`Failed to render PDF: ${err.message}`);
      });
    } catch (err: any) {
      addLog(`Error in PDF rendering setup: ${err.message}`);
      setError(`PDF setup error: ${err.message}`);
    }
  }, [scriptLoaded]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Ultra Basic PDF Test</h1>
      
      <div className="flex gap-2 mb-4">
        <div className={`px-3 py-1 rounded ${scriptLoaded ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          PDF.js Script: {scriptLoaded ? 'Loaded' : 'Loading...'}
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <h2 className="font-bold text-red-600">Error</h2>
          <p>{error}</p>
        </div>
      )}
      
      <div className="border rounded-lg p-6 bg-white shadow-lg min-h-[400px] flex items-center justify-center">
        <canvas ref={canvasRef} className="border border-gray-200"></canvas>
      </div>
      
      <div className="mt-6 p-4 bg-gray-100 rounded-md text-sm">
        <h2 className="font-bold mb-2">Debug Logs</h2>
        <div className="max-h-[200px] overflow-auto bg-black text-green-400 p-2 font-mono text-xs">
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
} 