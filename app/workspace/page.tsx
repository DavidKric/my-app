// app/workspace/page.tsx
import React from 'react';
import WorkspaceLayout from './layout'; // Assuming layout.tsx is in the same directory
import { fetchCasesData } from '../lib/data'; // Adjust path as needed
import { Case } from '@/types/file_explorer/file-structure';

// This page component will now fetch data and provide it to the WorkspaceLayout
export default async function WorkspacePage() {
  const cases: Case[] = await fetchCasesData();

  return (
    <WorkspaceLayout cases={cases}>
      <div className="h-full w-full flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Document Workspace</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Select a document from the file explorer to begin viewing and annotating.
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>• Use the left sidebar to browse files.</p>
            <p>• Use the right sidebar for annotations and AI assistance.</p>
            <p>• Click the expand/minimize buttons to control sidebar visibility.</p>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}