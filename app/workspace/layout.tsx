// app/workspace/layout.tsx
import React from 'react';
import { Case } from '@/types/file_explorer/file-structure';
import { ClientAnnotationProvider } from '@/components/context_panel/annotations/ClientAnnotationProvider';

async function fetchCasesData(): Promise<Case[]> {
  return [
    {
      id: 'case1',
      name: 'Smith v. Jones',
      root: {
        id: 'folder-root-1',
        name: 'Smith v. Jones',
        type: 'folder' as const,
        parentId: 'root',
        children: [
          {
            id: 'folder-pleadings',
            name: 'Pleadings',
            type: 'folder' as const,
            parentId: 'folder-root-1',
            children: [
              {
                id: 'file-complaint',
                name: 'Complaint.pdf',
                type: 'file' as const,
                fileType: 'pdf' as const,
                parentId: 'folder-pleadings'
              },
              {
                id: 'file-answer',
                name: 'Answer.pdf',
                type: 'file' as const,
                fileType: 'pdf' as const,
                parentId: 'folder-pleadings'
              }
            ]
          },
          {
            id: 'folder-discovery',
            name: 'Discovery',
            type: 'folder' as const,
            parentId: 'folder-root-1',
            children: [
              {
                id: 'folder-interrogatories',
                name: 'Interrogatories',
                type: 'folder' as const,
                parentId: 'folder-discovery',
                children: [
                  {
                    id: 'file-interrogatories',
                    name: 'First_Set.pdf',
                    type: 'file' as const,
                    fileType: 'pdf' as const,
                    parentId: 'folder-interrogatories'
                  }
                ]
              }
            ]
          }
        ]
      },
    },
    {
      id: 'case2',
      name: 'ABC Corp v. XYZ Inc',
      root: {
        id: 'folder-root-2',
        name: 'ABC Corp v. XYZ Inc',
        type: 'folder' as const,
        parentId: 'root',
        children: [
          {
            id: 'file-contract',
            name: 'Contract.pdf',
            type: 'file' as const,
            fileType: 'pdf' as const,
            parentId: 'folder-root-2'
          }
        ]
      },
    },
  ];
}

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const cases = await fetchCasesData();

  return (
    <ClientAnnotationProvider cases={cases}>
      {children}
    </ClientAnnotationProvider>
  );
}
