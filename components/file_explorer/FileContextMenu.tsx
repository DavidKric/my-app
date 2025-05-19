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
  /** Optional move handler shown as "Move to…" in the menu */
  onMove?: () => void;
  children: React.ReactNode;
}

export default function FileContextMenu({
  onRename,
  onDelete,
  onMove,
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
        {onMove && (
          <ContextMenuItem onSelect={onMove}>Move to…</ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
