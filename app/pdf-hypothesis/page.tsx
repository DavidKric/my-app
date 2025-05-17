'use client'
import PdfViewer from '@/components/PdfViewer'
import { AnnotationSidebar as ProfessionalAnnotationSidebar } from '@/components/context_panel/annotations/ProfessionalAnnotationSidebar'
import { AnnotationProvider } from '@/components/context_panel/annotations/AnnotationProvider'

export default function Page() {
  const url = '/sample-pdfs/contract.pdf'
  return (
    <AnnotationProvider documentId={url}>
      <div className="flex h-screen">
        <div className="flex-1 relative">
          <PdfViewer pdfUrl={url} />
        </div>
        <ProfessionalAnnotationSidebar />
      </div>
    </AnnotationProvider>
  )
}
