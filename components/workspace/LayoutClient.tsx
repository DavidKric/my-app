"use client";

import React, { useState } from 'react';
import { Case } from '@/types/file_explorer/file-structure';
import ExplorerSidebar from '@/components/file_explorer/ExplorerSidebar';
import ContextSidebar from '@/components/context_panel/ContextSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FloatingActionButtons } from '@/components/pdf_viewer/utils/FloatingActionButtons';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LayoutClientProps {
  children: React.ReactNode;
  cases: Case[];
}

// Animation variants for consistent transitions
const sidebarVariants = {
  expanded: (width: number) => ({
    width: width,
    opacity: 1,
    transition: {
      type: "tween",
      duration: 0.3,
      ease: "easeInOut"
    }
  }),
  collapsed: {
    width: 0,
    opacity: 0,
    transition: {
      type: "tween",
      duration: 0.3,
      ease: "easeInOut"
    }
  }
};

export function LayoutClient({ children, cases }: LayoutClientProps) {
  const [isLeftExpanded, setIsLeftExpanded] = useState(true);
  const [isRightExpanded, setIsRightExpanded] = useState(true);
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
  };
  
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Left Sidebar: File Explorer */}
      <AnimatePresence mode="wait">
        {isLeftExpanded && (
          <motion.div
            variants={sidebarVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            custom={320}
            className="relative h-full border-r border-border bg-background/95 backdrop-blur-sm z-10 shadow-sm"
          >
            <div className="absolute top-3 right-0 z-20 h-6 w-0 flex items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsLeftExpanded(false)}
                className="h-6 w-6 rounded-full border border-border bg-background shadow-sm transform translate-x-1/2"
                aria-label="Collapse file explorer"
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
            </div>
            
            <ScrollArea className="h-full">
              <ExplorerSidebar cases={cases} isExpanded={true} />
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Expand Button for Left Sidebar - only visible when collapsed */}
      {!isLeftExpanded && (
        <div className="absolute top-3 left-0 z-20 h-6 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsLeftExpanded(true)}
            className="h-6 w-6 rounded-full border border-border bg-background shadow-sm ml-2"
            aria-label="Expand file explorer"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      {/* Main Panel: PDF Viewer & Annotation */}
      <main className="flex-1 overflow-auto bg-muted/20 relative flex flex-col">
        <div className="flex-1 overflow-auto">
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
      
      {/* Right Sidebar: Annotations & AI Copilot */}
      <AnimatePresence mode="wait">
        {isRightExpanded && (
          <motion.div
            variants={sidebarVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            custom={380}
            className="relative h-full border-l border-border bg-background/95 backdrop-blur-sm z-10 shadow-sm"
          >
            <div className="absolute top-3 left-0 z-20 h-6 w-0 flex items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsRightExpanded(false)}
                className="h-6 w-6 rounded-full border border-border bg-background shadow-sm transform -translate-x-1/2"
                aria-label="Collapse context panel"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
            
            <ScrollArea className="h-full">
              <ContextSidebar activeTab={activeTab} onSetActiveTab={setActiveTab} />
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Expand Button for Right Sidebar - only visible when collapsed */}
      {!isRightExpanded && (
        <div className="absolute top-3 right-0 z-20 h-6 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsRightExpanded(true)}
            className="h-6 w-6 rounded-full border border-border bg-background shadow-sm mr-2"
            aria-label="Expand context panel"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
} 