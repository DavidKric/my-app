'use client'
import { useState, useContext } from 'react'
import { Annotation, AnnotationContext } from '@/context/AnnotationContext'

export default function Editor({ draft }: { draft: Annotation }) {
  const [note, setNote] = useState(draft.note || '')
  const { updateAnnotation } = useContext(AnnotationContext)
  return (
    <div className="mt-1">
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        className="w-full border rounded p-1 text-sm"
      />
      <button className="mt-1 text-xs" onClick={() => updateAnnotation(draft.id, { note, editing: false })}>Post</button>
      <button className="mt-1 text-xs ml-2" onClick={() => updateAnnotation(draft.id, { editing: false })}>Cancel</button>
    </div>
  )
}
