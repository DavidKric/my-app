"use client";

import React, { useState } from 'react';
import { Case } from '@/types/file_explorer/file-structure';
import ExplorerSidebar from '@/components/file_explorer/ExplorerSidebar';
import ContextSidebar from '@/components/context_panel/ContextSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FloatingActionButtons } from '@/components/pdf_viewer/utils/FloatingActionButtons';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CaseProvider } from '@/contexts/CaseContext';
import FloatingAssistantButton from '@/components/assistant/FloatingAssistantButton';
import AssistantPanel from '@/components/assistant/AssistantPanel';
import { ThemeToggleButton } from '@/components/ThemeToggleButton'; // Import ThemeToggleButton

interface LayoutClientProps {
  children: React.ReactNode;
  cases: Case[];
}

// Animation variants for consistent transitions
const sidebarVariants = {
  expanded: (width: number) => ({
    width,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  }),
  collapsed: (width: number) => ({
    width,
    opacity: width === 0 ? 0 : 1, // Hide completely when width is 0
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  }),
};

export function LayoutClient({ children, cases }: LayoutClientProps) {
  const [isLeftExpanded, setIsLeftExpanded] = useState(false);
  const [isRightExpanded, setIsRightExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('annotations');
  
  // Handler functions for sidebar interactions
  const handleShowPanel = () => {
    setIsRightExpanded(true);
  };
  
  const handleAnnotate = () => {
    setIsRightExpanded(true);
    setActiveTab('annotations');
  };
  
  const handleHighlight = () => {
    setIsRightExpanded(true);
    setActiveTab('skimming');
  };
  
  const handleComment = () => {
    setIsRightExpanded(true);
    setActiveTab('annotations');
  };
  
  const handleAIAssist = () => {
    setIsRightExpanded(true);
    setActiveTab('copilot');
    // Potentially open Assistant Panel too, or make it the same thing as copilot tab
    // setIsAssistantPanelVisible(true);
  };

  const [isAssistantPanelVisible, setIsAssistantPanelVisible] = useState(false);
  const [assistantHasNewMessages, setAssistantHasNewMessages] = useState(false); // Example state

  const toggleAssistantPanel = () => {
    setIsAssistantPanelVisible(prev => !prev);
    if (assistantHasNewMessages) {
      setAssistantHasNewMessages(false); // Clear notification on open
    }
  };
  
  // Example function to simulate receiving a new message
  const simulateNewAssistantMessage = () => {
    if (!isAssistantPanelVisible) {
      setAssistantHasNewMessages(true);
    }
    // In a real app, this would be triggered by actual new messages from the assistant
    console.log("Simulating new assistant message indicator.");
  };
  React.useEffect(() => { // Demo: simulate new message after 5s if panel is closed
    const timer = setTimeout(() => {
      if(!isAssistantPanelVisible) simulateNewAssistantMessage();
    }, 5000);
    return () => clearTimeout(timer);
  }, [isAssistantPanelVisible]);


  return (
    <CaseProvider initialCases={cases}>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Left Sidebar: File Explorer - Always visible, expandable like Semantic Scholar */}
        <motion.div
        id="file-explorer-sidebar"
        variants={sidebarVariants}
        initial={false}
        animate={isLeftExpanded ? "expanded" : "collapsed"}
        custom={isLeftExpanded ? 320 : 48} // 48px when collapsed for single icon
        className="relative h-full border-r border-border bg-background/95 backdrop-blur-sm z-10 shadow-sm overflow-hidden"
      >
        {isLeftExpanded ? (
          <>
            {/* Expanded Sidebar Header */}
            <div className="flex items-center justify-between p-3 border-b border-border">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-medium text-foreground">Files</h2>
              </div>
              <div className="flex items-center gap-1">
                <ThemeToggleButton />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsLeftExpanded(false)}
                  className="h-8 w-8 rounded-sm hover:bg-muted"
                  aria-label="Minimize file explorer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <ScrollArea className="h-[calc(100%-60px)]">
              {/* ExplorerSidebar will now consume from CaseContext */}
              <ExplorerSidebar isExpanded={true} />
            </ScrollArea>
          </>
        ) : (
          // Collapsed - Single folder icon
          <div className="h-full flex flex-col items-center justify-start pt-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsLeftExpanded(true)}
              className="h-10 w-10 rounded-md hover:bg-muted"
              aria-label="Expand file explorer"
              title="Files"
            >
              <Folder className="h-5 w-5" />
            </Button>
          </div>
        )}
      </motion.div>
      
      {/* Main Panel: PDF Viewer - Full viewport like Semantic Scholar */}
      <main className="flex-1 overflow-hidden bg-white relative flex flex-col">
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
        
        {/* Floating action buttons - show only when right panel is collapsed */}
        <AnimatePresence>
          {!isRightExpanded && (
            <FloatingActionButtons 
              isVisible={true}
              onAnnotate={handleAnnotate}
              onHighlight={handleHighlight}
              onComment={handleComment}
              onAIAssist={handleAIAssist}
              onShowPanel={handleShowPanel}
            />
          )}
        </AnimatePresence>
      </main>
      
      {/* Right Sidebar: Annotations & AI Copilot - Completely hidden when collapsed */}
      <AnimatePresence>
        {isRightExpanded && (
          <motion.div
            id="context-panel-sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 380, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="relative h-full border-l border-border bg-background/95 backdrop-blur-sm z-10 shadow-sm overflow-hidden"
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-3 border-b border-border">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsRightExpanded(false)}
                className="h-8 w-8 rounded-sm hover:bg-muted"
                aria-label="Close context panel"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <h2 className="text-sm font-medium text-foreground">Tools</h2>
            </div>
            
            <ScrollArea className="h-[calc(100%-60px)]">
              <ContextSidebar activeTab={activeTab} onSetActiveTab={setActiveTab} isExpanded={true} />
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      {/* Floating Assistant Button & Panel */}
      <FloatingAssistantButton
        onClick={toggleAssistantPanel}
        hasNewMessages={assistantHasNewMessages}
      />
      <AssistantPanel
        isVisible={isAssistantPanelVisible}
        onClose={toggleAssistantPanel}
      />
    </CaseProvider>
  );
} 