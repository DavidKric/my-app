'use client';

import React, { useEffect, useState } from 'react';

export default function ImageBackupPDFTest() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  
  // Helper to log messages
  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]} - ${message}`]);
  };

  // Load PDF.js script
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    addLog("Loading PDF.js script...");
    
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

  // Use PDF.js to render PDF to an image
  useEffect(() => {
    if (!scriptLoaded) return;
    
    const convertPdfToImage = async () => {
      try {
        addLog("Starting PDF to image conversion...");
        
        // Get the PDF.js library from window
        const pdfjsLib = (window as any).pdfjsLib;
        
        if (!pdfjsLib) {
          throw new Error("PDF.js library not found on window object");
        }
        
        // Local test PDF
        const pdfUrl = '/test.pdf';
        
        addLog(`Loading PDF from: ${pdfUrl}`);
        
        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        
        addLog(`PDF loaded successfully. Number of pages: ${pdf.numPages}`);
        
        // Get the first page
        const page = await pdf.getPage(1);
        
        // Set up an off-screen canvas with good resolution
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        addLog(`Canvas created with dimensions: ${canvas.width}x${canvas.height}`);
        
        // Render to the canvas
        const context = canvas.getContext('2d');
        if (!context) {
          throw new Error("Could not create canvas context");
        }
        
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        addLog("PDF page rendered to canvas");
        
        // Convert the canvas to an image URL
        const imageUrl = canvas.toDataURL('image/png');
        setImageUrl(imageUrl);
        
        addLog("Canvas converted to image successfully");
      } catch (err: any) {
        addLog(`Error in PDF to image conversion: ${err.message}`);
        setError(`Failed to convert PDF to image: ${err.message}`);
      }
    };
    
    convertPdfToImage();
  }, [scriptLoaded]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PDF to Image Backup Test</h1>
      
      <div className="flex gap-2 mb-4">
        <div className={`px-3 py-1 rounded ${scriptLoaded ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          PDF.js Script: {scriptLoaded ? 'Loaded' : 'Loading...'}
        </div>
        
        <div className={`px-3 py-1 rounded ${imageUrl ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          Image: {imageUrl ? 'Generated' : 'Pending...'}
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <h2 className="font-bold text-red-600">Error</h2>
          <p>{error}</p>
        </div>
      )}
      
      <div className="border rounded-lg p-6 bg-white shadow-lg min-h-[400px] flex items-center justify-center">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="PDF Page 1" 
            className="max-w-full max-h-[700px] border border-gray-200" 
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mb-3"></div>
            <p className="text-gray-500">Converting PDF to image...</p>
          </div>
        )}
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