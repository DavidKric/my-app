'use client'
import { Rect } from './hooks/useAdderOnPage'
import { useContext } from 'react'
import { AnnotationContext } from '@/context/AnnotationContext'

export default function AnnotationAdder({ rect, rects, text, pageIndex }: { rect: Rect; rects: Rect[]; text: string; pageIndex: number }) {
  const { addHighlight, addAnnotation } = useContext(AnnotationContext)
  return (
    <div
      style={{ top: rect.top + rect.height, left: rect.left + rect.width / 2 }}
      className="absolute flex space-x-1 text-xs bg-gray-800 text-white px-2 py-1 rounded"
    >
      <button onClick={() => addHighlight(pageIndex, rects, text)}>Highlight</button>
      <button onClick={() => addAnnotation(pageIndex, rects, text)}>Annotate</button>
    </div>
  )
}
