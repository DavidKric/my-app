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
  children: React.ReactNode;
}

export default function FileContextMenu({
  onRename,
  onDelete,
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
        {/* Additional file-specific actions (e.g., "Download", "Move") can be added here */}
      </ContextMenuContent>
    </ContextMenu>
  );
}
