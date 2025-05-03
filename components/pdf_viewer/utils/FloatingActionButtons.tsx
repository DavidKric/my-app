"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  MessageSquare, 
  Highlighter, 
  BookOpen, 
  PenLine,
  Eye,
  Search,
  User
} from "lucide-react";

interface FloatingActionButtonsProps {
  isVisible: boolean;
  onAnnotate: () => void;
  onHighlight: () => void;
  onComment: () => void;
  onAIAssist: () => void;
  onShowPanel: () => void;
  className?: string;
}

export function FloatingActionButtons({
  isVisible,
  onAnnotate,
  onHighlight,
  onComment,
  onAIAssist,
  onShowPanel,
  className
}: FloatingActionButtonsProps) {
  if (!isVisible) return null;

  // Animation variants for container
  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        staggerChildren: 0.05
      }
    },
    exit: { 
      opacity: 0, 
      x: 20,
      transition: {
        duration: 0.2,
        staggerChildren: 0.03,
        staggerDirection: -1
      }
    }
  };

  // Animation variants for buttons
  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 10 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 400, damping: 20 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      y: 10,
      transition: { duration: 0.15 }
    },
    hover: { 
      scale: 1.1,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    },
    tap: { scale: 0.95 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        "fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50",
        className
      )}
    >
      <motion.div 
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-2.5 flex flex-col gap-2.5"
        initial={{ boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" }}
        whileHover={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
        transition={{ duration: 0.2 }}
      >
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={onHighlight}
          className="w-11 h-11 rounded-full flex items-center justify-center text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/30 transition-all shadow-sm hover:shadow"
          title="Highlight text"
        >
          <Highlighter className="w-5 h-5" />
          <span className="absolute right-full mr-3 bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">Highlight</span>
        </motion.button>
        
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={onAnnotate}
          className="w-11 h-11 rounded-full flex items-center justify-center text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 transition-all shadow-sm hover:shadow"
          title="Add annotation"
        >
          <PenLine className="w-5 h-5" />
        </motion.button>
        
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={onComment}
          className="w-11 h-11 rounded-full flex items-center justify-center text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 transition-all shadow-sm hover:shadow"
          title="Add comment"
        >
          <MessageSquare className="w-5 h-5" />
        </motion.button>
        
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={onAIAssist}
          className="w-11 h-11 rounded-full flex items-center justify-center text-purple-600 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 transition-all shadow-sm hover:shadow"
          title="AI Assistant"
        >
          <User className="w-5 h-5" />
        </motion.button>
        
        <motion.div 
          className="w-8 h-[1px] bg-gray-200 dark:bg-gray-700 mx-auto my-1" 
          variants={buttonVariants}
        />
        
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={onShowPanel}
          className="w-11 h-11 rounded-full flex items-center justify-center text-gray-600 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-all shadow-sm hover:shadow"
          title="Show panel"
        >
          <Eye className="w-5 h-5" />
        </motion.button>
      </motion.div>

      {/* Secondary action pill - search */}
      <motion.div 
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-2.5 mt-2"
        variants={containerVariants}
        initial={{ boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" }}
        whileHover={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
        transition={{ duration: 0.2 }}
      >
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={() => {}}
          className="w-11 h-11 rounded-full flex items-center justify-center text-gray-600 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-all shadow-sm hover:shadow"
          title="Search in document"
        >
          <Search className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// Example usage in a component
export function FloatingActionButtonsExample() {
  const [isVisible, setIsVisible] = React.useState(true);
  
  return (
    <div className="p-10">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {isVisible ? "Hide" : "Show"} Floating Buttons
      </button>
      
      <AnimatePresence>
        {isVisible && (
          <FloatingActionButtons 
            isVisible={isVisible}
            onAnnotate={() => console.log("Annotate")}
            onHighlight={() => console.log("Highlight")}
            onComment={() => console.log("Comment")}
            onAIAssist={() => console.log("AI Assist")}
            onShowPanel={() => console.log("Show Panel")}
          />
        )}
      </AnimatePresence>
    </div>
  );
} 