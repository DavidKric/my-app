'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FolderNode, FileNode } from '@/types/file_explorer/file-structure';
import FolderNodeComponent from './FolderNode';
import FileNodeComponent from './FileNode';
import { loadFileTreeState, saveFileTreeState, clearFileTreeState } from '@/lib/fileTreeStorage';
import { useRecentFiles } from '@/lib/useRecentFiles';
import { isEqual } from 'lodash';


interface FileTreeProps {
  root: FolderNode;            // the root folder of the project
  searchQuery?: string;
  activeFileId: string;
  onFileSelect: (file: FileNode) => void;
}

export default function FileTree({ root, searchQuery = '', activeFileId, onFileSelect }: FileTreeProps) {
  const router = useRouter();
  const [treeData, setTreeData] = useState(root);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadFileTreeState();
    if (stored && isEqual(stored.treeData, root)) {
      setTreeData(stored.treeData);
      setExpandedFolders(stored.expanded || {});
    } else {
      // If the root prop has changed, reset localStorage and use the new root
      setTreeData(root);
      setExpandedFolders({});
      clearFileTreeState();
    }
    setHydrated(true);
  }, [root]);

  useEffect(() => {
    if (hydrated) {
      saveFileTreeState({ treeData, expanded: expandedFolders });
    }
  }, [treeData, expandedFolders, hydrated]);
  const { addFile } = useRecentFiles();
  const handleFileSelect = (file: FileNode) => {
    onFileSelect(file);
    if (file.fileType === 'pdf') {
      router.push(`/workspace/viewer?file=${encodeURIComponent(file.id)}`);
    }
    addFile(file);
  };

  const toggleFolderExpand = (id: string) => {
    setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renameFile = (id: string, name: string) => {
    const update = (node: FolderNode): FolderNode => ({
      ...node,
      children: node.children.map(child => {
        if (child.type === 'file' && child.id === id) {
          return { ...child, name };
        }
        if (child.type === 'folder') {
          return update(child);
        }
        return child;
      }),
    });
    setTreeData(prev => update(prev));
  };

  const deleteFile = (id: string) => {
    const remove = (node: FolderNode): FolderNode => ({
      ...node,
      children: node.children
        .filter(child => !(child.type === 'file' && child.id === id))
        .map(child => (child.type === 'folder' ? remove(child) : child)),
    });
    setTreeData(prev => remove(prev));
  };

  const renameFolder = (id: string, name: string) => {
    const update = (node: FolderNode): FolderNode => {
      if (node.id === id) {
        node = { ...node, name };
      }
      return {
        ...node,
        children: node.children.map(child =>
          child.type === 'folder' ? update(child) : child
        ),
      };
    };
    setTreeData(prev => update(prev));
  };

  const deleteFolder = (id: string) => {
    const remove = (node: FolderNode): FolderNode => ({
      ...node,
      children: node.children
        .filter(child => !(child.type === 'folder' && child.id === id))
        .map(child => (child.type === 'folder' ? remove(child) : child)),
    });
    setTreeData(prev => remove(prev));
    setExpandedFolders(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const createFile = (parentId: string) => {
    const newFile: FileNode = {
      id: `file-${Date.now()}`,
      name: 'Untitled.pdf',
      type: 'file',
      fileType: 'pdf',
      parentId,
    };
    const add = (node: FolderNode): FolderNode => {
      if (node.id === parentId) {
        return { ...node, children: [...node.children, newFile] };
      }
      return {
        ...node,
        children: node.children.map(child =>
          child.type === 'folder' ? add(child) : child
        ),
      };
    };
    setTreeData(prev => add(prev));
  };

  const createFolder = (parentId: string) => {
    const newFolder: FolderNode = {
      id: `folder-${Date.now()}`,
      name: 'New Folder',
      type: 'folder',
      parentId,
      children: [],
    };
    const add = (node: FolderNode): FolderNode => {
      if (node.id === parentId) {
        return { ...node, children: [...node.children, newFolder] };
      }
      return {
        ...node,
        children: node.children.map(child =>
          child.type === 'folder' ? add(child) : child
        ),
      };
    };
    setTreeData(prev => add(prev));
  };

  const moveNode = (nodeId: string, targetFolderId: string) => {
    if (nodeId === targetFolderId) return;
    setTreeData(prev => {
      let moving: FolderNode | FileNode | null = null;

      const remove = (node: FolderNode): FolderNode => ({
        ...node,
        children: node.children.map(child => {
          if (child.id === nodeId) {
            moving = child;
            return null;
          }
          if (child.type === 'folder') {
            return remove(child);
          }
          return child;
        }).filter(Boolean) as Array<FolderNode | FileNode>,
      });

      const add = (node: FolderNode): FolderNode => {
        if (node.id === targetFolderId && moving) {
          return { ...node, children: [...node.children, { ...moving!, parentId: node.id }] };
        }
        return {
          ...node,
          children: node.children.map(child =>
            child.type === 'folder' ? add(child) : child
          ),
        };
      };

      const without = remove(prev);
      if (!moving) return prev;
      return add(without);
    });
  };

  const promptMove = (id: string) => {
    const target = prompt('Move to folder ID:');
    if (target) moveNode(id, target);
  };

  // Optionally filter the tree if searchQuery is provided
  const filteredRoot = useMemo(() => {
    if (!searchQuery) return treeData;
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
    return filterNode(treeData) as FolderNode || { ...treeData, children: [] };
  }, [treeData, searchQuery]);

  if (!hydrated) return null;

  return (
    <div role="tree" aria-label="File Explorer" className="p-2">
      {/* Iterate over top-level children of root (skip the root's own name) */}
      {filteredRoot.children.map(child =>
        child.type === 'folder' ?
          <FolderNodeComponent
            key={child.id}
            folder={child}
            depth={0}
            expandedFolders={expandedFolders}
            onToggleExpand={toggleFolderExpand}
            onFileSelect={handleFileSelect}
            onRename={renameFolder}
            onDelete={deleteFolder}
            onCreateFile={createFile}
            onCreateFolder={createFolder}
            activeFileId={activeFileId}
            onMoveNode={moveNode}
            onMove={promptMove}
          /> :
          <FileNodeComponent
            key={child.id}
            file={child}
            depth={0}
            onFileSelect={handleFileSelect}
            onRename={renameFile}
            onDelete={deleteFile}
            activeFileId={activeFileId}
            onMoveNode={moveNode}
            onMove={promptMove}
          />
      )}
    </div>
  );
}
