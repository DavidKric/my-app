'use client';

import React, { useState } from 'react';
import clsx from 'clsx';
import { FileNode } from '@/types/file_explorer/file-structure';
import { FileTextIcon } from 'lucide-react';
import FileContextMenu from './FileContextMenu';

interface FileNodeProps {
  file: FileNode;
  depth: number;
  onFileSelect: (file: FileNode) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  activeFileId: string;
}

export default function FileNodeComponent({ file, depth, onFileSelect, onRename, onDelete, activeFileId }: FileNodeProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [fileName, setFileName] = useState(file.name);

  const indentStyle = { paddingLeft: `${depth * 1.25}rem` };

  const handleRename = () => setIsRenaming(true);
  const handleRenameSubmit = () => {
    setIsRenaming(false);
    if (fileName.trim() && fileName !== file.name) {
      onRename(file.id, fileName.trim());
    } else {
      setFileName(file.name);
    }
  };
  const handleDelete = () => {
    if (confirm(`Delete ${file.name}?`)) {
      onDelete(file.id);
    }
  };

  return (
    <FileContextMenu onRename={handleRename} onDelete={handleDelete}>
      <div
        className={clsx(
          'flex items-center cursor-pointer hover:bg-accent hover:text-accent-foreground pr-2',
          activeFileId === file.id && 'bg-primary/10 text-primary'
        )}
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
          <span>{fileName}</span>
        )}
      </div>
    </FileContextMenu>
  );
}
