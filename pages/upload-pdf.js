import { useState } from 'react';

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setErrorMessage(''); // Clear error when new file is selected
    setApiResponse(null); // Clear previous response
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select a PDF file.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setApiResponse(null);

    const formData = new FormData();
    formData.append('pdfFile', selectedFile);

    try {
      const response = await fetch('/api/process-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setApiResponse(data);
      } else {
        setErrorMessage(data.message || `Error: ${response.status} ${response.statusText}`);
        console.error('API Error:', data);
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      setErrorMessage(`Network error or failed to fetch: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Upload PDF for Processing</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            style={{ marginBottom: '10px' }}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !selectedFile}
          style={{
            padding: '10px 15px',
            backgroundColor: isLoading || !selectedFile ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading || !selectedFile ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Processing...' : 'Process PDF'}
        </button>
      </form>

      {isLoading && <p>Loading...</p>}

      {errorMessage && <p style={{ color: 'red', marginTop: '15px' }}>Error: {errorMessage}</p>}

      {apiResponse && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #eee', borderRadius: '4px' }}>
          <h2>Processing Results:</h2>
          <p><strong>Overall Message:</strong> {apiResponse.message}</p>
          {apiResponse.doclingStatus && <p><strong>Docling Status:</strong> {apiResponse.doclingStatus}</p>}

          {apiResponse.textContent && (
            <div>
              <h3>Text Content:</h3>
              <pre style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f9f9f9', padding: '10px', border: '1px solid #ddd' }}>
                {apiResponse.textContent}
              </pre>
            </div>
          )}

          {apiResponse.jsonContentStructureAnalysis && (
            <p><strong>JSON Content Analysis:</strong> {apiResponse.jsonContentStructureAnalysis}</p>
          )}

          {/* For potentially displaying raw json_content if passed back by API */}
          {/* {apiResponse.json_content && (
            <div>
              <h3>JSON Content (Raw):</h3>
              <pre style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f9f9f9', padding: '10px', border: '1px solid #ddd' }}>
                {JSON.stringify(apiResponse.json_content, null, 2)}
              </pre>
            </div>
          )} */}

          {apiResponse.doclingErrors && apiResponse.doclingErrors.length > 0 && (
            <div>
              <h3 style={{ color: 'orange' }}>Docling Errors:</h3>
              <ul>
                {apiResponse.doclingErrors.map((err, index) => (
                  <li key={index} style={{ color: 'orange' }}>{typeof err === 'object' ? JSON.stringify(err) : err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
