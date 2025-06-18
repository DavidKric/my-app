"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Search,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Pen,
  Highlighter,
  FileText,
  MessageSquare,
  Download,
  Printer,
  RotateCw,
  PanelRight,
  Eye,
  Plus,
  Minus,
  CircleHelp,
  Keyboard,
  MoreHorizontal,
  TextSearch,
  Save,
  Text,
  Bookmark,
  ArrowRight,
  BookOpen,
  Share2,
  Settings,
  FileDown,
  Sparkles as AiIcon // Icon for AI toggle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ActionSearchBar, Action } from "@/components/ui/action-search-bar";

// For debouncing search input
function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// PDF Action interface
export interface PDFAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
  shortcut?: string;
  category?: string;
}

interface PDFToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  currentPage: number;
  totalPages: number;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onNextPage: () => void;
  onPrevPage: () => void;
  onPageChange: (page: number) => void;
  onSearch?: (value: string) => void;
  onAnnotate?: () => void;
  onHighlight?: () => void;
  onComment?: () => void;
  onToggleContextPanel?: () => void;
  onDownload?: () => void;
  onPrint?: () => void;
  onRotate?: () => void;
  onShowShortcuts?: () => void;
  onZoomChange: (level: number) => void;
  onToggleOutline: () => void;
  onToggleThumbnails: () => void;
  // Props for AI Highlights toggle
  isAiHighlightsVisible?: boolean;
  onToggleAiHighlights?: () => void;
}

export function PDFToolbar({
  className,
  currentPage,
  totalPages,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onZoomChange,
  onNextPage,
  onPrevPage,
  onPageChange,
  onSearch,
  onAnnotate,
  onHighlight,
  onComment,
  onToggleContextPanel,
  onToggleOutline,
  onToggleThumbnails,
  isAiHighlightsVisible, // New
  onToggleAiHighlights, // New
  onDownload,
  onPrint,
  onRotate,
  onShowShortcuts,
  ...props
}: PDFToolbarProps) {
  const [selectedTab, setSelectedTab] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 200);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const toolbarRef = React.useRef<HTMLDivElement>(null);
  const searchBarId = React.useId();

  // PDF Actions for search
  const pdfActions: PDFAction[] = [
    {
      id: "search",
      label: "Search in document",
      icon: <Search className="h-4 w-4 text-blue-500" />,
      description: "Find text in PDF",
      shortcut: "Ctrl+F",
      category: "Navigation",
    },
    {
      id: "goto-page",
      label: "Go to page",
      icon: <FileText className="h-4 w-4 text-orange-500" />,
      description: "Navigate to specific page",
      shortcut: "Ctrl+G",
      category: "Navigation",
    },
    {
      id: "bookmarks",
      label: "Bookmarks",
      icon: <BookOpen className="h-4 w-4 text-purple-500" />,
      description: "View document bookmarks",
      shortcut: "Ctrl+B",
      category: "View",
    }
  ];

  // A more complete set of available PDF search actions to expose features
  const pdfSearchActions = React.useMemo<Action[]>(() => [
    {
      id: "search",
      label: "Search",
      icon: <Search className="h-4 w-4" />,
      short: "⌘ F",
      end: "Text",
      action: onSearch,
    },
    {
      id: "text-search",
      label: "Text Search",
      icon: <TextSearch className="h-4 w-4" />,
      end: "Enhanced",
      action: onSearch,
    },
    {
      id: "go-to-page",
      label: "Go to Page",
      icon: <FileText className="h-4 w-4" />,
      action: (page: string | number) => {
        const parsedPage = typeof page === 'string' ? parseInt(page) : page;
        if (!isNaN(parsedPage) && parsedPage > 0 && parsedPage <= totalPages) {
          onPageChange(parsedPage);
        }
      }
    },
    {
      id: "rotate-clockwise",
      label: "Rotate Clockwise",
      icon: <RotateCw className="h-4 w-4" />,
      end: "View",
      action: onRotate,
    },
    {
      id: "annotate",
      label: "Annotate",
      icon: <Pen className="h-4 w-4" />,
      end: "Tool",
      action: onAnnotate,
    },
    {
      id: "highlight",
      label: "Highlight",
      icon: <Highlighter className="h-4 w-4" />,
      end: "Tool",
      action: onHighlight,
    },
    {
      id: "comment",
      label: "Comment",
      icon: <MessageSquare className="h-4 w-4" />,
      end: "Tool",
      action: onComment,
    },
    {
      id: "keyboard-shortcuts",
      label: "Keyboard Shortcuts",
      icon: <Keyboard className="h-4 w-4" />,
      end: "Help",
      action: onShowShortcuts,
    },
  ], [totalPages, onSearch, onPageChange, onRotate, onAnnotate, onHighlight, onComment, onShowShortcuts]);

  // Animation variants
  const buttonVariants = {
    initial: (active: boolean) => ({
      paddingRight: active ? "0.75rem" : "0.5rem",
    }),
    animate: (active: boolean) => ({
      paddingRight: active ? "0.75rem" : "0.5rem",
    }),
  };

  const spanVariants = {
    initial: { width: 0, marginLeft: 0, opacity: 0 },
    animate: { width: "auto", marginLeft: 4, opacity: 1 },
    exit: { width: 0, marginLeft: 0, opacity: 0 },
  };

  const transition = { duration: 0.15 };

  const handleTabSelect = (tab: string) => {
    if (selectedTab === tab) {
      setSelectedTab(null);
    } else {
      setSelectedTab(tab);
    }
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleActionSelect = (action: PDFAction) => {
    if (action.id === "search" && onSearch) {
      onSearch(searchQuery);
    } else if (action.id === "goto-page") {
      const page = parseInt(searchQuery);
      if (!isNaN(page) && page > 0 && page <= totalPages) {
        onPageChange(page);
      }
    } else if (action.id === "print" && onPrint) {
      onPrint();
    } else if (action.id === "download" && onDownload) {
      onDownload();
    }
    
    setIsSearchFocused(false);
    setSearchQuery("");
  };

  // Debounced search effect
  React.useEffect(() => {
    if (debouncedSearchQuery && onSearch) {
      onSearch(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, onSearch]);

  // For animations
  const [isSearchExpanded, setIsSearchExpanded] = React.useState(false);

  // Container variants for the search dropdown
  const container = {
    hidden: { opacity: 0, height: 0 },
    show: {
      opacity: 1,
      height: "auto",
      transition: {
        height: { duration: 0.3 },
        staggerChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        height: { duration: 0.2 },
        opacity: { duration: 0.15 },
      },
    },
  };

  // Item variants for search results
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2 },
    },
  };

  return (
    <div 
      ref={toolbarRef}
      className={cn(
        "flex w-full max-w-full overflow-x-auto pb-1 scrollbar-hide bg-background/90 backdrop-blur-sm border-b border-border",
        className
      )}
      {...props}
    >
      <div className="w-full flex items-center justify-between px-2 py-1.5">
        {/* Left section: Primary toolbar */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {/* View tab */}
          <motion.button
            variants={buttonVariants}
            initial="initial"
            animate="animate"
            custom={selectedTab === "view"}
            onClick={() => handleTabSelect("view")}
            transition={transition}
            className={cn(
              "relative flex items-center rounded-xl px-2 py-2 text-sm font-medium transition-colors",
              selectedTab === "view"
                ? "bg-muted text-primary"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            <Eye size={18} />
            <AnimatePresence initial={false}>
              {selectedTab === "view" && (
                <motion.span
                  variants={spanVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={transition}
                  className="overflow-hidden"
                >
                  View
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* When View is selected, show view controls */}
          <AnimatePresence initial={false}>
            {selectedTab === "view" && (
              <motion.div
                initial={{ opacity: 0, x: -10, width: 0 }}
                animate={{ opacity: 1, x: 0, width: "auto" }}
                exit={{ opacity: 0, x: -10, width: 0 }}
                transition={transition}
                className="flex items-center gap-1"
              >
                {/* Page controls */}
                <div className="flex items-center bg-muted/60 rounded-xl">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={onPrevPage}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="hidden md:flex items-center gap-0.5 px-1">
                    <Input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={currentPage}
                      onChange={(e) => {
                        const page = parseInt(e.target.value);
                        if (!isNaN(page) && page > 0 && page <= totalPages) {
                          onPageChange(page);
                        }
                      }}
                      className="h-6 w-12 text-xs p-1 text-center"
                    />
                    <span className="text-xs text-muted-foreground">/ {totalPages}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={onNextPage}
                    disabled={currentPage >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Zoom controls */}
                <div className="flex items-center bg-muted/60 rounded-xl">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={onZoomOut}
                    title="Zoom Out"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  {/* Zoom Level Input */}
                  <Input
                    type="number"
                    value={Math.round(zoomLevel * 100)}
                    onChange={(e) => {
                      const newZoomPercent = parseInt(e.target.value);
                      if (!isNaN(newZoomPercent) && newZoomPercent > 0) {
                        onZoomChange(newZoomPercent / 100);
                      }
                    }}
                    onBlur={(e) => { // Reset to current zoom if input is invalid or empty on blur
                      const currentZoomPercent = Math.round(zoomLevel * 100);
                      if (!e.target.value || parseInt(e.target.value) <= 0) {
                        e.target.value = currentZoomPercent.toString();
                      }
                    }}
                    className="h-6 w-14 text-xs p-1 text-center mx-0.5"
                    min="10"
                    max="500" // Example range
                    step="10"
                    title="Zoom Level (%)"
                  />
                  <span className="text-xs font-medium mr-1">%</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={onZoomIn}
                    title="Zoom In"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Document Structure Toggles */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-muted/60 hover:bg-muted"
                  onClick={onToggleOutline}
                  title="Toggle Outline"
                >
                  <ListTree className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-muted/60 hover:bg-muted"
                  onClick={onToggleThumbnails}
                  title="Toggle Thumbnails"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                {/* AI Highlights Toggle */}
                {onToggleAiHighlights && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 rounded-full bg-muted/60 hover:bg-muted",
                      isAiHighlightsVisible && "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                    )}
                    onClick={onToggleAiHighlights}
                    title={isAiHighlightsVisible ? "Hide AI Highlights" : "Show AI Highlights"}
                  >
                    <AiIcon className="h-4 w-4" />
                  </Button>
                )}

                {/* Rotate */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-muted/60 hover:bg-muted"
                  onClick={onRotate}
                  title="Rotate Clockwise"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Annotate tab */}
          <motion.button
            variants={buttonVariants}
            initial="initial"
            animate="animate"
            custom={selectedTab === "annotate"}
            onClick={() => handleTabSelect("annotate")}
            transition={transition}
            className={cn(
              "relative flex items-center rounded-xl px-2 py-2 text-sm font-medium transition-colors",
              selectedTab === "annotate"
                ? "bg-muted text-primary"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            <Pen size={18} />
            <AnimatePresence initial={false}>
              {selectedTab === "annotate" && (
                <motion.span
                  variants={spanVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={transition}
                  className="overflow-hidden"
                >
                  Annotate
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* When Annotate is selected, show annotation tools */}
          <AnimatePresence initial={false}>
            {selectedTab === "annotate" && (
              <motion.div
                initial={{ opacity: 0, x: -10, width: 0 }}
                animate={{ opacity: 1, x: 0, width: "auto" }}
                exit={{ opacity: 0, x: -10, width: 0 }}
                transition={transition}
                className="flex items-center gap-1"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl bg-muted/60 h-8 px-3"
                  onClick={onAnnotate}
                >
                  <Pen className="h-4 w-4 mr-2" />
                  <span className="text-xs">Note</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl bg-muted/60 h-8 px-3"
                  onClick={onHighlight}
                >
                  <Highlighter className="h-4 w-4 mr-2" />
                  <span className="text-xs">Highlight</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl bg-muted/60 h-8 px-3"
                  onClick={onComment}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  <span className="text-xs">Comment</span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Help tab */}
          <motion.button
            variants={buttonVariants}
            initial="initial"
            animate="animate"
            custom={selectedTab === "help"}
            onClick={() => handleTabSelect("help")}
            transition={transition}
            className={cn(
              "relative flex items-center rounded-xl px-2 py-2 text-sm font-medium transition-colors",
              selectedTab === "help"
                ? "bg-muted text-primary"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            <CircleHelp size={18} />
            <AnimatePresence initial={false}>
              {selectedTab === "help" && (
                <motion.span
                  variants={spanVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={transition}
                  className="overflow-hidden"
                >
                  Help
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* When Help is selected, show help options */}
          <AnimatePresence initial={false}>
            {selectedTab === "help" && (
              <motion.div
                initial={{ opacity: 0, x: -10, width: 0 }}
                animate={{ opacity: 1, x: 0, width: "auto" }}
                exit={{ opacity: 0, x: -10, width: 0 }}
                transition={transition}
                className="flex items-center gap-1"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl bg-muted/60 h-8 px-3"
                  onClick={onShowShortcuts}
                >
                  <Keyboard className="h-4 w-4 mr-2" />
                  <span className="text-xs">Shortcuts</span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Middle: Search bar */}
        <div className="hidden md:block mx-4 max-w-md w-full">
          <div className="relative">
            <Input
              id={searchBarId}
              className="peer pe-9 ps-9 h-8 rounded-full bg-muted/50"
              placeholder="Search in document..."
              type="search"
              value={searchQuery}
              onChange={handleSearchInput}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              ref={searchInputRef}
              dir="auto" // Added for RTL support
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
              <Search size={14} strokeWidth={2} />
            </div>
            <Button
              className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Submit search"
              type="submit"
              variant="ghost"
              size="icon"
              onClick={() => onSearch?.(searchQuery)}
            >
              <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
            </Button>

            {/* Search dropdown */}
            <AnimatePresence>
              {isSearchFocused && pdfActions.length > 0 && (
                <motion.div
                  className="absolute z-50 w-full mt-1 border rounded-md shadow-sm overflow-hidden border-border bg-background"
                  variants={container}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                >
                  <motion.ul className="py-1 max-h-[300px] overflow-y-auto">
                    {pdfActions.map((action) => (
                      <motion.li
                        key={action.id}
                        className="px-3 py-2 flex items-center justify-between hover:bg-muted cursor-pointer"
                        variants={item}
                        onClick={() => handleActionSelect(action)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex-shrink-0">{action.icon}</span>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">
                              {action.label}
                            </span>
                            {action.description && (
                              <span className="text-xs text-muted-foreground">
                                {action.description}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {action.shortcut && (
                            <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono">
                              {action.shortcut}
                            </span>
                          )}
                          {action.category && (
                            <span className="text-xs text-muted-foreground">
                              {action.category}
                            </span>
                          )}
                        </div>
                      </motion.li>
                    ))}
                  </motion.ul>
                  <div className="px-3 py-2 border-t border-border">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Press Esc to cancel</span>
                      <span>Enter to select</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right section: Document actions */}
        <div className="flex items-center gap-1.5">
          {/* Mobile search button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full"
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              title="Search document"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile search expanded */}
          {isSearchExpanded && (
            <div className="absolute right-0 top-0 z-10 md:hidden">
              <ActionSearchBar 
                actions={pdfSearchActions} 
              />
            </div>
          )}

          {/* Document actions group */}
          <div className="flex items-center bg-muted/60 rounded-xl px-1 py-0.5">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full"
              onClick={onDownload}
              title="Download PDF"
            >
              <Download className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full"
              onClick={onPrint}
              title="Print document"
            >
              <Printer className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onDownload}>
                  <FileDown className="h-4 w-4 mr-2" />
                  Save as
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onShowShortcuts}>
                  <Keyboard className="h-4 w-4 mr-2" />
                  Keyboard shortcuts
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onToggleContextPanel}>
                  <PanelRight className="h-4 w-4 mr-2" />
                  Toggle sidebar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile page navigation - only shown on small screens */}
      <div className="md:hidden w-full px-2 pt-1 pb-2 flex items-center justify-center">
        <div className="flex items-center bg-muted/50 px-2 rounded-xl">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={onPrevPage}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center">
            <span className="text-xs font-medium mx-1 whitespace-nowrap">
              {currentPage} / {totalPages}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={onNextPage}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 