'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FolderNode, FileNode } from '@/types/file_explorer/file-structure';
import FolderNodeComponent from './FolderNode';
import FileNodeComponent from './FileNode';

interface FileTreeProps {
  root: FolderNode;            // the root folder of the project
  searchQuery?: string;
  onFileSelect: (file: FileNode) => void;
}

export default function FileTree({ root, searchQuery = '', onFileSelect }: FileTreeProps) {
  const router = useRouter();
  
  const handleFileSelect = (file: FileNode) => {
    if (file.fileType === 'pdf') {
      router.push(`/workspace/viewer?file=${encodeURIComponent(file.id)}`);
    } else {
      onFileSelect(file);
    }
  };

  // Optionally filter the tree if searchQuery is provided
  const filteredRoot = useMemo(() => {
    if (!searchQuery) return root;
    const queryLower = searchQuery.toLowerCase();
    function filterNode(node: FolderNode | FileNode): FolderNode | FileNode | null {
      if (node.type === 'file') {
        return node.name.toLowerCase().includes(queryLower) ? node : null;
      } else {
        // folder: filter children recursively
        const filteredChildren = node.children
          .map(child => filterNode(child))
          .filter(Boolean) as Array<FolderNode | FileNode>;
        if (filteredChildren.length > 0 || node.name.toLowerCase().includes(queryLower)) {
          return { ...node, children: filteredChildren };
        }
        return null;
      }
    }
    // Note: we copy root even if it doesn't match, if any child matches
    return filterNode(root) as FolderNode || { ...root, children: [] };
  }, [root, searchQuery]);

  return (
    <div role="tree" aria-label="File Explorer" className="p-2">
      {/* Iterate over top-level children of root (skip the root's own name) */}
      {filteredRoot.children.map(child =>
        child.type === 'folder' ? 
          <FolderNodeComponent key={child.id} folder={child} depth={0} onFileSelect={handleFileSelect} /> :
          <FileNodeComponent key={child.id} file={child} depth={0} onFileSelect={handleFileSelect} />
      )}
    </div>
  );
}
