"use client";

import { cn } from "@/lib/utils";

interface ThinkingAnimationProps {
  className?: string;
  text?: string;
}

export function ThinkingAnimation({ 
  className,
  text = "AI is thinking..." 
}: ThinkingAnimationProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="inline-flex animate-text-shimmer bg-clip-text text-transparent bg-[linear-gradient(110deg,#9E9E9E,45%,#464646,55%,#9E9E9E)] dark:bg-[linear-gradient(110deg,#999,45%,#d9d9d9,55%,#999)] bg-[length:250%_100%]">
        {text}
      </div>
      <div className="flex items-center gap-1">
        <div className="animate-bounce h-1.5 w-1.5 bg-gray-400 rounded-full"></div>
        <div className="animate-bounce h-1.5 w-1.5 bg-gray-400 rounded-full" style={{ animationDelay: '0.2s' }}></div>
        <div className="animate-bounce h-1.5 w-1.5 bg-gray-400 rounded-full" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
}

export function TextShimmer({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex animate-text-shimmer bg-clip-text text-transparent",
        "bg-[linear-gradient(110deg,#9E9E9E,45%,#464646,55%,#9E9E9E)] dark:bg-[linear-gradient(110deg,#999,45%,#d9d9d9,55%,#999)] bg-[length:250%_100%]",
        className
      )}
      aria-hidden
    >
      {text}
    </span>
  );
}

export function GlassBubble({ 
  children,
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div 
      className={cn(
        "backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800",
        "rounded-xl shadow-sm p-4",
        className
      )}
    >
      {children}
    </div>
  );
} 