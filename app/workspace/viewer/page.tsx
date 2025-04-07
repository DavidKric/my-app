'use client';

// Import the centralized PDF setup
import '@/lib/pdf-setup';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAnnotations } from '@/components/context_panel/annotations/AnnotationProvider';
import { AlertCircle, FileWarning } from 'lucide-react';

// Dynamically import the PDFViewer component to avoid SSR issues
const PDFViewer = dynamic(
  () => import('../../../components/pdf_viewer/core/PDFViewer'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <div className="mb-2">Loading PDF viewer...</div>
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }
);

export default function PDFViewerPage() {
  const searchParams = useSearchParams();
  const fileParam = searchParams?.get('file'); 
  const { state, dispatch } = useAnnotations();
  
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    async function prepareFileUrl() {
      setLoading(true);
      setError(null);
      
      try {
        // Direct URL provided in code - use this first
        const directPdfUrl = "https://aclanthology.org/2023.emnlp-demo.45.pdf";
        // Create a proxy URL to avoid CORS issues
        const proxyUrl = `/api/proxy/pdf?url=${encodeURIComponent(directPdfUrl)}`;
        console.log("Using proxied external PDF URL:", proxyUrl);
        setFileUrl(proxyUrl);
        setLoading(false);
        
        // Code below is commented out since we're using the direct URL approach
        // If you want to use the URL from search params instead, remove the return above
        // and uncomment this code
        
        /*
        console.log("File parameter:", fileParam);
        
        // If no file parameter is provided, use a default sample PDF
        if (!fileParam) {
          console.log("No file parameter - using default example.pdf");
          setFileUrl('/sample-pdfs/example.pdf');
          setLoading(false);
          return;
        }
        
        // For actual files, construct the URL
        if (fileParam.startsWith('http')) {
          // Direct URL was provided
          console.log("Using direct URL:", fileParam);
          setFileUrl(fileParam);
        } else if (fileParam === 'file-complaint') {
          console.log("Using complaint.pdf sample");
          setFileUrl('/sample-pdfs/complaint.pdf');
        } else if (fileParam === 'file-contract') {
          console.log("Using contract.pdf sample");
          setFileUrl('/sample-pdfs/contract.pdf');
        } else if (fileParam === 'file-answer') {
          console.log("Using answer.pdf sample");
          setFileUrl('/sample-pdfs/answer.pdf');
        } else if (fileParam === 'file-interrogatories') {
          console.log("Using interrogatories.pdf sample");
          setFileUrl('/sample-pdfs/interrogatories.pdf');
        } else {
          // Assume it's a file name that matches one of our samples
          const url = `/sample-pdfs/${fileParam}.pdf`;
          console.log("Using derived sample PDF:", url);
          setFileUrl(url);
          
          // Validate that the file exists by attempting to fetch its headers
          fetch(url, { method: 'HEAD' })
            .then(response => {
              if (!response.ok) {
                console.error(`File not found: ${url}`);
                setError(`The specified PDF file was not found. Please check the file name.`);
              } else {
                console.log(`File exists: ${url}`);
              }
            })
            .catch(err => {
              console.error(`Error checking file: ${url}`, err);
              setError(`Error accessing the PDF file. Please try again later.`);
            });
        }
        
        setLoading(false);
        */
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
      <div className="flex-1">
        <PDFViewer
          fileUrl={fileUrl}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
