'use client';

import React from 'react';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from '@/components/ui/context-menu';

interface FileContextMenuProps {
  onRename: () => void;
  onDelete: () => void;
  onMove: () => void;
  onCopyPath: () => void;
  onRevealInFinder: () => void;
  children: React.ReactNode;
}

export default function FileContextMenu({
  onRename,
  onDelete,
  onMove,
  onCopyPath,
  onRevealInFinder,
  children,
}: FileContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={onRename}>Rename</ContextMenuItem>
        <ContextMenuItem onSelect={onDelete}>Delete</ContextMenuItem>
        <ContextMenuItem onSelect={onMove}>Move</ContextMenuItem>
        <ContextMenuItem onSelect={onCopyPath}>Copy Path</ContextMenuItem>
        <ContextMenuItem onSelect={onRevealInFinder}>Reveal in Finder</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
