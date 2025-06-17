'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Case, FileNode, FolderNode } from '@/types/file_explorer/file-structure';
import CaseSwitcher from '@/components/file_explorer/CaseSwitcher';
import SearchBar from './SearchBar';
import FileTree from './FileTree';
import SearchResults from './SearchResults';
import RecentFiles from './RecentFiles'; // Import RecentFiles component
import { FileText, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRecentFiles } from '@/lib/useRecentFiles'; // Though RecentFiles.tsx now uses this directly
import { useCaseContext } from '@/contexts/CaseContext';
import { FileNode as FileNodeType, FolderNode as FolderNodeType } from '@/types/file_explorer/file-structure'; // Renamed for clarity

// Define a union type for the active panel.
type Panel = 'explorer' | 'search' | 'history';

interface SidebarProps {
  // cases prop is removed, will get from context
  isExpanded?: boolean;
}

export default function ExplorerSidebar({ isExpanded = true }: SidebarProps) {
  const { cases, selectedCase, selectCase, addFilesToSelectedCase } = useCaseContext(); // Added addFilesToSelectedCase
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FileNodeType[]>([]);
  const [activePanel, setActivePanel] = useState<Panel>('explorer');
  const [activeFileId, setActiveFileId] = useState('');
  const { recentFiles, clearFiles, addFile: addRecentFile } = useRecentFiles(); // Renamed addFile to avoid conflict
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false); // For drag-drop visual feedback

  // TODO: These functions (createFile, createFolder, renameFile, etc.) should ideally be part of CaseContext
  // or a service that updates the FileTree's source of truth (selectedCase.root) and persists it.
  // For now, we'll assume they are handled by FileTree and its `saveFileTreeState` via props.
  // The challenge is that FileTree is a child, and drag-drop happens on ExplorerSidebar.

  const collectFiles = (node: FolderNodeType | FileNodeType, query: string, acc: FileNodeType[]) => {
    if (node.type === 'file') {
      if (node.name.toLowerCase().includes(query.toLowerCase())) {
        acc.push(node);
      }
    } else {
      node.children.forEach(child => collectFiles(child, query, acc));
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim() || !selectedCase) { // Use selectedCase
      setSearchResults([]);
      return;
    }
    const results: FileNode[] = [];
    collectFiles(selectedCase.root, query, results); // Use selectedCase.root
    setSearchResults(results);
  };

  // File explorer content
  const fileExplorerContent = (
    <div className="h-full flex flex-col">
      {/* Project Switcher - Now consumes context directly */}
      <div className="p-2 border-b border-border">
        <CaseSwitcher />
      </div>
      {/* Search Bar (within Explorer) */}
      <div className="p-2 border-b border-border">
        <SearchBar
          query={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch} // handleSearch now uses selectedCase
        />
      </div>
      {/* File Tree */}
      <div className="flex-1 overflow-auto">
        {selectedCase && selectedCase.root && ( // Check selectedCase and its root
          <FileTree
            root={selectedCase.root} // Pass selectedCase.root
            searchQuery={searchQuery}
            activeFileId={activeFileId}
            onFileSelect={(file) => {
              setActiveFileId(file.id);
              addRecentFile(file); // Use renamed function
              if (file.fileType === 'pdf' && selectedCase) {
                router.push(`/workspace/viewer?file=${encodeURIComponent(file.id)}&caseId=${selectedCase.id}`);
              }
            }}
          />
        )}
        {isDragging && (
          <div className="absolute inset-0 bg-blue-500/20 border-2 border-dashed border-blue-600 flex flex-col items-center justify-center pointer-events-none rounded-md">
            <UploadCloud size={48} className="text-blue-600" />
            <p className="text-blue-600 font-semibold">Drop PDF files here</p>
          </div>
        )}
      </div>
    </div>
  );

  // Search Panel content
  const searchPanelContent = (
    <div className="h-full flex flex-col p-2">
      <div className="mb-2 text-lg font-semibold">Search</div>
      <SearchBar
        query={searchQuery}
        onChange={setSearchQuery}
        onSearch={handleSearch}
      />
      <div className="flex-1 overflow-auto mt-2">
        <SearchResults results={searchResults} />
      </div>
    </div>
  );

  // History Panel content is now handled by RecentFiles.tsx
  // const historyPanelContent = ( ... existing code removed ... );

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    if (!selectedCase) {
      alert("Please select a case first to upload files.");
      return;
    }

    const files = Array.from(event.dataTransfer.files);
    const pdfFiles = files.filter(file => file.type === "application/pdf");

    if (pdfFiles.length === 0) {
      alert("No PDF files found. Please drop PDF files only.");
      return;
    }

    // Create new FileNode objects for each PDF
    const newFileNodes: FileNodeType[] = pdfFiles.map(pdfFile => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // More robust ID
      name: pdfFile.name,
      type: 'file' as const,
      fileType: 'pdf' as const,
      parentId: selectedCase.root.id, // Add to the root of the selected case
      // path and url would be undefined for newly uploaded local files unless handled by a backend
    }));

    // Here's where we need to update the state.
    // Ideally, CaseContext would have a function like `addFilesToCase(caseId, parentId, files)`
    // For now, this is a conceptual challenge as FileTree manages its own state via `load/saveFileTreeState`.
    // A temporary solution might involve directly manipulating selectedCase.root and forcing a re-render,
    // but this bypasses FileTree's internal state management and persistence logic.

    // For this subtask, let's log and acknowledge the limitation.
    // console.log("Dropped files:", newFileNodes);
    // alert(`Simulated upload of ${newFileNodes.length} PDF(s) to case "${selectedCase.name}". \nPersistence via fileTreeStorage for drag-and-drop is not yet fully implemented here and needs context/state management adjustments.`);

    if (newFileNodes.length > 0 && selectedCase) {
      addFilesToSelectedCase(selectedCase.root.id, newFileNodes); // Add to root of current case
      alert(`${newFileNodes.length} PDF(s) added to case "${selectedCase.name}".`);
    }
    // Persistence should now be handled by FileTree via CaseContext state update.
  };


  // Determine which panel content to render
  const renderContent = () => {
    switch (activePanel) {
      case 'explorer':
        return fileExplorerContent;
      case 'search':
        return searchPanelContent;
      case 'history': // Keep 'history' as the key for activePanel if you prefer not to change it everywhere
        return <RecentFiles />;
      default:
        return fileExplorerContent;
    }
  };

  // Simple navigation tabs at the top
  return (
    <div
      className="h-full flex flex-col relative" // Added relative for isDragging overlay
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Simple tab navigation */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActivePanel('explorer')}
          className={`flex-1 p-2 text-sm font-medium transition-colors ${
            activePanel === 'explorer' 
              ? 'text-primary border-b-2 border-primary bg-primary/5' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Files
        </button>
        <button
          onClick={() => setActivePanel('search')}
          className={`flex-1 p-2 text-sm font-medium transition-colors ${
            activePanel === 'search' 
              ? 'text-primary border-b-2 border-primary bg-primary/5' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Search
        </button>
        <button
          onClick={() => setActivePanel('history')}
          className={`flex-1 p-2 text-sm font-medium transition-colors ${
            activePanel === 'history' // Keep 'history' as panel key
              ? 'text-primary border-b-2 border-primary bg-primary/5' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Recent
        </button>
      </div>
      
      {/* Content area */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
}
