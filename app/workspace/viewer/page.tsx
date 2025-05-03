'use client';

// Import the centralized PDF setup
import '@/lib/pdf-setup';

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAnnotations } from '@/components/context_panel/annotations/AnnotationProvider';
import { AlertCircle, FileWarning, Loader2 } from 'lucide-react';
import Script from 'next/script';

// We create a loading component that will be shown while the PDFViewer is loading
const LoadingComponent = () => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="text-center">
      <div className="mb-2">Loading PDF viewer...</div>
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
    </div>
  </div>
);

// Use NoSSR wrapper to prevent SSR issues with the PDFViewer
const NoSSR = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return <LoadingComponent />;
  }
  
  return <>{children}</>;
};

// Custom script to control resource loading
const ResourceController = () => {
  return (
    <Script 
      id="resource-controller"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          // Control preloaded resources to prevent warnings
          window.addEventListener('load', () => {
            // Find and remove unused preload links after page load
            setTimeout(() => {
              const preloads = document.querySelectorAll('link[rel="preload"]');
              preloads.forEach(link => {
                // Check if the preload has been used
                if (link.as === 'style' || link.as === 'script') {
                  // For styles and scripts, we can check if they were actually loaded
                  const href = link.getAttribute('href');
                  const wasUsed = Array.from(document.querySelectorAll('link[rel="stylesheet"], script'))
                    .some(el => el.getAttribute('href') === href || el.getAttribute('src') === href);
                  
                  if (!wasUsed) {
                    // If not used, remove it to prevent warnings
                    link.remove();
                  }
                }
              });
            }, 1000); // Give resources a second to be used after page load
          });
        `
      }}
    />
  );
};

// Import PDFComponents directly - this is what actually renders the PDF
const PDFComponents = dynamic(
  () => import('../../../components/pdf_viewer/core/PDFComponents'),
  { ssr: false }
);

export default function PDFViewerPage() {
  const searchParams = useSearchParams();
  const fileParam = searchParams?.get('file'); 
  const { state, dispatch } = useAnnotations();
  
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [scale, setScale] = useState(1.0);
  const [numPages, setNumPages] = useState(0);

  useEffect(() => {
    async function prepareFileUrl() {
      setLoading(true);
      setError(null);
      setPdfData(null);
      
      try {
        console.log("File parameter:", fileParam);
        
        // If no file parameter is provided, use a default sample PDF
        if (!fileParam) {
          console.log("No file parameter - using default example.pdf");
          setFileUrl('/sample-pdfs/contract.pdf');
          setLoading(false);
          return;
        }
        
        // For actual files, construct the URL
        if (fileParam.startsWith('http')) {
          // Direct URL was provided - Try to fetch the PDF directly with proxy
          console.log("Using direct URL through proxy:", fileParam);
          
          try {
            // Full fetch of the PDF through the proxy
            const proxyUrl = `/api/proxy/pdf?url=${encodeURIComponent(fileParam)}`;
            console.log("Fetching PDF data from proxy...");
            const response = await fetch(proxyUrl);
            
            if (!response.ok) {
              throw new Error(`Proxy returned status: ${response.status}`);
            }
            
            // Get the ArrayBuffer
            const pdfBuffer = await response.arrayBuffer();
            console.log("Received PDF data:", pdfBuffer.byteLength, "bytes");
            
            // Convert to Uint8Array for PDF.js
            const pdfDataArray = new Uint8Array(pdfBuffer);
            setPdfData(pdfDataArray);
            setFileUrl(null); // We're using binary data instead of URL
          } catch (e) {
            console.error("Failed to fetch PDF through proxy:", e);
            // Fallback to using the proxy URL directly
            const proxyUrl = `/api/proxy/pdf?url=${encodeURIComponent(fileParam)}`;
            setFileUrl(proxyUrl);
          }
        } else if (fileParam.startsWith('file-')) {
          // Handle our file IDs from FileNode
          const fileNode = fileParam;
          
          // Look for the file from the file structure
          // First check if it has a url property
          if (fileNode.includes('exhibit-a-url')) {
            // For external URLs, try to fetch the PDF directly
            const url = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
            console.log("Using URL from FileNode:", url);
            
            try {
              // Full fetch of the PDF through the proxy
              const proxyUrl = `/api/proxy/pdf?url=${encodeURIComponent(url)}`;
              console.log("Fetching PDF data from proxy...");
              const response = await fetch(proxyUrl);
              
              if (!response.ok) {
                throw new Error(`Proxy returned status: ${response.status}`);
              }
              
              // Get the ArrayBuffer
              const pdfBuffer = await response.arrayBuffer();
              console.log("Received PDF data:", pdfBuffer.byteLength, "bytes");
              
              // Convert to Uint8Array for PDF.js
              const pdfDataArray = new Uint8Array(pdfBuffer);
              setPdfData(pdfDataArray);
              setFileUrl(null); // We're using binary data instead of URL
            } catch (e) {
              console.error("Failed to fetch PDF through proxy:", e);
              // Fallback to using the proxy URL directly
              const proxyUrl = `/api/proxy/pdf?url=${encodeURIComponent(url)}`;
              setFileUrl(proxyUrl);
            }
          } 
          // Then check if it has a path property
          else if (fileNode.includes('exhibit-b-local')) {
            const localPath = '/sample-pdfs/contract.pdf';
            console.log("Using local path from FileNode:", localPath);
            setFileUrl(localPath);
          } 
          // Otherwise use our existing sample PDF mapping
          else if (fileNode === 'file-complaint') {
            console.log("Using complaint.pdf sample");
            setFileUrl('/sample-pdfs/complaint.pdf');
          } else if (fileNode === 'file-contract') {
            console.log("Using contract.pdf sample");
            setFileUrl('/sample-pdfs/contract.pdf');
          } else if (fileNode === 'file-answer') {
            console.log("Using answer.pdf sample");
            setFileUrl('/sample-pdfs/answer.pdf');
          } else if (fileNode === 'file-interrogatories') {
            console.log("Using interrogatories.pdf sample");
            setFileUrl('/sample-pdfs/interrogatories.pdf');
          } else {
            // Assume it's a file name that matches one of our samples
            const url = `/sample-pdfs/${fileNode.replace('file-', '')}.pdf`;
            console.log("Using derived sample PDF:", url);
            setFileUrl(url);
          }
        } else {
          // Assume it's a simple filename
          const url = `/sample-pdfs/${fileParam}.pdf`;
          console.log("Using derived sample PDF:", url);
          setFileUrl(url);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error preparing file URL:', err);
        setError('Failed to load the document. Please try again.');
        setLoading(false);
      }
    }
    
    prepareFileUrl();
  }, [fileParam]);

  const handlePageChange = (page: number) => {
    console.log(`Changing to page ${page}`);
    setCurrentPage(page);
    dispatch({ type: 'SET_CURRENT_PAGE', page });
  };

  const handleDocumentLoadSuccess = (data: { numPages: number }) => {
    console.log(`Document loaded successfully with ${data.numPages} pages`);
    setNumPages(data.numPages);
    setLoading(false);
  };

  const handleDocumentLoadError = (error: Error) => {
    console.error('Error loading document:', error);
    setError(`Failed to load PDF: ${error.message}`);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <div className="mb-2">Loading document...</div>
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="max-w-md p-8 bg-destructive/10 text-destructive rounded-lg shadow-sm">
          <AlertCircle className="h-8 w-8 mb-4 mx-auto text-destructive" />
          <h3 className="text-lg font-medium text-center mb-2">Error Loading Document</h3>
          <p className="text-center">{error}</p>
        </div>
      </div>
    );
  }

  if (!fileUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="max-w-md p-8 bg-muted rounded-lg shadow-sm">
          <FileWarning className="h-8 w-8 mb-4 mx-auto text-muted-foreground" />
          <h3 className="text-lg font-medium text-center mb-2">No Document Selected</h3>
          <p className="text-center">Please choose a document to view or provide a valid document parameter.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      <ResourceController />
      <div className="flex-1">
        <NoSSR>
          <PDFComponents
            fileUrl={fileUrl}
            pdfData={pdfData}
            currentPage={currentPage}
            scale={scale}
            onPageChange={handlePageChange}
            onDocumentLoadSuccess={handleDocumentLoadSuccess}
            onDocumentLoadError={handleDocumentLoadError}
          />
        </NoSSR>
      </div>
    </div>
  );
}
