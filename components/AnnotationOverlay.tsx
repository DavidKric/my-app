'use client'
import { useContext } from 'react'
import { BoundingBox } from '@allenai/pdf-components'
import { AnnotationContext } from '@/context/AnnotationContext'

export default function AnnotationOverlay({ pageIndex }: { pageIndex: number }) {
  const { annotations, setActiveAnnotationId, activeAnnotationId } = useContext(AnnotationContext)
  const pageAnnots = annotations.filter(a => a.pageNumber === pageIndex)
  return (
    <>
      {pageAnnots.map(a =>
        a.rects.map((r: any, i: number) => (
          <BoundingBox
            key={a.id + i}
            page={pageIndex}
            {...r}
            className={`bg-yellow-300 bg-opacity-50 ${activeAnnotationId === a.id ? 'ring-2 ring-yellow-400' : ''}`}
            onClick={() => setActiveAnnotationId(a.id)}
          />
        ))
      )}
    </>
  )
}
