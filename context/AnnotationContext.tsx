'use client'
import { createContext, useState, ReactNode } from 'react'

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
  addHighlight: () => void
  addAnnotation: () => void
}

export const AnnotationContext = createContext<Ctx>({
  annotations: [],
  activeAnnotationId: null,
  setActiveAnnotationId: () => {},
  addHighlight: () => {},
  addAnnotation: () => {},
})

export function AnnotationProvider({ children }: { children: ReactNode }) {
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null)

  const addHighlight = () => {
    // TODO implement
  }
  const addAnnotation = () => {
    // TODO implement
  }

  return (
    <AnnotationContext.Provider value={{ annotations, activeAnnotationId, setActiveAnnotationId, addHighlight, addAnnotation }}>
      {children}
    </AnnotationContext.Provider>
  )
}
