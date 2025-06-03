'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Case, FileNode, FolderNode } from '@/types/file_explorer/file-structure';
import CaseSwitcher from '@/components/file_explorer/CaseSwitcher';
import SearchBar from './SearchBar';
import FileTree from './FileTree';
import SearchResults from './SearchResults';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRecentFiles } from '@/lib/useRecentFiles';

// Define a union type for the active panel.
type Panel = 'explorer' | 'search' | 'history';

interface SidebarProps {
  cases: Case[];
  isExpanded?: boolean;
}

export default function ExplorerSidebar({ cases, isExpanded = true }: SidebarProps) {
  const [activeProjectId, setActiveProjectId] = useState(cases[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FileNode[]>([]);
  const [activePanel, setActivePanel] = useState<Panel>('explorer');
  const [activeFileId, setActiveFileId] = useState('');
  const { recentFiles, clearFiles, addFile } = useRecentFiles();
  const router = useRouter();

  const activeProject = cases.find((p) => p.id === activeProjectId);

  const collectFiles = (node: FolderNode | FileNode, query: string, acc: FileNode[]) => {
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
    if (!query.trim() || !activeProject) {
      setSearchResults([]);
      return;
    }
    const results: FileNode[] = [];
    collectFiles(activeProject.root, query, results);
    setSearchResults(results);
  };

  // File explorer content
  const fileExplorerContent = (
    <div className="h-full flex flex-col">
      {/* Project Switcher */}
      <div className="p-2 border-b border-border">
        <CaseSwitcher
          cases={cases}
          activeProjectId={activeProjectId}
          onSelectProject={setActiveProjectId}
        />
      </div>
      {/* Search Bar (within Explorer) */}
      <div className="p-2 border-b border-border">
        <SearchBar
          query={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
        />
      </div>
      {/* File Tree */}
      <div className="flex-1 overflow-auto">
        {activeProject && (
          <FileTree
            root={activeProject.root}
            searchQuery={searchQuery}
            activeFileId={activeFileId}
            onFileSelect={(file) => {
              setActiveFileId(file.id);
              addFile(file);
              if (file.fileType === 'pdf') {
                router.push(`/workspace/viewer?file=${encodeURIComponent(file.id)}`);
              }
            }}
          />
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

  // History Panel content
  const historyPanelContent = (
    <div className="h-full flex flex-col p-2 space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">History</div>
        {recentFiles.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFiles}>
            Clear
          </Button>
        )}
      </div>
      <div className="flex-1 overflow-auto space-y-1">
        {recentFiles.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent files.</p>
        ) : (
          recentFiles.map(file => (
            <button
              key={file.id}
              className="flex w-full items-center rounded px-2 py-1 text-left hover:bg-accent"
              onClick={() => {
                addFile(file)
                if (file.fileType === 'pdf') {
                  router.push(`/workspace/viewer?file=${encodeURIComponent(file.id)}`)
                }
              }}
            >
              <FileText className="mr-2 h-4 w-4" />
              {file.name}
            </button>
          ))
        )}
      </div>
    </div>
  );

  // Determine which panel content to render
  const renderContent = () => {
    switch (activePanel) {
      case 'explorer':
        return fileExplorerContent;
      case 'search':
        return searchPanelContent;
      case 'history':
        return historyPanelContent;
      default:
        return fileExplorerContent;
    }
  };

  // Simple navigation tabs at the top
  return (
    <div className="h-full flex flex-col">
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
            activePanel === 'history' 
              ? 'text-primary border-b-2 border-primary bg-primary/5' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          History
        </button>
      </div>
      
      {/* Content area */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
}
