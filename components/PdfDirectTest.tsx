// Minimal direct test for react-pdf
'use client'
import { Document, Page, pdfjs } from 'react-pdf'
import { useState } from 'react'

// Ensure worker is set (should match your setup)
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

export default function PdfDirectTest({ fileUrl }: { fileUrl: string }) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  return (
    <div style={{ padding: 32 }}>
      <h2>Direct react-pdf Test</h2>
      <div>
        <b>fileUrl:</b> {fileUrl}
      </div>
      <div>
        <b>numPages:</b> {numPages}
      </div>
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      <div style={{ border: '1px solid #ccc', marginTop: 16 }}>
        <Document
          file={fileUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          onLoadError={err => setError(err.message)}
        >
          {Array.from({ length: numPages || 0 }, (_, i) => (
            <Page key={i} pageNumber={i + 1} />
          ))}
        </Document>
      </div>
    </div>
  )
} 