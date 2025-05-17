'use client'
import { createContext, useState, useEffect, ReactNode } from 'react'
import { Rect } from '@/hooks/useAdderOnPage'

export interface Annotation {
  id: string
  documentId: string
  pageNumber: number
  rects: any[]
  selectedText: string
  note: string
  tags: string[]
  parentId?: string | null
  replies?: Annotation[]
  editing?: boolean
}

interface Ctx {
  annotations: Annotation[]
  activeAnnotationId: string | null
  setActiveAnnotationId: (id: string | null) => void
  addHighlight: (page: number, rects: Rect[], text: string) => void
  addAnnotation: (page: number, rects: Rect[], text: string) => void
  updateAnnotation: (id: string, data: Partial<Annotation>) => void
}

export const AnnotationContext = createContext<Ctx>({
  annotations: [],
  activeAnnotationId: null,
  setActiveAnnotationId: () => {},
  addHighlight: () => {},
  addAnnotation: () => {},
  updateAnnotation: () => {},
})
export function AnnotationProvider({ documentId, children }: { documentId: string; children: ReactNode }) {
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/annotations?documentId=${documentId}`)
      .then(res => res.json())
      .then(setAnnotations)
      .catch(() => {})
  }, [documentId])

  const addHighlight = async (page: number, rects: Rect[], text: string) => {
    const res = await fetch('/api/annotations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId, pageNumber: page, rects, selectedText: text, note: '', tags: [] }),
    })
    const ann = await res.json()
    setAnnotations(a => [...a, ann])
  }

  const addAnnotation = async (page: number, rects: Rect[], text: string) => {
    const res = await fetch('/api/annotations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId, pageNumber: page, rects, selectedText: text, note: '', tags: [] }),
    })
    const ann = await res.json()
    ann.editing = true
    setAnnotations(a => [...a, ann])
    setActiveAnnotationId(ann.id)
  }

  const updateAnnotation = async (id: string, data: Partial<Annotation>) => {
    const res = await fetch(`/api/annotations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const ann = await res.json()
    setAnnotations(a => a.map(an => (an.id === id ? { ...ann } : an)))
  }

  return (
    <AnnotationContext.Provider value={{ annotations, activeAnnotationId, setActiveAnnotationId, addHighlight, addAnnotation, updateAnnotation }}>
      {children}
    </AnnotationContext.Provider>
  )
}
