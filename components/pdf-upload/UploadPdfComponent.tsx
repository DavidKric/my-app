'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import type { ProcessPdfResponse, ProcessPdfSuccessResponse } from '@/types/docling-serve';

interface UploadState {
  selectedFile: File | null;
  apiResponse: ProcessPdfSuccessResponse | null;
  isLoading: boolean;
  errorMessage: string;
}

interface ApiError {
  message: string;
  error?: string;
  details?: any;
}

const UploadPdfComponent: React.FC = () => {
  const [state, setState] = useState<UploadState>({
    selectedFile: null,
    apiResponse: null,
    isLoading: false,
    errorMessage: '',
  });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0] || null;
    setState(prev => ({
      ...prev,
      selectedFile: file,
      errorMessage: '', // Clear error when new file is selected
      apiResponse: null, // Clear previous response
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    
    if (!state.selectedFile) {
      setState(prev => ({ ...prev, errorMessage: 'Please select a PDF file.' }));
      return;
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      errorMessage: '',
      apiResponse: null,
    }));

    const formData = new FormData();
    formData.append('pdfFile', state.selectedFile);

    try {
      console.log('Uploading file:', state.selectedFile.name);
      
      const response = await fetch('/api/process-pdf', {
        method: 'POST',
        body: formData,
      });

      const data: ProcessPdfResponse | ApiError = await response.json();

      if (response.ok) {
        console.log('Processing successful:', data);
        setState(prev => ({ ...prev, apiResponse: data as ProcessPdfSuccessResponse }));
      } else {
        const errorData = data as ApiError;
        const errorMessage = errorData.message || `Error: ${response.status} ${response.statusText}`;
        console.error('API Error:', errorData);
        setState(prev => ({ ...prev, errorMessage }));
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      const errorMessage = error instanceof Error 
        ? `Network error: ${error.message}`
        : 'Failed to process file. Please try again.';
      setState(prev => ({ ...prev, errorMessage }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const { selectedFile, apiResponse, isLoading, errorMessage } = state;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Upload PDF for Processing</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="pdfFile" className="block text-sm font-medium text-gray-700 mb-2">
            Select PDF File
          </label>
          <input
            id="pdfFile"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          {selectedFile && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !selectedFile}
          className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
            isLoading || !selectedFile
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            'Process PDF'
          )}
        </button>
      </form>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Processing Results */}
      {apiResponse && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Processing Results</h2>
          
          <div className="space-y-4">
            <div>
              <span className="font-medium text-gray-700">Status:</span>
              <span className="ml-2 text-gray-900">{apiResponse.message}</span>
            </div>
            
            {apiResponse.doclingStatus && (
              <div>
                <span className="font-medium text-gray-700">Docling Status:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                  apiResponse.doclingStatus === 'success' 
                    ? 'bg-green-100 text-green-800' 
                    : apiResponse.doclingStatus === 'partial_success'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {apiResponse.doclingStatus}
                </span>
              </div>
            )}

            {/* Text Content */}
            {apiResponse.textContent && (
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Extracted Text Content</h3>
                <div className="bg-white border rounded-md p-4 max-h-64 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                    {apiResponse.textContent}
                  </pre>
                </div>
              </div>
            )}

            {/* JSON Content Analysis */}
            {apiResponse.jsonContent && (
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Document Structure (JSON)</h3>
                <div className="bg-white border rounded-md p-4 max-h-64 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-xs text-gray-600 font-mono">
                    {JSON.stringify(apiResponse.jsonContent, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* HTML Content */}
            {apiResponse.htmlContent && (
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">HTML Content</h3>
                <div className="bg-white border rounded-md p-4 max-h-64 overflow-y-auto">
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: apiResponse.htmlContent }}
                  />
                </div>
              </div>
            )}

            {/* Markdown Content */}
            {apiResponse.mdContent && (
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Markdown Content</h3>
                <div className="bg-white border rounded-md p-4 max-h-64 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                    {apiResponse.mdContent}
                  </pre>
                </div>
              </div>
            )}

                         {/* Warnings */}
             {apiResponse.warnings && apiResponse.warnings.length > 0 && (
               <div>
                 <h3 className="text-lg font-medium text-yellow-600 mb-2">Warnings</h3>
                 <ul className="list-disc list-inside space-y-1">
                   {apiResponse.warnings.map((warning: any, index: number) => (
                     <li key={index} className="text-sm text-yellow-700">
                       {typeof warning === 'string' ? warning : JSON.stringify(warning)}
                     </li>
                   ))}
                 </ul>
               </div>
             )}

             {/* Docling Errors */}
             {apiResponse.doclingErrors && apiResponse.doclingErrors.length > 0 && (
               <div>
                 <h3 className="text-lg font-medium text-orange-600 mb-2">Processing Errors</h3>
                 <ul className="list-disc list-inside space-y-1">
                   {apiResponse.doclingErrors.map((error: any, index: number) => (
                     <li key={index} className="text-sm text-orange-700">
                       {typeof error === 'string' ? error : JSON.stringify(error)}
                     </li>
                   ))}
                 </ul>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPdfComponent; 