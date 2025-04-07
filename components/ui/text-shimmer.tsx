"use client";

import { cn } from "@/lib/utils";

interface TextShimmerProps {
  text: string;
  className?: string;
  gradientClassName?: string;
}

export function TextShimmer({
  text,
  className,
  gradientClassName,
}: TextShimmerProps) {
  return (
    <span
      className={cn(
        "inline-flex animate-text-shimmer bg-clip-text text-transparent",
        "bg-[linear-gradient(110deg,#9E9E9E,45%,#464646,55%,#9E9E9E)] dark:bg-[linear-gradient(110deg,#999,45%,#d9d9d9,55%,#999)] bg-[length:250%_100%]",
        gradientClassName,
        className
      )}
      aria-hidden
    >
      {text}
    </span>
  );
}

export function ThinkingDots({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        className
      )}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.3s]"></span>
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.15s]"></span>
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current animate-bounce"></span>
    </span>
  );
}

export function AIThinking({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-gray-500", className)}>
      <TextShimmer text="AI is thinking" />
      <ThinkingDots />
    </div>
  );
} 