'use client'
import { Rect } from './hooks/useAdderOnPage'
import { useContext } from 'react'
import { AnnotationContext } from '@/context/AnnotationContext'

export default function AnnotationAdder({ rect }: { rect: Rect }) {
  const { addHighlight, addAnnotation } = useContext(AnnotationContext)
  return (
    <div
      style={{ top: rect.top + rect.height, left: rect.left + rect.width / 2 }}
      className="absolute flex space-x-1 text-xs bg-gray-800 text-white px-2 py-1 rounded"
    >
      <button onClick={addHighlight}>Highlight</button>
      <button onClick={addAnnotation}>Annotate</button>
    </div>
  )
}
