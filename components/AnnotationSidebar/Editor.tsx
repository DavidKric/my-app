'use client'
import { useState } from 'react'
import { Annotation } from '@/context/AnnotationContext'

export default function Editor({ draft }: { draft: Annotation }) {
  const [note, setNote] = useState(draft.note || '')
  return (
    <div className="mt-1">
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        className="w-full border rounded p-1 text-sm"
      />
      <button className="mt-1 text-xs">Post</button>
    </div>
  )
}
