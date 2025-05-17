'use client'
import { useContext } from 'react'
import { AnnotationContext, Annotation } from '@/context/AnnotationContext'
import Editor from './Editor'

export default function Item({ ann, depth = 0 }: { ann: Annotation; depth?: number }) {
  const { activeAnnotationId, setActiveAnnotationId, updateAnnotation } = useContext(AnnotationContext)
  const active = activeAnnotationId === ann.id
  return (
    <div
      className={`p-3 border-b ${active ? 'bg-yellow-100' : ''}`}
      onMouseEnter={() => setActiveAnnotationId(ann.id)}
    >
      {ann.selectedText && <p className="italic text-gray-600">“{ann.selectedText}”</p>}
      {ann.editing ? (
        <Editor draft={ann} />
      ) : (
        <>
          <p className="mt-1">{ann.note}</p>
          <button className="text-xs" onClick={() => updateAnnotation(ann.id, { editing: true })}>Edit</button>
        </>
      )}
      <div className="text-xs text-gray-500">{ann.tags?.join(', ')}</div>
      {ann.replies && ann.replies.map(r => <Item key={r.id} ann={r} depth={depth + 1} />)}
    </div>
  )
}
