'use client'
import { useState } from 'react'
import { useAnnotations } from '@/components/context_panel/annotations/AnnotationProvider'

export default function Editor({ draft }: { draft: any }) {
  const [note, setNote] = useState(draft.note || '')
  const { updateAnnotation } = useAnnotations()
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
