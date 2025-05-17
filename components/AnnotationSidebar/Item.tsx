'use client'
import { useAnnotations } from '@/components/context_panel/annotations/AnnotationProvider'
import { Annotation } from '@/components/pdf_viewer/annotations/AnnotationOverlay'
import Editor from './Editor'

export default function Item({ ann, depth = 0 }: { ann: Annotation & { [key: string]: any }; depth?: number }) {
  const { state, dispatch, updateAnnotation } = useAnnotations()
  const active = state.selectedAnnotationId === ann.id
  return (
    <div
      className={`p-3 border-b ${active ? 'bg-yellow-100' : ''}`}
      onMouseEnter={() => dispatch({ type: 'SELECT_ANNOTATION', id: ann.id })}
    >
      {ann.textSnippet && <p className="italic text-gray-600">“{ann.textSnippet}”</p>}
      {(ann as any).editing ? (
        <Editor draft={ann as any} />
      ) : (
        <>
          <p className="mt-1">{(ann as any).note || ann.comment}</p>
          <button className="text-xs" onClick={() => updateAnnotation(ann.id, { ...(ann as any), editing: true } as any)}>
            Edit
          </button>
        </>
      )}
      <div className="text-xs text-gray-500">{(ann as any).tags?.join(', ')}</div>
      {(ann as any).replies && (ann as any).replies.map((r: any) => <Item key={r.id} ann={r} depth={depth + 1} />)}
    </div>
  )
}
