'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { Case } from '@/types/file_explorer/file-structure';
import CaseSwitcher from '@/components/file_explorer/CaseSwitcher';
import SearchBar from './SearchBar';
import FileTree from './FileTree';

// Import icons from lucide-react
import { Pin, PinOff, Folder, Search, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Define a union type for the active panel.
type Panel = 'explorer' | 'search' | 'history';

interface SidebarProps {
  cases: Case[];
  isExpanded?: boolean;
}

export default function ExplorerSidebar({ cases, isExpanded = true }: SidebarProps) {
  const [activeProjectId, setActiveProjectId] = useState(cases[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [pinned, setPinned] = useState(true); // Default to pinned for better usability
  const [hovered, setHovered] = useState(false);
  const [activePanel, setActivePanel] = useState<Panel>('explorer');

  const activeProject = cases.find((p) => p.id === activeProjectId);

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
        <SearchBar query={searchQuery} onChange={setSearchQuery} />
      </div>
      {/* File Tree */}
      <div className="flex-1 overflow-auto">
        {activeProject && (
          <FileTree
            root={activeProject.root}
            searchQuery={searchQuery}
            onFileSelect={(file) => {
              // Handle file open (e.g. navigation or state update)
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
      <SearchBar query={searchQuery} onChange={setSearchQuery} />
      <div className="flex-1 overflow-auto mt-2">
        {/* Placeholder for search results */}
        <p className="text-sm text-muted-foreground">Search results will appear here.</p>
      </div>
    </div>
  );

  // History Panel content (a separate panel)
  const historyPanelContent = (
    <div className="h-full flex flex-col p-2">
      <div className="mb-2 text-lg font-semibold">History</div>
      <div className="flex-1 overflow-auto">
        {/* Placeholder for recent documents */}
        <p className="text-sm text-muted-foreground">Recent documents will be shown here.</p>
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
