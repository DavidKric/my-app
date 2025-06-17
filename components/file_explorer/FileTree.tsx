'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FolderNode, FileNode as FileNodeType } from '@/types/file_explorer/file-structure'; // Renamed FileNode
import FolderNodeComponent from './FolderNode';
import FileNodeComponent from './FileNode';
import { loadFileTreeState, saveFileTreeState, clearFileTreeState } from '@/lib/fileTreeStorage';
import { useRecentFiles } from '@/lib/useRecentFiles';
import { isEqual } from 'lodash';
import { useCaseContext } from '@/contexts/CaseContext'; // Import context


interface FileTreeProps {
  root: FolderNode; // This 'root' is the selectedCase.root from context
  searchQuery?: string;
  activeFileId: string;
  onFileSelect: (file: FileNodeType) => void; // Use aliased FileNodeType
}

export default function FileTree({ root, searchQuery = '', activeFileId, onFileSelect }: FileTreeProps) {
  const router = useRouter();
  const {
    updateNodeName,
    deleteNodeInSelectedCase,
    addFilesToSelectedCase
    // selectedCase, // Not strictly needed here if root is always from selectedCase
  } = useCaseContext();

  // treeData state is removed; 'root' prop is the source of truth for structure.
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Load expanded state when the component mounts or root ID changes (new case selected)
    const stored = loadFileTreeState();
    // Check if stored state is for the current root. If not, reset expanded state.
    // This assumes `fileTreeStorage` saves the `treeData.id` which should be `root.id`.
    if (stored && root && stored.treeData?.id === root.id) {
      setExpandedFolders(stored.expanded || {});
    } else {
      setExpandedFolders({}); // Reset for new/different case
      if (root && root.id) { // If a new valid root is provided, save its initial expanded state
        saveFileTreeState({ treeData: root, expanded: {} });
      } else if (!root && stored) { // If root becomes null (no case selected), clear storage
        clearFileTreeState();
      }
    }
    setHydrated(true);
  }, [root]); // React to changes in the root prop (e.g. when selectedCase changes)

  useEffect(() => {
    // Save expanded state whenever it changes, associated with the current root.
    if (hydrated && root && root.id) {
      saveFileTreeState({ treeData: root, expanded: expandedFolders });
    }
  }, [expandedFolders, hydrated, root]); // Also depend on root to save when case changes (and root is valid)

  const { addFile: addRecentFile } = useRecentFiles(); // Renamed to avoid conflict

  // onFileSelect is passed from ExplorerSidebar, which handles navigation & recent files.
  // No need to duplicate addRecentFile or router.push here if ExplorerSidebar does it.
  const handleFileSelect = (file: FileNodeType) => {
    onFileSelect(file);
  };

  const toggleFolderExpand = (id: string) => {
    setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));
    // No need to save treeData here, only expanded state changes.
  };

  // Modified functions to use context for mutations
  const handleRenameNode = (id: string, name: string) => {
    updateNodeName(id, name);
  };

  const handleDeleteNode = (id: string) => {
    deleteNodeInSelectedCase(id);
  };

  const handleCreateFileInFolder = (parentId: string) => {
    const newFile: FileNodeType = {
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: 'Untitled.pdf',
      type: 'file',
      fileType: 'pdf',
      parentId,
    };
    addFilesToSelectedCase(parentId, [newFile]);
  };

  const handleCreateFolderInFolder = (parentId: string) => {
    const newFolder: FolderNode = {
      id: `folder-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: 'New Folder',
      type: 'folder',
      parentId,
      children: [],
    };
    // Casting to any as FileNodeType because addFilesToSelectedCase expects FileNodeType[]
    // Ideally, CaseContext would have a more generic addNodesToSelectedCase or specific createFolder function.
    console.warn("handleCreateFolderInFolder: Adding a folder via addFilesToSelectedCase is a temporary workaround and type-unsafe.");
    addFilesToSelectedCase(parentId, [newFolder as any as FileNodeType]);
  };

  // Placeholder for moveNode - ideally this would also go through context
  const handleMoveNodeAttempt = (nodeId: string, targetFolderId: string) => {
    console.log(`Placeholder: Move node ${nodeId} to folder ${targetFolderId}. This needs context implementation.`);
    alert(`Placeholder: Move node ${nodeId} to folder ${targetFolderId}. Full implementation requires CaseContext.moveNode function.`);
    // To implement:
    // 1. Add moveNode(nodeId, targetParentId) to CaseContext
    // 2. Context function updates the selectedCase.root
    // 3. FileTree re-renders, persistence is handled by useEffect saving root.
  };

  const promptMove = (id: string) => {
    const target = prompt('Move to folder ID (requires full implementation via Context):');
    if (target) handleMoveNodeAttempt(id, target);
  };

  // Filtered root based on the `root` prop
  const filteredRoot = useMemo(() => {
    if (!root) return null;
    if (!searchQuery) return root;
    const queryLower = searchQuery.toLowerCase();

    function filterTree(node: FolderNode | FileNodeType): FolderNode | FileNodeType | null {
      if (node.type === 'file') {
        return node.name.toLowerCase().includes(queryLower) ? node : null;
      }
      // For FolderNode
      const filteredChildren = node.children
        .map(child => filterTree(child as FolderNode | FileNodeType))
        .filter(Boolean) as Array<FolderNode | FileNodeType>;

      if (filteredChildren.length > 0 || node.name.toLowerCase().includes(queryLower)) {
        return { ...node, children: filteredChildren };
      }
      return null;
    }
    // The root node itself might be filtered out if it doesn't match and has no matching children.
    // We need to ensure we always return a FolderNode for the root, even if its children are empty.
    const newRootChildren = root.children
        .map(child => filterTree(child as FolderNode | FileNodeType))
        .filter(Boolean) as Array<FolderNode | FileNodeType>;

    if (root.name.toLowerCase().includes(queryLower) || newRootChildren.length > 0) {
        return { ...root, children: newRootChildren };
    }
    // If root itself doesn't match and has no matching children, return root with empty children
    // if we want to preserve the root folder in search results regardless of its own name matching.
    // Or return null if the root itself must match or contain matches.
    // For a file explorer, usually, the root persists.
    return { ...root, children: newRootChildren };

  }, [root, searchQuery]);

  if (!hydrated || !filteredRoot) { // If no root (no case selected) or not hydrated, render nothing or a placeholder
    return <div className="p-2 text-sm text-gray-500">Select a case to view files or no files in current search.</div>;
  }

  return (
    <div role="tree" aria-label="File Explorer" className="p-2">
      {/* Iterate over top-level children of filteredRoot */}
      {filteredRoot.children.map(child =>
        child.type === 'folder' ?
          <FolderNodeComponent
            key={child.id}
            folder={child as FolderNode}
            depth={0}
            expandedFolders={expandedFolders}
            onToggleExpand={toggleFolderExpand}
            onFileSelect={handleFileSelect}
            onRename={handleRenameNode}
            onDelete={handleDeleteNode}
            onCreateFile={handleCreateFileInFolder}
            onCreateFolder={handleCreateFolderInFolder}
            activeFileId={activeFileId}
            onMoveNode={handleMoveNodeAttempt}
            onMove={promptMove}
          /> :
          <FileNodeComponent
            key={child.id}
            file={child as FileNodeType}
            depth={0}
            onFileSelect={handleFileSelect}
            onRename={handleRenameNode}
            onDelete={handleDeleteNode}
            activeFileId={activeFileId}
            onMoveNode={handleMoveNodeAttempt}
            onMove={promptMove}
          />
      )}
    </div>
  );
}
