'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FileNode as FileNodeType } from '@/types/file_explorer/file-structure';
import { useRecentFiles } from '@/lib/useRecentFiles';
import { useCaseContext } from '@/contexts/CaseContext';
import { Button } from '@/components/ui/button';
import { FileText, XCircle } from 'lucide-react'; // Added XCircle for clear all

interface RecentFilesProps {
  // No props needed if all data comes from hooks
}

const RecentFiles: React.FC<RecentFilesProps> = () => {
  const { recentFiles, clearFiles, addFile: addRecentFile } = useRecentFiles();
  const { selectedCase } = useCaseContext(); // To get caseId for navigation
  const router = useRouter();

  const handleFileSelect = (file: FileNodeType) => {
    addRecentFile(file); // Update timestamp or move to top
    if (file.fileType === 'pdf' && selectedCase) { // Ensure selectedCase is available
      router.push(`/workspace/viewer?file=${encodeURIComponent(file.id)}&caseId=${selectedCase.id}`);
    } else if (file.fileType === 'pdf') {
      // Fallback if somehow no selectedCase, though unlikely in this context
      router.push(`/workspace/viewer?file=${encodeURIComponent(file.id)}`);
    }
  };

  return (
    <div className="h-full flex flex-col p-2 space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Files</h2>
        {recentFiles.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFiles} className="text-xs">
            <XCircle className="mr-1.5 h-3.5 w-3.5" />
            Clear All
          </Button>
        )}
      </div>
      {recentFiles.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">No recent files.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto space-y-1">
          {recentFiles.map(file => (
            <button
              key={file.id}
              className="flex w-full items-center rounded px-2 py-1.5 text-left hover:bg-accent dark:hover:bg-gray-700 transition-colors duration-150 ease-in-out"
              onClick={() => handleFileSelect(file)}
              title={file.name}
            >
              <FileText className="mr-2 h-4 w-4 flex-shrink-0 text-gray-600 dark:text-gray-400" />
              <span className="truncate text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentFiles;
