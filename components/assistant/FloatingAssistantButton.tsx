'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Zap } from 'lucide-react'; // Using Zap as a placeholder for assistant icon
import { cn } from '@/lib/utils';

interface FloatingAssistantButtonProps {
  onClick: () => void;
  hasNewMessages?: boolean;
  className?: string;
}

const FloatingAssistantButton: React.FC<FloatingAssistantButtonProps> = ({
  onClick,
  hasNewMessages,
  className,
}) => {
  return (
    <Button
      onClick={onClick}
      variant="default" // Or "secondary" or a custom variant
      size="lg" // Larger for a FAB
      className={cn(
        "fixed bottom-6 right-6 rounded-full shadow-xl p-4 h-16 w-16 flex items-center justify-center z-50",
        "bg-primary hover:bg-primary/90 text-primary-foreground", // Example primary button styling
        // "bg-gradient-to-br from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white", // Alternative gradient
        hasNewMessages && "animate-pulse ring-4 ring-offset-2 ring-offset-background ring-accent", // Pulsing glow for new messages
        className
      )}
      aria-label={hasNewMessages ? "Open Assistant (New Messages)" : "Open Assistant"}
      title={hasNewMessages ? "Assistant (New Messages)" : "Assistant"}
    >
      <Zap className="h-7 w-7" />
      {hasNewMessages && (
        <span className="absolute top-0 right-0 block h-3 w-3 transform -translate-y-1/2 translate-x-1/2 rounded-full bg-red-500 ring-2 ring-white" />
      )}
    </Button>
  );
};

export default FloatingAssistantButton;
