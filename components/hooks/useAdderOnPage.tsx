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
  const [rects, setRects] = useState<Rect[]>([])
  const [text, setText] = useState('')
  const [showAdder, setShowAdder] = useState(false)

  useEffect(() => {
    const handler = () => {
      const sel = document.getSelection()
      if (!sel || sel.isCollapsed) {
        setShowAdder(false)
        return
      }
      const range = sel.getRangeAt(0)
      const clientRects = Array.from(range.getClientRects())
      if (clientRects.length === 0) {
        setShowAdder(false)
        return
      }
      const page = document.querySelectorAll('.pdf-page')[pageIndex] as HTMLElement
      if (!page || !page.contains(range.commonAncestorContainer)) {
        setShowAdder(false)
        return
      }
      const bounds = page.getBoundingClientRect()
      const relRects = clientRects.map(r => ({
        top: r.top - bounds.top,
        left: r.left - bounds.left,
        width: r.width,
        height: r.height,
      }))
      const last = relRects[relRects.length - 1]
      setRect(last)
      setRects(relRects)
      setText(sel.toString())
      setShowAdder(true)
    }
    document.addEventListener('selectionchange', handler)
    return () => document.removeEventListener('selectionchange', handler)
  }, [pageIndex])

  return { showAdder, rect, rects, text }
}
