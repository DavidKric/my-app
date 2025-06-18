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
  /** Handle dropping a node onto this file's parent folder */
  onMoveNode: (nodeId: string, targetFolderId: string) => void;
  /** Triggered when the user selects the "Move to…" action */
  onMove: (id: string) => void;
}

export default function FileNodeComponent({
  file,
  depth,
  onFileSelect,
  onRename,
  onDelete,
  activeFileId,
  onMoveNode,
  onMove,
}: FileNodeProps) {
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

  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <FileContextMenu onRename={handleRename} onDelete={handleDelete} onMove={() => onMove(file.id)}>
      <div
        className={clsx(
          'flex items-center cursor-pointer hover:bg-accent hover:text-accent-foreground pr-2',
          activeFileId === file.id && 'bg-primary/10 text-primary',
          { 'bg-accent/50': isDragOver }
        )}
        style={indentStyle}
        onClick={() => onFileSelect(file)}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('application/x-tree-node-id', file.id);
          e.dataTransfer.effectAllowed = 'move';
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          const nodeId = e.dataTransfer.getData('application/x-tree-node-id');
          if (nodeId) onMoveNode(nodeId, file.parentId);
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
            dir="auto" // Added for RTL support
          />
        ) : (
          <span>{fileName}</span>
        )}
      </div>
    </FileContextMenu>
  );
}
