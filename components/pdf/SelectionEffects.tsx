"use client";

import React, { useEffect } from 'react';
import { createGlowEffect, createRadiatingRingsEffect } from '@/lib/utils';

interface SelectionEffectsProps {
  containerRef: React.RefObject<HTMLDivElement>;
  onSelectionComplete?: (selection: Selection | null) => void;
}

/**
 * Component that adds glowing selection effects to the PDF viewer
 */
export function SelectionEffects({ containerRef, onSelectionComplete }: SelectionEffectsProps) {
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    let lastClickTime = 0;
    
    const handleMouseUp = (event: MouseEvent) => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();
      
      // If there's text selected, show the glow effect
      if (selectedText && selectedText.length > 0) {
        // Create the glow effect at the mouse position
        createGlowEffect(event, 'selection');
        
        // Call the callback if provided
        if (onSelectionComplete) {
          onSelectionComplete(selection);
        }
      }
    };
    
    const handleClick = (event: MouseEvent) => {
      // Double click check (for mobile support)
      const currentTime = new Date().getTime();
      const isDoubleClick = currentTime - lastClickTime < 300;
      lastClickTime = currentTime;
      
      // If double-click detected, show a different effect
      if (isDoubleClick) {
        createRadiatingRingsEffect(event);
      }
    };
    
    // Add event listeners
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('click', handleClick);
    
    // Clean up
    return () => {
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('click', handleClick);
    };
  }, [containerRef, onSelectionComplete]);
  
  // This component doesn't render anything
  return null;
}

/**
 * Hook for adding annotation reaction effects
 */
export function useAnnotationEffects() {
  const handleAnnotationCreated = (event: MouseEvent, type: 'highlight' | 'comment' | 'question' | 'important' = 'highlight') => {
    createGlowEffect(event, type);
  };
  
  const handleAnnotationLiked = (element: Element) => {
    createRadiatingRingsEffect(element);
  };
  
  return {
    handleAnnotationCreated,
    handleAnnotationLiked
  };
} 