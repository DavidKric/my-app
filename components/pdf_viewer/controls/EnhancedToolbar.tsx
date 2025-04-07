'use client';

import React, { useState } from 'react';
import { 
  ZoomIn, 
  ZoomOut,
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Download,
  Printer,
  Rotate3D,
  TextSelect,
  Hand,
  PanelLeft,
  PanelRight,
  Highlighter,
  PenLine,
  MessageSquare,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

// 21st.dev components
import { Action } from '@/components/ui/action-search-bar';

interface ToolbarProps {
  currentPage: number;
  numPages?: number;
  scale: number;
  onZoomChange: (scale: number) => void;
  onPageChange: (page: number) => void;
  onAnnotate?: () => void;
  onHighlight?: () => void;
  onComment?: () => void;
  onToggleContextPanel?: () => void;
}

export default function EnhancedToolbar({ 
  currentPage, 
  numPages, 
  scale, 
  onZoomChange, 
  onPageChange,
  onAnnotate,
  onHighlight,
  onComment,
  onToggleContextPanel
}: ToolbarProps) {
  const [activeTab, setActiveTab] = useState('view');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMoreTools, setShowMoreTools] = useState(false);

  // PDF actions
  const pdfActions: Action[] = [
    {
      id: "search",
      label: "Search in document",
      icon: <Search className="h-4 w-4 text-blue-500" />,
      short: "Ctrl+F",
      end: "Action"
    },
    {
      id: "download",
      label: "Download PDF",
      icon: <Download className="h-4 w-4 text-green-500" />,
      end: "Action"
    },
    {
      id: "print",
      label: "Print document",
      icon: <Printer className="h-4 w-4 text-purple-500" />,
      short: "Ctrl+P",
      end: "Action"
    },
    {
      id: "rotate",
      label: "Rotate view",
      icon: <Rotate3D className="h-4 w-4 text-orange-500" />,
      end: "Action"
    }
  ];

  const handleToggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setTimeout(() => document.getElementById('pdf-search-input')?.focus(), 100);
    }
  };

  const tabClasses = (tabName: string) => 
    cn("px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-1.5 transition-colors", 
      activeTab === tabName 
        ? "bg-primary/10 text-primary hover:bg-primary/15" 
        : "text-muted-foreground hover:bg-muted hover:text-foreground");

  return (
    <div className="sticky top-0 z-10 w-full backdrop-blur-sm">
      <div className="flex flex-col border-b shadow-sm bg-background/90">
        {/* Main Toolbar */}
        <div className="flex items-center justify-between px-3 py-2">
          {/* Left Side Tools */}
          <div className="flex items-center gap-1.5">
            <div className="flex border rounded-lg overflow-hidden shadow-sm">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-none border-r"
                onClick={() => onZoomChange(scale - 0.1)}
              >
                <ZoomOut size={16} />
              </Button>
              <span className="inline-flex items-center justify-center min-w-[50px] text-xs font-medium">
                {Math.round(scale * 100)}%
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-none border-l"
                onClick={() => onZoomChange(scale + 0.1)}
              >
                <ZoomIn size={16} />
              </Button>
            </div>
            
            <div className="h-6 w-[1px] bg-border mx-1" />
            
            <div className="flex border rounded-lg overflow-hidden shadow-sm">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-none border-r"
                disabled={currentPage <= 1} 
                onClick={() => onPageChange(currentPage - 1)}
              >
                <ChevronLeft size={16} />
              </Button>
              <span className="inline-flex items-center justify-center min-w-[80px] text-xs font-medium">
                {currentPage} / {numPages || 0}
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-none border-l"
                disabled={currentPage >= (numPages || 0)} 
                onClick={() => onPageChange(currentPage + 1)}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
          
          {/* Center Tabs */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            <button 
              className={tabClasses('view')}
              onClick={() => setActiveTab('view')}
            >
              <Hand size={16} />
              <span className="hidden sm:inline">Pan</span>
            </button>
            <button 
              className={tabClasses('select')}
              onClick={() => setActiveTab('select')}
            >
              <TextSelect size={16} />
              <span className="hidden sm:inline">Select</span>
            </button>
            <button 
              className={tabClasses('annotate')}
              onClick={() => {
                setActiveTab('annotate');
                onAnnotate?.();
              }}
            >
              <PenLine size={16} />
              <span className="hidden sm:inline">Annotate</span>
            </button>
            <button 
              className={tabClasses('highlight')}
              onClick={() => {
                setActiveTab('highlight');
                onHighlight?.();
              }}
            >
              <Highlighter size={16} />
              <span className="hidden sm:inline">Highlight</span>
            </button>
          </div>
          
          {/* Right Side Actions */}
          <div className="flex items-center gap-1.5">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative h-8 w-8 rounded-full"
              onClick={handleToggleSearch}
            >
              <Search size={16} />
              {showSearch && (
                <div className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
              )}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full"
              onClick={onToggleContextPanel}
            >
              <PanelRight size={16} />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative h-8 w-8 rounded-full"
              onClick={() => setShowMoreTools(!showMoreTools)}
            >
              <MoreHorizontal size={16} />
              {showMoreTools && (
                <motion.div 
                  className="absolute top-full right-0 mt-1 w-48 bg-background border rounded-lg shadow-lg p-1 z-50"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  {pdfActions.map(action => (
                    <button
                      key={action.id}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded-md hover:bg-muted"
                    >
                      <span className="flex-shrink-0">{action.icon}</span>
                      <span className="flex-grow">{action.label}</span>
                      {action.short && (
                        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {action.short}
                        </span>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </Button>
          </div>
        </div>
        
        {/* Search Bar - Expandable */}
        <AnimatePresence>
          {showSearch && (
            <motion.div 
              className="border-t p-2 bg-background/95"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="pdf-search-input"
                    placeholder="Search in document..."
                    className="pl-8 h-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button size="sm" variant="default" className="h-9">
                  Search
                </Button>
                <Button size="sm" variant="ghost" className="h-9" onClick={handleToggleSearch}>
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 