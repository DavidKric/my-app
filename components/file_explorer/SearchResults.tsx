'use client';

import { FileNode } from '@/types/file_explorer/file-structure';
import { useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';

interface SearchResultsProps {
  results: FileNode[];
  onSelect?: (file: FileNode) => void;
}

export default function SearchResults({ results, onSelect }: SearchResultsProps) {
  const router = useRouter();

  const handleSelect = (file: FileNode) => {
    if (onSelect) {
      onSelect(file);
    }
    if (file.fileType === 'pdf') {
      router.push(`/workspace/viewer?file=${encodeURIComponent(file.id)}`);
    }
  };

  if (!results.length) {
    return <p className="text-sm text-muted-foreground">No results found.</p>;
  }

  return (
    <ul className="space-y-1">
      {results.map(file => (
        <li
          key={file.id}
          className="flex items-center cursor-pointer hover:bg-accent px-2 py-1 rounded text-sm"
          onClick={() => handleSelect(file)}
        >
          <FileText size={14} className="mr-2" />
          {file.name}
        </li>
      ))}
    </ul>
  );
}
