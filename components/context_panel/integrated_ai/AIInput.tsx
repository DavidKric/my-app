"use client";

import { useState, useRef, useEffect } from "react";
import { CornerRightUp, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAutoResizeTextarea } from "@/components/hooks/use-auto-resize-textarea";
import { Textarea } from "@/components/ui/textarea";
import { GlassBubble, ThinkingAnimation } from "./ThinkingAnimation";
import { motion, AnimatePresence } from "framer-motion";

interface AIInputProps {
  onSubmit: (text: string) => void;
  isLoading?: boolean;
  onStopGeneration?: () => void;
  className?: string;
  placeholderText?: string;
  onVoiceInput?: () => void;
}

export function AIInput({
  onSubmit,
  isLoading = false,
  onStopGeneration,
  className,
  placeholderText = "Ask about the document or annotations...",
  onVoiceInput,
}: AIInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = () => {
    if (!inputValue.trim() || isLoading) return;
    onSubmit(inputValue);
    setInputValue("");
    adjustHeight(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    // Add animation class to container when focused
    if (containerRef.current) {
      if (isFocused) {
        containerRef.current.classList.add("input-focused");
      } else {
        containerRef.current.classList.remove("input-focused");
      }
    }
  }, [isFocused]);

  return (
    <div className={cn("w-full relative", className)} aria-busy={isLoading}>
      <div className="relative" ref={containerRef}>
        <motion.div
          initial={false}
          animate={isFocused ? { 
            boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.3), 0 0 12px 4px rgba(59, 130, 246, 0.1)" 
          } : { 
            boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.05)" 
          }}
          transition={{ duration: 0.2 }}
        >
          <GlassBubble className={cn(
            "p-0 overflow-hidden transition-all duration-300", 
            isFocused ? "bg-white/90 dark:bg-gray-900/90" : "bg-white/60 dark:bg-gray-900/60"
          )}>
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                adjustHeight();
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholderText}
              aria-label="Chat input"
              className="min-h-[60px] max-h-[200px] resize-none p-3 pr-16 text-sm border-none focus-visible:ring-0 bg-transparent backdrop-blur-sm"
              disabled={isLoading}
              onKeyDown={handleKeyDown}
            />
            
            <AnimatePresence>
              <motion.div 
                className="absolute right-2 bottom-2 flex gap-2"
                initial={{ y: 0, opacity: 1 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
              >
                {onVoiceInput && (
                  <motion.button
                    type="button"
                    onClick={onVoiceInput}
                    disabled={isLoading}
                    className={cn(
                      "p-2 rounded-full transition-colors",
                      isLoading 
                        ? "bg-gray-100 text-gray-400" 
                        : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                    )}
                    aria-label="Voice input"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Mic className="h-4 w-4" />
                  </motion.button>
                )}
                
                {isLoading ? (
                  <motion.button
                    type="button"
                    onClick={onStopGeneration}
                    className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    aria-label="Stop generation"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="10" height="10" rx="1" fill="currentColor" />
                    </svg>
                  </motion.button>
                ) : (
                  <motion.button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!inputValue.trim()}
                    className={cn(
                      "p-2 rounded-full transition-colors",
                      inputValue.trim()
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-100 text-gray-400"
                    )}
                    aria-label="Send message"
                    whileHover={inputValue.trim() ? { scale: 1.05 } : {}}
                    whileTap={inputValue.trim() ? { scale: 0.95 } : {}}
                  >
                    <CornerRightUp className="h-4 w-4" />
                  </motion.button>
                )}
              </motion.div>
            </AnimatePresence>
          </GlassBubble>
        </motion.div>
      </div>
      
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            className="absolute -top-8 left-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <ThinkingAnimation className="text-xs" />
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
        <motion.button 
          type="button"
          className="px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 whitespace-nowrap"
          onClick={() => onSubmit("Analyze the key contract clauses")}
          disabled={isLoading}
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
        >
          <div className="flex items-center gap-1.5">
            <span>Analyze contract</span>
          </div>
        </motion.button>
        <motion.button 
          type="button"
          className="px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 whitespace-nowrap"
          onClick={() => onSubmit("Summarize this document")}
          disabled={isLoading}
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
        >
          <div className="flex items-center gap-1.5">
            <span>Summarize</span>
          </div>
        </motion.button>
        <motion.button 
          type="button"
          className="px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 whitespace-nowrap"
          onClick={() => onSubmit("Find legal risks in this document")}
          disabled={isLoading}
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
        >
          <div className="flex items-center gap-1.5">
            <span>Find risks</span>
          </div>
        </motion.button>
      </div>
    </div>
  );
} 