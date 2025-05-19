'use client';

import { useMemo, useState } from 'react';
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
  const [treeData, setTreeData] = useState(root);
  
  const handleFileSelect = (file: FileNode) => {
    if (file.fileType === 'pdf') {
      router.push(`/workspace/viewer?file=${encodeURIComponent(file.id)}`);
    } else {
      onFileSelect(file);
    }
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

  const findNode = (
    node: FolderNode,
    id: string,
    path: string[]
  ): { node: FolderNode | FileNode; path: string[] } | null => {
    if (node.id === id) {
      return { node, path };
    }
    for (const child of node.children) {
      if (child.id === id) {
        return { node: child, path: [...path, child.name] };
      }
      if (child.type === 'folder') {
        const res = findNode(child, id, [...path, child.name]);
        if (res) return res;
      }
    }
    return null;
  };

  const getFullPath = (id: string): string | null => {
    const res = findNode(treeData, id, [treeData.name]);
    if (!res) return null;
    const { node, path } = res;
    if (node.type === 'file' && node.path) {
      return node.path;
    }
    return path.join('/');
  };

  const copyPath = (id: string) => {
    const p = getFullPath(id);
    if (p) {
      navigator.clipboard.writeText(p);
    }
  };

  const revealInFinder = async (id: string) => {
    const p = getFullPath(id);
    if (!p) return;
    await fetch('/api/open-path', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: p }),
    });
  };

  const moveNode = (
    id: string,
    targetFolderId: string
  ) => {
    const remove = (
      node: FolderNode
    ): [FolderNode, FolderNode | FileNode | null] => {
      let found: FolderNode | FileNode | null = null;
      const children = node.children.flatMap((child) => {
        if (child.id === id) {
          found = child;
          return [];
        }
        if (child.type === 'folder') {
          const [updated, f] = remove(child);
          if (f) found = f;
          return [updated];
        }
        return [child];
      });
      return [{ ...node, children }, found];
    };

    const add = (
      node: FolderNode,
      item: FolderNode | FileNode
    ): FolderNode => {
      if (node.id === targetFolderId) {
        return { ...node, children: [...node.children, item] };
      }
      return {
        ...node,
        children: node.children.map((child) =>
          child.type === 'folder' ? add(child, item) : child
        ),
      };
    };

    setTreeData((prev) => {
      const [without, item] = remove(prev);
      if (!item) return prev;
      return add(without, item);
    });
  };

  const moveFile = (id: string) => {
    const target = prompt('Target folder id:');
    if (target) moveNode(id, target);
  };

  const moveFolder = (id: string) => {
    const target = prompt('Target folder id:');
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

  return (
    <div role="tree" aria-label="File Explorer" className="p-2">
      {/* Iterate over top-level children of root (skip the root's own name) */}
      {filteredRoot.children.map(child =>
        child.type === 'folder' ?
          <FolderNodeComponent
            key={child.id}
            folder={child}
            depth={0}
            onFileSelect={handleFileSelect}
            onRename={renameFolder}
            onDelete={deleteFolder}
            onCreateFile={createFile}
            onCreateFolder={createFolder}
            onMove={moveFolder}
            onCopyPath={copyPath}
            onRevealInFinder={revealInFinder}
          /> :
          <FileNodeComponent
            key={child.id}
            file={child}
            depth={0}
            onFileSelect={handleFileSelect}
            onRename={renameFile}
            onDelete={deleteFile}
            onMove={moveFile}
            onCopyPath={copyPath}
            onRevealInFinder={revealInFinder}
          />
      )}
    </div>
  );
}
