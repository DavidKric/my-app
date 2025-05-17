'use client'
import { BoundingBox } from '@allenai/pdf-components'
import { useAnnotations } from '@/components/context_panel/annotations/AnnotationProvider'

export default function AnnotationOverlay({ pageIndex }: { pageIndex: number }) {
  const { state, dispatch } = useAnnotations()
  const { annotations, selectedAnnotationId } = state
  const pageAnnots = annotations.filter(a => (a as any).pageNumber === pageIndex)
  return (
    <>
      {pageAnnots.map(a =>
        (a as any).rects.map((r: any, i: number) => (
          <BoundingBox
            key={a.id + i}
            page={pageIndex}
            {...r}
            className={`bg-yellow-300 bg-opacity-50 ${selectedAnnotationId === a.id ? 'ring-2 ring-yellow-400' : ''}`}
            onClick={() => dispatch({ type: 'SELECT_ANNOTATION', id: a.id })}
          />
        ))
      )}
    </>
  )
}
