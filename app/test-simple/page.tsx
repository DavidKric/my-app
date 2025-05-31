'use client';

import SimplePDFViewer from '@/components/pdf_viewer/SimplePDFViewer';

export default function TestSimplePage() {
  const handleDocumentLoad = (numPages: number) => {
    console.log('Document loaded with', numPages, 'pages');
  };

  const handlePageChange = (page: number) => {
    console.log('Page changed to', page);
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Simple PDF Viewer Test</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[80vh]">
          {/* Test with direct arXiv URL */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-800 text-white p-2 text-sm font-medium">
              Direct arXiv URL
            </div>
            <SimplePDFViewer
              fileUrl="https://arxiv.org/pdf/2404.16130"
              onDocumentLoad={handleDocumentLoad}
              onPageChange={handlePageChange}
              className="h-full"
            />
          </div>
          
          {/* Test with proxy URL */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-800 text-white p-2 text-sm font-medium">
              Proxy URL
            </div>
            <SimplePDFViewer
              fileUrl="/api/proxy/pdf?url=https%3A%2F%2Farxiv.org%2Fpdf%2F2404.16130"
              onDocumentLoad={handleDocumentLoad}
              onPageChange={handlePageChange}
              className="h-full"
            />
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>This test compares direct URL vs proxy URL loading to identify the root issue.</p>
        </div>
      </div>
    </div>
  );
} 