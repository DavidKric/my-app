"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AIThinking } from "./text-shimmer";

interface ResponseStreamProps {
  content: string;
  isComplete: boolean;
  isLoading: boolean;
  className?: string;
}

export function ResponseStream({
  content,
  isComplete,
  isLoading,
  className,
}: ResponseStreamProps) {
  const [displayedContent, setDisplayedContent] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  // Typewriter effect that gradually reveals the content
  useEffect(() => {
    setDisplayedContent("");
    setCurrentIndex(0);
  }, [content]);

  useEffect(() => {
    if (currentIndex < content.length) {
      const timer = setTimeout(() => {
        setDisplayedContent((prev) => prev + content[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 15); // Speed of typewriter effect

      return () => clearTimeout(timer);
    }
  }, [content, currentIndex]);

  // Convert markdown-like syntax to HTML
  const formatText = (text: string) => {
    return text
      .split("\n")
      .map((line, i) => <p key={i} className={i > 0 ? "mt-2" : ""}>{line}</p>);
  };

  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 shadow-sm",
        className
      )}
    >
      {formatText(displayedContent)}
      
      {isLoading && currentIndex >= content.length && (
        <div className="mt-2">
          <AIThinking />
        </div>
      )}

      {isComplete && currentIndex >= content.length && (
        <div className="mt-4 text-xs text-gray-500 flex items-center justify-end">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            Response complete
          </span>
        </div>
      )}
    </div>
  );
} 