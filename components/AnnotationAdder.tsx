'use client'
import { Rect } from './hooks/useAdderOnPage'
import { AnnotationType, Annotation } from '@/components/pdf_viewer/annotations/AnnotationOverlay'
import { useAnnotations, createAnnotationId } from '@/components/context_panel/annotations/AnnotationProvider'

export default function AnnotationAdder({ rect, rects, text, pageIndex }: { rect: Rect; rects: Rect[]; text: string; pageIndex: number }) {
  const { addAnnotation } = useAnnotations()

  const handleAdd = (type: AnnotationType) => {
    const boundingRect = { x: rect.left, y: rect.top, width: rect.width, height: rect.height }
    const annotation: Annotation = {
      id: createAnnotationId(),
      pageNumber: pageIndex,
      boundingRect,
      content: text,
      textSnippet: text,
      type,
      category: 'Other',
      creator: 'USER',
      timestamp: Date.now()
    }
    addAnnotation(annotation)
  }

  return (
    <div
      style={{ top: rect.top + rect.height, left: rect.left + rect.width / 2 }}
      className="absolute flex space-x-1 text-xs bg-gray-800 text-white px-2 py-1 rounded"
    >
      <button onClick={() => handleAdd(AnnotationType.HIGHLIGHT)}>Highlight</button>
      <button onClick={() => handleAdd(AnnotationType.NOTE)}>Annotate</button>
    </div>
  )
}
