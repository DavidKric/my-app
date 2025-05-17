'use client'
import { Rect } from './hooks/useAdderOnPage'
import { useContext } from 'react'
import { AnnotationContext, NewAnnotation } from '@/context/AnnotationContext'

export default function AnnotationAdder({ rect, pageIndex }: { rect: Rect; pageIndex: number }) {
  const { addHighlight, addAnnotation } = useContext(AnnotationContext)

  const getInfo = (): NewAnnotation | null => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed) return null
    const range = sel.getRangeAt(0)
    const page = document.querySelectorAll('.pdf-page')[pageIndex] as HTMLElement
    if (!page || !page.contains(range.commonAncestorContainer)) return null
    const bounds = page.getBoundingClientRect()
    const rects = Array.from(range.getClientRects()).map(r => ({
      top: (r.top - bounds.top) / bounds.height,
      left: (r.left - bounds.left) / bounds.width,
      width: r.width / bounds.width,
      height: r.height / bounds.height,
    }))
    const selectedText = sel.toString()
    return { documentId: window.location.pathname, pageNumber: pageIndex, rects, selectedText }
  }

  const handleHighlight = async () => {
    const info = getInfo()
    if (!info) return
    await addHighlight(info)
    selClear()
  }

  const handleAnnotate = async () => {
    const info = getInfo()
    if (!info) return
    await addAnnotation(info)
    selClear()
  }

  const selClear = () => {
    const sel = window.getSelection()
    if (sel) sel.removeAllRanges()
  }
  return (
    <div
      style={{ top: rect.top + rect.height, left: rect.left + rect.width / 2 }}
      className="absolute flex space-x-1 text-xs bg-gray-800 text-white px-2 py-1 rounded"
    >
      <button onClick={handleHighlight}>Highlight</button>
      <button onClick={handleAnnotate}>Annotate</button>
    </div>
  )
}
