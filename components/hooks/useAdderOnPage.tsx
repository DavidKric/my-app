'use client'
import { useState, useEffect } from 'react'

export interface Rect {
  top: number
  left: number
  width: number
  height: number
}

export function useAdderOnPage(pageIndex: number) {
  const [rect, setRect] = useState<Rect | null>(null)
  const [showAdder, setShowAdder] = useState(false)

  useEffect(() => {
    const handler = () => {
      const sel = document.getSelection()
      if (!sel || sel.isCollapsed) {
        setShowAdder(false)
        return
      }
      const range = sel.getRangeAt(0)
      const rects = range.getClientRects()
      if (rects.length === 0) {
        setShowAdder(false)
        return
      }
      const last = rects[rects.length - 1]
      const page = document.querySelectorAll('.pdf-page')[pageIndex] as HTMLElement
      if (!page || !page.contains(range.commonAncestorContainer)) {
        setShowAdder(false)
        return
      }
      const bounds = page.getBoundingClientRect()
      setRect({
        top: last.top - bounds.top,
        left: last.left - bounds.left,
        width: last.width,
        height: last.height,
      })
      setShowAdder(true)
    }
    document.addEventListener('selectionchange', handler)
    return () => document.removeEventListener('selectionchange', handler)
  }, [pageIndex])

  return { showAdder, rect }
}
