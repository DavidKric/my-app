"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  children: React.ReactNode;
  defaultExpanded?: boolean;
  position?: "left" | "right";
  width?: number;
  collapsedWidth?: number;
  className?: string;
}

interface SidebarPanelProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const sidebarVariants = {
  expanded: (width: number) => ({
    width: width,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  }),
  collapsed: (width: number) => ({
    width: width,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  })
};

const contentVariants = {
  expanded: {
    opacity: 1,
    transition: {
      delay: 0.1
    }
  },
  collapsed: {
    opacity: 0,
    transition: {
      duration: 0.1
    }
  }
};

export function CollapsibleSidebar({
  children,
  defaultExpanded = true,
  position = "left",
  width = 300,
  collapsedWidth = 48,
  className
}: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Handle click outside to collapse on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target as Node) && 
        window.innerWidth < 768 && 
        isExpanded
      ) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  return (
    <motion.div
      ref={sidebarRef}
      className={cn(
        "relative h-full border-border bg-background flex-shrink-0 z-20",
        position === "left" ? "border-r" : "border-l",
        className
      )}
      initial={defaultExpanded ? "expanded" : "collapsed"}
      animate={isExpanded ? "expanded" : "collapsed"}
      variants={sidebarVariants}
      custom={isExpanded ? width : collapsedWidth}
    >
      <div className="flex flex-col h-full">
        <div className={cn(
          "absolute top-3 z-10",
          position === "left" ? "-right-3" : "-left-3"
        )}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            className="h-6 w-6 rounded-full border border-border bg-background shadow-sm"
          >
            {position === "left" 
              ? (isExpanded ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />)
              : (isExpanded ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />)
            }
          </Button>
        </div>
        
        <ScrollArea className="h-full flex-1">
          <AnimatePresence mode="wait">
            {isExpanded ? (
              <motion.div
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="p-4"
              >
                {children}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-4 space-y-6"
              >
                {/* Simple collapsed view with minimal content */}
                <div className="w-full flex flex-col items-center space-y-4 pt-8">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                    onClick={() => setIsExpanded(true)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </div>
    </motion.div>
  );
}

export function SidebarPanel({ title, icon, children, className }: SidebarPanelProps) {
  return (
    <div className={cn("mb-4", className)}>
      <div className="flex items-center mb-2 text-sm font-medium text-foreground">
        <span className="mr-2">{icon}</span>
        {title}
      </div>
      <div className="pl-1">{children}</div>
    </div>
  );
} 