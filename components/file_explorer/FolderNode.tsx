'use client';

import { useState } from 'react';
import { FolderNode, FileNode } from '@/types/file_explorer/file-structure';
import FileNodeComponent from './FileNode';
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from '@/components/ui/context-menu';
import { FolderIcon, ChevronRightIcon, ChevronDownIcon } from 'lucide-react'; // example icon library

interface FolderNodeProps {
  folder: FolderNode;
  depth: number;
  onFileSelect: (file: FileNode) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onCreateFile: (parentId: string) => void;
  onCreateFolder: (parentId: string) => void;
  onMove: (id: string) => void;
  onCopyPath: (id: string) => void;
  onRevealInFinder: (id: string) => void;
}

export default function FolderNodeComponent({ folder, depth, onFileSelect, onRename, onDelete, onCreateFile, onCreateFolder, onMove, onCopyPath, onRevealInFinder }: FolderNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [folderName, setFolderName] = useState(folder.name);

  // Indentation for nested depth
  const indentStyle = { paddingLeft: `${depth * 1.25}rem` }; // e.g., 1.25rem per level indent

  const toggleExpand = () => {
    setIsExpanded(prev => !prev);
    // (In a more global approach, we would notify parent to update expanded state)
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
  const handleMove = () => onMove(folder.id);
  const handleCopyPath = () => onCopyPath(folder.id);
  const handleReveal = () => onRevealInFinder(folder.id);

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {/* Folder row */}
          <div 
            className="flex items-center cursor-pointer hover:bg-accent hover:text-accent-foreground pr-2" 
            style={indentStyle}
            onClick={toggleExpand}
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
          <ContextMenuItem onSelect={handleMove}>Move</ContextMenuItem>
          <ContextMenuItem onSelect={handleCopyPath}>Copy Path</ContextMenuItem>
          <ContextMenuItem onSelect={handleReveal}>Reveal in Finder</ContextMenuItem>
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
                onFileSelect={onFileSelect}
                onRename={onRename}
                onDelete={onDelete}
                onCreateFile={onCreateFile}
                onCreateFolder={onCreateFolder}
                onMove={onMove}
                onCopyPath={onCopyPath}
                onRevealInFinder={onRevealInFinder}
              /> :
              <FileNodeComponent
                key={child.id}
                file={child}
                depth={depth+1}
                onFileSelect={onFileSelect}
                onRename={onRename}
                onDelete={onDelete}
                onMove={onMove}
                onCopyPath={onCopyPath}
                onRevealInFinder={onRevealInFinder}
              />
          )}
        </div>
      )}
    </div>
  );
}
