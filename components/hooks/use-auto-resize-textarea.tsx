import { useCallback, useEffect, useRef } from "react";

interface UseAutoResizeTextareaOptions {
  minHeight?: number;
  maxHeight?: number;
}

export function useAutoResizeTextarea({
  minHeight = 64, // default min height
  maxHeight = 200, // default max height
}: UseAutoResizeTextareaOptions = {}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const adjustHeight = useCallback((reset = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to allow textarea to shrink when text is deleted
    textarea.style.height = reset ? "auto" : `${minHeight}px`;

    // Calculate the new height, but constrain it to min/max values
    const scrollHeight = textarea.scrollHeight;
    const newHeight = Math.max(
      minHeight,
      Math.min(maxHeight, scrollHeight)
    );

    // Apply the new height
    textarea.style.height = `${newHeight}px`;

    // Enable/disable scrolling based on whether the content exceeds max height
    textarea.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
  }, [minHeight, maxHeight]);

  // Adjust height on initial render
  useEffect(() => {
    adjustHeight();
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
} 