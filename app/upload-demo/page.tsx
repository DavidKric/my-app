import UploadPdfComponent from '@/components/pdf-upload/UploadPdfComponent';

export default function UploadDemoPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Docling-Serve PDF Processing Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload a PDF file to extract text, structure, and metadata using the docling-serve API.
            This demo showcases the TypeScript integration with proper error handling and type safety.
          </p>
        </div>
        
        <UploadPdfComponent />
        
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">✅ TypeScript Integration</h3>
                <p className="text-gray-600 text-sm">
                  Full TypeScript support with proper types for docling-serve API responses.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">🔒 File Validation</h3>
                <p className="text-gray-600 text-sm">
                  Validates file type, size, and format before processing.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">⚡ Multiple Output Formats</h3>
                <p className="text-gray-600 text-sm">
                  Extracts text, JSON structure, HTML, and Markdown from PDFs.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">🛠️ Error Handling</h3>
                <p className="text-gray-600 text-sm">
                  Comprehensive error handling with proper HTTP status codes.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">🌐 OCR Support</h3>
                <p className="text-gray-600 text-sm">
                  Built-in OCR processing for scanned documents and images.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">📊 Document Structure</h3>
                <p className="text-gray-600 text-sm">
                  Extracts tables, headers, paragraphs, and document hierarchy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 