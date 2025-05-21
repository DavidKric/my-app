'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { FolderNode, FileNode } from '@/types/file_explorer/file-structure';
import FileNodeComponent from './FileNode';
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from '@/components/ui/context-menu';
import { FolderIcon, ChevronRightIcon, ChevronDownIcon } from 'lucide-react'; // example icon library

interface FolderNodeProps {
  folder: FolderNode;
  depth: number;
  expandedFolders: Record<string, boolean>;
  onToggleExpand: (id: string) => void;
  onFileSelect: (file: FileNode) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onCreateFile: (parentId: string) => void;
  onCreateFolder: (parentId: string) => void;
  activeFileId: string;
  onMoveNode: (nodeId: string, targetFolderId: string) => void;
  onMove: (id: string) => void;
}

export default function FolderNodeComponent({
  folder,
  depth,
  expandedFolders,
  onToggleExpand,
  onFileSelect,
  onRename,
  onDelete,
  onCreateFile,
  onCreateFolder,
  activeFileId,
  onMoveNode,
  onMove
}: FolderNodeProps) {
  const isExpanded = expandedFolders[folder.id] || false;
  const [isRenaming, setIsRenaming] = useState(false);
  const [folderName, setFolderName] = useState(folder.name);
  const [isDragOver, setIsDragOver] = useState(false);

  // Indentation for nested depth
  const indentStyle = { paddingLeft: `${depth * 1.25}rem` }; // e.g., 1.25rem per level indent

  const toggleExpand = () => {
    onToggleExpand(folder.id);
  };

  const handleRename = () => {
    // Trigger rename mode
    setIsRenaming(true);
  };
  const handleRenameSubmit = () => {
    setIsRenaming(false);
    if (folderName.trim() && folderName !== folder.name) {
      onRename(folder.id, folderName.trim());
    } else {
      setFolderName(folder.name);
    }
  };
  const handleNewFile = () => {
    onCreateFile(folder.id);
  };
  const handleNewFolder = () => {
    onCreateFolder(folder.id);
  };
  const handleDelete = () => {
    if (confirm(`Delete folder ${folder.name}?`)) {
      onDelete(folder.id);
    }
  };

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {/* Folder row */}
          <div
            className={clsx(
              'flex items-center cursor-pointer hover:bg-accent hover:text-accent-foreground pr-2',
              { 'bg-accent/50': isDragOver }
            )}
            style={indentStyle}
            onClick={toggleExpand}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('application/x-tree-node-id', folder.id);
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
              if (nodeId) onMoveNode(nodeId, folder.id);
            }}
          >
            {/* Arrow icon for expand/collapse */}
            <button 
              onClick={toggleExpand} 
              className="mr-1"
              aria-label={isExpanded ? "Collapse folder" : "Expand folder"}
            >
              {isExpanded ? <ChevronDownIcon size={16}/> : <ChevronRightIcon size={16}/>}
            </button>
            {/* Folder icon */}
            <FolderIcon size={16} className="mr-1"/>
            {/* Folder name (or input if renaming) */}
            {isRenaming ? (
              <input 
                value={folderName}
                onChange={e => setFolderName(e.target.value)}
                onBlur={handleRenameSubmit}
                onKeyDown={e => { if(e.key === 'Enter') handleRenameSubmit(); }}
                autoFocus
                className="bg-muted text-muted-foreground px-1"
              />
            ) : (
              <span onDoubleClick={toggleExpand}>{folderName}</span>
            )}
          </div>
        </ContextMenuTrigger>
        {/* Context menu items for folder */}
        <ContextMenuContent>
          <ContextMenuItem onSelect={handleNewFile}>New File</ContextMenuItem>
          <ContextMenuItem onSelect={handleNewFolder}>New Folder</ContextMenuItem>
          <ContextMenuItem onSelect={handleRename}>Rename</ContextMenuItem>
          <ContextMenuItem onSelect={handleDelete}>Delete</ContextMenuItem>
          <ContextMenuItem onSelect={() => onMove(folder.id)}>Move to…</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Render children if expanded */}
      {isExpanded && (
        <div role="group">
          {folder.children.map(child =>
            child.type === 'folder' ?
              <FolderNodeComponent
                key={child.id}
                folder={child}
                depth={depth+1}
                expandedFolders={expandedFolders}
                onToggleExpand={onToggleExpand}
                onFileSelect={onFileSelect}
                onRename={onRename}
                onDelete={onDelete}
                onCreateFile={onCreateFile}
                onCreateFolder={onCreateFolder}
                activeFileId={activeFileId}
                onMoveNode={onMoveNode}
                onMove={onMove}
              /> :
              <FileNodeComponent
                key={child.id}
                file={child}
                depth={depth+1}
                onFileSelect={onFileSelect}
                onRename={onRename}
                onDelete={onDelete}
                activeFileId={activeFileId}
                onMoveNode={onMoveNode}
                onMove={onMove}
              />
          )}
        </div>
      )}
    </div>
  );
}
