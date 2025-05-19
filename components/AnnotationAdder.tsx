'use client'
import { Rect } from './hooks/useAdderOnPage'
import { AnnotationType, Annotation } from '@/components/pdf_viewer/annotations/AnnotationOverlay'
import { useAnnotations, createAnnotationId } from '@/components/context_panel/annotations/AnnotationProvider'
import { Button } from '@/components/ui/button'

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
      className="absolute z-50 flex gap-1 rounded-md bg-muted p-1 shadow"
    >
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-xs"
        onClick={() => handleAdd(AnnotationType.HIGHLIGHT)}
      >
        Highlight
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-xs"
        onClick={() => handleAdd(AnnotationType.NOTE)}
      >
        Annotate
      </Button>
    </div>
  )
}
