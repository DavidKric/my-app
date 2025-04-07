"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Reply, ThumbsUp, Flag } from "lucide-react";

interface AnnotationTooltipProps {
  annotation: {
    id: string;
    text: string;
    author: string;
    date: string;
    highlight?: string;
  };
  position?: {
    x: number;
    y: number;
  };
  placement?: "top" | "bottom";
  alignment?: "left" | "right" | "center";
  show: boolean;
  onClose: () => void;
  onReply?: (id: string) => void;
  className?: string;
}

export function AnnotationTooltip({
  annotation,
  position,
  placement = "bottom",
  alignment = "left",
  show,
  onClose,
  onReply,
  className,
}: AnnotationTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // Handle animation states
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 50); // Small delay before showing for better UX
      return () => clearTimeout(timer);
    } else if (isVisible) {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsExiting(false);
      }, 200); // Duration matching the exit animation
      return () => clearTimeout(timer);
    }
  }, [show, isVisible]);
  
  // Handle clicks outside the tooltip
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible, onClose]);

  // Calculate tooltip position class
  const getPositionClass = () => {
    let posClass = "";
    if (placement === "top") posClass += " tooltip-top";
    if (alignment === "right") posClass += " tooltip-right";
    return posClass;
  };

  // If not visible, don't render
  if (!show && !isVisible) return null;

  return (
    <div
      ref={tooltipRef}
      className={cn(
        "annotation-tooltip",
        isExiting && "annotation-tooltip-exit",
        getPositionClass(),
        className
      )}
      style={{
        top: position?.y,
        left: position?.x,
        opacity: isVisible ? 1 : 0,
      }}
    >
      <div className="annotation-tooltip-header">
        <span className="annotation-tooltip-author">{annotation.author}</span>
        <span className="annotation-tooltip-date">{annotation.date}</span>
      </div>
      
      {annotation.highlight && (
        <div className="mb-2 text-xs text-gray-500 dark:text-gray-400 italic bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded border-l-2 border-yellow-300 dark:border-yellow-700">
          "{annotation.highlight}"
        </div>
      )}
      
      <div className="annotation-tooltip-content">
        {annotation.text}
      </div>
      
      <div className="annotation-tooltip-actions">
        <button 
          className="annotation-tooltip-action"
          onClick={() => onReply && onReply(annotation.id)}
        >
          <Reply className="w-3 h-3 mr-1 inline-block" />
          Reply
        </button>
        <button className="annotation-tooltip-action">
          <ThumbsUp className="w-3 h-3 mr-1 inline-block" />
          Like
        </button>
        <button className="annotation-tooltip-action">
          <Flag className="w-3 h-3 mr-1 inline-block" />
          Report
        </button>
      </div>
    </div>
  );
}

// Example usage
export function AnnotationTooltipExample() {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const sampleAnnotation = {
    id: "anno-123",
    text: "This paragraph contains an important reference to the legal framework we need to consider in our analysis.",
    author: "John Smith",
    date: "Today, 3:45 PM",
    highlight: "...contains an important reference to the legal framework..."
  };
  
  return (
    <div className="p-10">
      <button 
        onClick={() => setShowTooltip(!showTooltip)}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {showTooltip ? "Hide" : "Show"} Tooltip
      </button>
      
      <AnnotationTooltip
        annotation={sampleAnnotation}
        position={{ x: 100, y: 150 }}
        show={showTooltip}
        onClose={() => setShowTooltip(false)}
        onReply={(id) => console.log(`Replying to annotation ${id}`)}
      />
    </div>
  );
} 