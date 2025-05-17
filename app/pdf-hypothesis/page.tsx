'use client'
import PdfViewer from '@/components/PdfViewer'
import AnnotationSidebar from '@/components/AnnotationSidebar'
import { AnnotationProvider } from '@/context/AnnotationContext'

export default function Page() {
  const url = '/sample-pdfs/contract.pdf'
  return (
    <AnnotationProvider documentId={url}>
      <div className="flex h-screen">
        <div className="flex-1 relative">
          <PdfViewer pdfUrl={url} />
        </div>
        <AnnotationSidebar />
      </div>
    </AnnotationProvider>
  )
}
