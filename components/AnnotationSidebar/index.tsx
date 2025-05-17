'use client'
import { useContext } from 'react'
import { AnnotationContext } from '@/context/AnnotationContext'
import Item from './Item'

export default function AnnotationSidebar() {
  const { annotations } = useContext(AnnotationContext)
  return (
    <aside className="fixed right-0 top-0 w-80 h-full bg-gray-50 border-l flex flex-col">
      <div className="bg-gray-100 p-2 font-medium">Annotations</div>
      <div className="flex-1 overflow-y-auto">
        {annotations.map(a => (
          <Item key={a.id} ann={a} />
        ))}
      </div>
    </aside>
  )
}
