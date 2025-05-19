'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { Case, FileNode, FolderNode } from '@/types/file_explorer/file-structure';
import CaseSwitcher from '@/components/file_explorer/CaseSwitcher';
import SearchBar from './SearchBar';
import FileTree from './FileTree';
import SearchResults from './SearchResults';

// Import icons from lucide-react
import { Pin, PinOff, Folder, Search, Clock } from 'lucide-react';
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
  const [pinned, setPinned] = useState(true); // Default to pinned for better usability
  const [hovered, setHovered] = useState(false);
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

  // Original file explorer content
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
            }}
          />
        )}
      </div>
    </div>
  );

  // Search Panel content (a separate panel)
  const searchPanelContent = (
    <div className="h-full flex flex-col p-2">
      <div className="mb-2 text-lg font-semibold">Search</div>
      {/* You can reuse SearchBar here or create a dedicated one */}
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

  // History Panel content (a separate panel)
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
  const renderActivePanel = () => {
    switch (activePanel) {
      case 'explorer':
        return fileExplorerContent;
      case 'search':
        return searchPanelContent;
      case 'history':
        return historyPanelContent;
      default:
        return null;
    }
  };

  // Now we always render the expanded view
  return (
    <div className="flex h-full">
      {/* Icon Bar - always visible */}
      <div className="flex flex-col items-center bg-secondary/70 text-secondary-foreground h-full space-y-6 py-4 min-w-[3rem]">
        {/* Pin/Unpin button */}
        <button
          className="p-2 hover:bg-accent rounded"
          onClick={() => setPinned((prev) => !prev)}
          aria-label={pinned ? 'Unpin sidebar' : 'Pin sidebar'}
        >
          {pinned ? <PinOff size={18} /> : <Pin size={18} />}
        </button>
        
        {/* Explorer Icon */}
        <Button
          variant="ghost"
          size="icon"
          className={clsx(
            'h-10 w-10 rounded-full',
            activePanel === 'explorer' ? 'bg-blue-50 text-blue-600' : 'hover:bg-accent'
          )}
          onClick={() => setActivePanel('explorer')}
          aria-label="File Explorer"
        >
          <Folder size={18} />
        </Button>
        
        {/* Search Icon */}
        <Button
          variant="ghost"
          size="icon"
          className={clsx(
            'h-10 w-10 rounded-full',
            activePanel === 'search' ? 'bg-green-50 text-green-600' : 'hover:bg-accent'
          )}
          onClick={() => setActivePanel('search')}
          aria-label="Search"
        >
          <Search size={18} />
        </Button>
        
        {/* History Icon */}
        <Button
          variant="ghost"
          size="icon"
          className={clsx(
            'h-10 w-10 rounded-full',
            activePanel === 'history' ? 'bg-purple-50 text-purple-600' : 'hover:bg-accent'
          )}
          onClick={() => setActivePanel('history')}
          aria-label="History"
        >
          <Clock size={18} />
        </Button>
      </div>

      {/* Content Area */}
      {pinned ? (
        // Fixed panel when pinned
        <div className="flex-1 h-full overflow-hidden border-l border-border">
          {renderActivePanel()}
        </div>
      ) : hovered ? (
        // Hover overlay when not pinned
        <div className="absolute left-12 top-0 w-64 h-full bg-background border-r border-border shadow-lg z-50">
          {renderActivePanel()}
        </div>
      ) : null}
    </div>
  );
}
