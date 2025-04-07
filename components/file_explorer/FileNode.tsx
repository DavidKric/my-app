'use client';

import React, { useState } from 'react';
import { FileNode } from '@/types/file_explorer/file-structure';
import { FileTextIcon } from 'lucide-react';
import FileContextMenu from './FileContextMenu';

interface FileNodeProps {
  file: FileNode;
  depth: number;
  onFileSelect: (file: FileNode) => void;
}

export default function FileNodeComponent({ file, depth, onFileSelect }: FileNodeProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [fileName, setFileName] = useState(file.name);

  const indentStyle = { paddingLeft: `${depth * 1.25}rem` };

  const handleRename = () => setIsRenaming(true);
  const handleRenameSubmit = () => {
    setIsRenaming(false);
    // TODO: persist the new name on the server and update state accordingly
  };
  const handleDelete = () => {
    // TODO: handle file deletion (with confirmation if needed)
  };

  return (
    <FileContextMenu onRename={handleRename} onDelete={handleDelete}>
      <div
        className="flex items-center cursor-pointer hover:bg-accent hover:text-accent-foreground pr-2"
        style={indentStyle}
        onClick={() => onFileSelect(file)}
        draggable={true}
        onDragStart={(e) => {
          // TODO: Implement drag start logic (e.g., store file id in dataTransfer)
        }}
        onDragOver={(e) => {
          e.preventDefault();
          // Optionally, add visual feedback for drop target
        }}
        onDrop={(e) => {
          // TODO: Handle drop event to support reordering/moving the file
        }}
      >
        {/* Spacer for alignment (files don’t have an expand arrow) */}
        <span className="mr-1" style={{ width: '1rem' }}></span>
        <FileTextIcon size={16} className="mr-1" />
        {isRenaming ? (
          <input
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameSubmit();
            }}
            autoFocus
            className="bg-muted text-muted-foreground px-1"
          />
        ) : (
          <span>{file.name}</span>
        )}
      </div>
    </FileContextMenu>
  );
}
