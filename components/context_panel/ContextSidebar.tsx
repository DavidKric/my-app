'use client';

import React, { useState, useEffect } from 'react';
import { useAnnotations } from './annotations/AnnotationProvider';
import { AnnotationSidebar } from './annotations/ProfessionalAnnotationSidebar';
import ChatSidebar from './integrated_ai/ChatSidebar';
import { 
  FileText, 
  MessageSquare, 
  Highlighter,
  BookOpen, // Already here, can be used for Bookmarks
  Users, // For Entities
  CalendarClock, // For Timeline
  Zap, // For Automations
  Brain, // For Insights (if different from Skimming)
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';

// Import Panels
import SkimmingHighlightsPanel from '@/components/context_panel/annotations/SkimmingHighlightsPanel'; // Reused for Insights
import EntitiesPanel from './entities/EntitiesPanel';
import TimelinePanel from './timeline/TimelinePanel';
import BookmarksPanel from './bookmarks/BookmarksPanel';
import AutomationsPanel from './automations/AutomationsPanel';


interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface ContextSidebarProps {
  activeTab?: string;
  onSetActiveTab?: (tabId: string) => void;
  isExpanded?: boolean; // Keep for compatibility, but always render as expanded
}

export default function ContextSidebar({ activeTab: externalActiveTab, onSetActiveTab, isExpanded = true }: ContextSidebarProps) {
  // Use internal state if no external state is provided
  const [internalActiveTab, setInternalActiveTab] = useState('annotations');
  const activeTab = externalActiveTab || internalActiveTab;
  
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const { state } = useAnnotations();
  const { annotations = [] } = state || {};
  const currentPage = state?.currentPage || 1;

  const handleAnnotationClick = (id: string) => {
    // Implementation would depend on your annotation structure
    console.log(`Jump to annotation ${id}`);
  };

  // Handle tab change with either external or internal state
  const handleTabChange = (tabId: string) => {
    if (onSetActiveTab) {
      onSetActiveTab(tabId);
    } else {
      setInternalActiveTab(tabId);
    }
  };

  const handleNewMessage = () => {
    // If we're not on the chat tab, mark the tab as having a new message
    if (activeTab !== 'copilot') {
      setHasNewMessage(true);
      // Add a breathing animation that will play for 2 seconds
      setTimeout(() => setHasNewMessage(false), 2000);
    }
  };

  // Clear new message indicator when switching to the chat tab
  useEffect(() => {
    if (activeTab === 'copilot') {
      setHasNewMessage(false);
    }
  }, [activeTab]);

  const tabs: Tab[] = [
    { 
      id: 'annotations', 
      label: 'Annotations', 
      icon: <FileText className="h-4 w-4" /> 
    },
    { 
      id: 'skimming', 
      label: 'Skimming', 
      icon: <Highlighter className="h-4 w-4" /> 
    },
    { 
      id: 'copilot', 
      label: 'AI Copilot', 
      icon: <MessageSquare className="h-4 w-4" /> 
    },
    // New Tabs
    {
      id: 'entities',
      label: 'Entities',
      icon: <Users className="h-4 w-4" />
    },
    {
      id: 'timeline',
      label: 'Timeline',
      icon: <CalendarClock className="h-4 w-4" />
    },
    {
      id: 'bookmarks',
      label: 'Bookmarks',
      icon: <BookOpen className="h-4 w-4" />
    },
    {
      id: 'automations',
      label: 'Automations',
      icon: <Zap className="h-4 w-4" />
    },
    {
      id: 'insights', // Using SkimmingHighlightsPanel for this
      label: 'Insights',
      icon: <Brain className="h-4 w-4" />
    }
  ];

  // Always render the full expanded view since minimized state is handled by LayoutClient
  return (
    <div className="h-full flex flex-col overflow-hidden bg-background/90 glass-morphism">
      <div className="border-b border-border bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm">
        <div className="px-4 py-3">
          <div className="relative flex space-x-1 overflow-hidden">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                className={cn(
                  "relative px-3 py-2 cursor-pointer transition-colors",
                  "text-sm font-medium rounded-t-md",
                  activeTab === tab.id 
                    ? cn("text-primary tab-border-glow", {
                        "tab-border-glow-blue": tab.id === "copilot",
                        "tab-border-glow-amber": tab.id === "annotations",
                        "tab-border-glow-purple": tab.id === "skimming",
                        // Add glow colors for new tabs if desired
                        "tab-border-glow-green": tab.id === "entities",
                        "tab-border-glow-red": tab.id === "timeline",
                        "tab-border-glow-yellow": tab.id === "bookmarks",
                        "tab-border-glow-cyan": tab.id === "automations",
                        "tab-border-glow-pink": tab.id === "insights",
                      })
                    : "text-muted-foreground hover:text-foreground hover:bg-gradient-to-b hover:from-blue-50/20 hover:to-transparent dark:hover:from-blue-900/10 dark:hover:to-transparent",
                  tab.id === 'copilot' && hasNewMessage && "tab-notification tab-breathing"
                )}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleTabChange(tab.id)}
              >
                <div className="flex items-center gap-2 relative z-10">
                  {tab.icon}
                  <span>{tab.label}</span>
                </div>
                
                {/* Enhanced hover highlight with subtle glow */}
                {hoveredIndex === index && activeTab !== tab.id && (
                  <div className="absolute inset-0 bg-blue-50/30 dark:bg-blue-900/10 rounded-t-md backdrop-blur-[1px]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
          
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'annotations' && (
            <motion.div 
              key="annotations"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <AnnotationSidebar 
                annotations={annotations as any[]} 
                currentPage={currentPage}
                onAnnotationClick={handleAnnotationClick}
              />
            </motion.div>
          )}
          
          {activeTab === 'skimming' && (
            <motion.div 
              key="skimming"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <SkimmingHighlightsPanel />
            </motion.div>
          )}
          
          {activeTab === 'copilot' && (
            <motion.div 
              key="copilot"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <ChatSidebar className="h-full border-0 rounded-none" onNewMessage={handleNewMessage} />
            </motion.div>
          )}

          {activeTab === 'entities' && (
            <motion.div
              key="entities"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <EntitiesPanel />
            </motion.div>
          )}

          {activeTab === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <TimelinePanel />
            </motion.div>
          )}

          {activeTab === 'bookmarks' && (
            <motion.div
              key="bookmarks"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <BookmarksPanel />
            </motion.div>
          )}

          {activeTab === 'automations' && (
            <motion.div
              key="automations"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <AutomationsPanel />
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {/* Reusing SkimmingHighlightsPanel for Insights */}
              <SkimmingHighlightsPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
