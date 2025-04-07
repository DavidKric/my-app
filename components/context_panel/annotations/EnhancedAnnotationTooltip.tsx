"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Reply, ThumbsUp, Flag, Heart, Share } from "lucide-react";
import { useAnnotationEffects } from "@/components/pdf/SelectionEffects";

interface EnhancedAnnotationTooltipProps {
  annotation: {
    id: string;
    text: string;
    author: string;
    date: string;
    highlight?: string;
    likes?: number;
    category?: string;
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
  onLike?: (id: string) => void;
  className?: string;
}

export function EnhancedAnnotationTooltip({
  annotation,
  position,
  placement = "bottom",
  alignment = "left",
  show,
  onClose,
  onReply,
  onLike,
  className,
}: EnhancedAnnotationTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const likeButtonRef = useRef<HTMLButtonElement>(null);
  
  // Get the annotation effects hook
  const { handleAnnotationLiked } = useAnnotationEffects();
  
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

  const handleLike = () => {
    if (onLike) {
      onLike(annotation.id);
    }
    
    setIsLiked(true);
    
    // Show the radiating effect on the like button
    if (likeButtonRef.current) {
      handleAnnotationLiked(likeButtonRef.current);
    }
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
      
      <div className="flex items-center justify-between mt-3 border-t border-gray-100 dark:border-gray-800 pt-2">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Heart className="w-3 h-3" />
          <span>{annotation.likes || 0} likes</span>
        </div>
        
        <div className="annotation-tooltip-actions">
          <button 
            ref={likeButtonRef}
            className={cn(
              "annotation-tooltip-action",
              isLiked && "text-pink-500 dark:text-pink-400"
            )}
            onClick={handleLike}
          >
            <Heart className={cn("w-3 h-3 mr-1 inline-block", isLiked && "fill-current")} />
            {isLiked ? "Liked" : "Like"}
          </button>
          <button 
            className="annotation-tooltip-action"
            onClick={() => onReply && onReply(annotation.id)}
          >
            <Reply className="w-3 h-3 mr-1 inline-block" />
            Reply
          </button>
          <button className="annotation-tooltip-action">
            <Share className="w-3 h-3 mr-1 inline-block" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}

// Example usage
export function EnhancedAnnotationTooltipExample() {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const sampleAnnotation = {
    id: "anno-123",
    text: "This paragraph contains an important reference to the legal framework we need to consider in our analysis.",
    author: "John Smith",
    date: "Today, 3:45 PM",
    highlight: "...contains an important reference to the legal framework...",
    likes: 5
  };
  
  return (
    <div className="p-10">
      <button 
        onClick={() => setShowTooltip(!showTooltip)}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {showTooltip ? "Hide" : "Show"} Enhanced Tooltip
      </button>
      
      <EnhancedAnnotationTooltip
        annotation={sampleAnnotation}
        position={{ x: 100, y: 150 }}
        show={showTooltip}
        onClose={() => setShowTooltip(false)}
        onReply={(id) => console.log(`Replying to annotation ${id}`)}
        onLike={(id) => console.log(`Liking annotation ${id}`)}
      />
    </div>
  );
} 