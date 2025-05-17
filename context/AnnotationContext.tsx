'use client'
import { createContext, useState, ReactNode, useEffect } from 'react'

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
  addHighlight: (info: NewAnnotation) => Promise<Annotation | void>
  addAnnotation: (info: NewAnnotation) => Promise<Annotation | void>
  updateAnnotation: (id: string, data: Partial<Annotation>) => Promise<void>
}

export const AnnotationContext = createContext<Ctx>({
  annotations: [],
  activeAnnotationId: null,
  setActiveAnnotationId: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  addHighlight: async () => undefined,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  addAnnotation: async () => undefined,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  updateAnnotation: async () => {},
})

export interface NewAnnotation {
  documentId: string
  pageNumber: number
  rects: any[]
  selectedText: string
  note?: string
  tags?: string[]
  parentId?: string | null
}

export function AnnotationProvider({ documentId, children }: { documentId: string; children: ReactNode }) {
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/annotations?documentId=${encodeURIComponent(documentId)}`)
      .then(res => res.json())
      .then(setAnnotations)
      .catch(() => {})
  }, [documentId])

  const addHighlight = async (info: NewAnnotation) => {
    const res = await fetch('/api/annotations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...info, note: info.note ?? '', tags: info.tags ?? [] }),
    })
    const ann = await res.json()
    setAnnotations(prev => [...prev, ann])
    return ann
  }
  const addAnnotation = async (info: NewAnnotation) => {
    const ann = await addHighlight({ ...info, note: info.note ?? '' })
    if (ann) {
      setAnnotations(prev =>
        prev.map(a => (a.id === ann.id ? { ...a, editing: true } : a))
      )
    }
  }

  const updateAnnotation = async (id: string, data: Partial<Annotation>) => {
    const res = await fetch(`/api/annotations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const ann = await res.json()
    setAnnotations(prev => prev.map(a => (a.id === id ? ann : a)))
  }

  return (
    <AnnotationContext.Provider value={{ annotations, activeAnnotationId, setActiveAnnotationId, addHighlight, addAnnotation, updateAnnotation }}>
      {children}
    </AnnotationContext.Provider>
  )
}
