'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Highlighter, MessageSquarePlus } from 'lucide-react';

interface TextSelectionPopoverProps {
  position: { top: number; left: number; right?: number; bottom?: number }; // Position relative to the PDF page or viewer
  onHighlight: () => void;
  onAddNote: () => void;
  // screenHeight: For future use to ensure popover stays within screen bounds
}

const TextSelectionPopover: React.FC<TextSelectionPopoverProps> = ({
  position,
  onHighlight,
  onAddNote,
}) => {
  // Determine horizontal position: if 'right' is defined, position from right, else from left.
  const style: React.CSSProperties = {
    position: 'absolute',
    top: `${position.top}px`,
    // backgroundColor: 'white', // Tailwind used instead
    // border: '1px solid #ccc', // Tailwind used instead
    // padding: '4px', // Tailwind used instead
    // borderRadius: '4px', // Tailwind used instead
    // boxShadow: '0 2px 10px rgba(0,0,0,0.1)', // Tailwind used instead
    zIndex: 100, // Ensure it's above PDF pages but below modals
  };

  if (position.right !== undefined) {
    style.right = `${position.right}px`;
  } else {
    style.left = `${position.left}px`;
  }
  if (position.bottom !== undefined) {
    style.top = 'auto'; // override top if bottom is specified
    style.bottom = `${position.bottom}px`;
  }


  return (
    <div
      style={style}
      className="bg-background border border-border p-1 rounded-md shadow-lg flex space-x-1"
      onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling to PDF viewer if it deselects text
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={onHighlight}
        className="hover:bg-accent h-8 px-2"
        title="Highlight selection"
      >
        <Highlighter className="h-4 w-4 mr-1.5" /> Highlight
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onAddNote}
        className="hover:bg-accent h-8 px-2"
        title="Add note to selection"
      >
        <MessageSquarePlus className="h-4 w-4 mr-1.5" /> Note
      </Button>
    </div>
  );
};

export default TextSelectionPopover;
