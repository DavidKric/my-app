'use client'
import { ContextProvider, DocumentWrapper, DocumentContext } from '@allenai/pdf-components'
import { useContext } from 'react'
import PageView from './PageView'

function InnerViewer({ pdfUrl }: { pdfUrl: string }) {
  const { numPages } = useContext(DocumentContext)
  return (
    <DocumentWrapper file={pdfUrl}>
      {Array.from({ length: numPages }, (_, i) => (
        <PageView key={i} pageIndex={i} />
      ))}
    </DocumentWrapper>
  )
}

export default function PdfViewer({ pdfUrl }: { pdfUrl: string }) {
  return (
    <ContextProvider>
      <InnerViewer pdfUrl={pdfUrl} />
    </ContextProvider>
  )
}
