'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAnnotations } from '@/components/context_panel/annotations/AnnotationProvider';
import { AlertCircle, FileWarning } from 'lucide-react';
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

// Import the original PDFViewer component with all its features
const PDFViewer = dynamic(
  () => import('../../../components/pdf_viewer/core/PDFViewer'),
  { ssr: false }
);

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

function PDFViewerContent() {
  const searchParams = useSearchParams();
  const fileParam = searchParams?.get('file'); 
  const { state, dispatch } = useAnnotations();
  
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Debug: log state on every render
  useEffect(() => {
    console.log('[DEBUG][PDFViewerPage] fileParam:', fileParam, 'fileUrl:', fileUrl, 'pdfData:', pdfData, 'loading:', loading, 'error:', error);
  }, [fileParam, fileUrl, pdfData, loading, error]);

  useEffect(() => {
    async function prepareFileUrl() {
      setLoading(true);
      setError(null);
      setPdfData(null);
      
      try {
        console.log("File parameter:", fileParam);
        
        // If no file parameter is provided, use a default sample PDF
        if (!fileParam) {
          console.log("No file parameter - using default contract.pdf");
          setFileUrl('/sample-pdfs/contract.pdf');
          setLoading(false);
          return;
        }
        
        // For direct URLs (starting with http), use proxy
        if (fileParam.startsWith('http')) {
          const proxyUrl = `/api/proxy/pdf?url=${encodeURIComponent(fileParam)}`;
          console.log("Using proxied URL directly:", proxyUrl);
          setFileUrl(proxyUrl);
          setLoading(false);
          return;
        }
        
        // Handle file IDs with comprehensive mapping based on layout.tsx structure
        if (fileParam.startsWith('file-')) {
          // Define comprehensive file mapping that matches the structure in layout.tsx
          const fileMapping: Record<string, { type: 'local' | 'url', path?: string, url?: string }> = {
            // Pleadings folder
            'file-complaint': { type: 'local', path: '/sample-pdfs/complaint.pdf' },
            'file-answer': { type: 'local', path: '/sample-pdfs/answer.pdf' },
            'file-exhibit-a-url': { type: 'url', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
            'file-exhibit-b-local': { type: 'local', path: '/sample-pdfs/contract.pdf' },
            
            // Discovery/Interrogatories folder
            'file-interrogatories': { type: 'local', path: '/sample-pdfs/First_Set.pdf' },
            'file-arxiv-2404-16130': { type: 'url', url: 'https://arxiv.org/pdf/2404.16130' },
            
            // Case 2 files
            'file-contract': { type: 'local', path: '/sample-pdfs/contract.pdf' },
          };
          
          const fileConfig = fileMapping[fileParam];
          
          if (fileConfig) {
            if (fileConfig.type === 'local') {
              console.log(`Using local file: ${fileConfig.path}`);
              setFileUrl(fileConfig.path || null);
            } else if (fileConfig.type === 'url') {
              console.log(`Using URL via proxy: ${fileConfig.url}`);
              const proxyUrl = `/api/proxy/pdf?url=${encodeURIComponent(fileConfig.url!)}`;
              setFileUrl(proxyUrl);
            }
          } else {
            // Fallback: try to derive filename from ID
            const derivedPath = `/sample-pdfs/${fileParam.replace('file-', '')}.pdf`;
            console.log("Using fallback derived path:", derivedPath);
            setFileUrl(derivedPath);
          }
          
          setLoading(false);
        } else {
          // Assume it's a simple filename
          const url = `/sample-pdfs/${fileParam}.pdf`;
          console.log("Using derived sample PDF:", url);
          setFileUrl(url);
          setLoading(false);
        }
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

  const handleDocumentLoadSuccess = (numPages: number, outline?: any[]) => {
    console.log(`Document loaded successfully with ${numPages} pages`);
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

  if (!fileUrl && !pdfData) {
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
    <>
      {/* Add the resource controller to handle preload warnings */}
      <ResourceController />
      <NoSSR>
        <PDFViewer
          fileUrl={fileUrl}
          pdfData={pdfData}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onDocumentLoaded={handleDocumentLoadSuccess}
          annotations={state.annotations as any[]}
          showSearchBar={true}
          onCreateAnnotation={(annotationData) => {
            const id = `annotation-${Date.now()}`;
            dispatch({
              type: 'ADD_ANNOTATION',
              annotation: {
                id,
                ...annotationData,
                timestamp: Date.now(),
                creator: 'USER'
              } as any
            });
            return id;
          }}
          onAnnotationSelected={(annotation) => {
            console.log('Annotation selected:', annotation);
            dispatch({ type: 'SELECT_ANNOTATION', id: annotation.id });
          }}
        />
      </NoSSR>
    </>
  );
}

export default function PDFViewerPage() {
  // Remove LayoutClient wrapper - it's already provided by the workspace layout
  return <PDFViewerContent />;
}
