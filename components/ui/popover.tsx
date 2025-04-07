"use client"

import React, { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface PopoverProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type PopoverContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
};

const PopoverContext = React.createContext<PopoverContextType>({
  open: false,
  setOpen: () => {},
  triggerRef: { current: null },
});

export function Popover({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}: PopoverProps) {
  const [open, setOpen] = useState(defaultOpen);
  const triggerRef = useRef<HTMLElement | null>(null);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : open;

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Close if clicked outside of popover content or trigger
      if (!isControlled && isOpen) {
        const target = e.target as Node;
        const triggerEl = triggerRef.current;
        const popoverContent = document.querySelector("[data-popover-content]");

        // Check if click was inside the popover or its trigger
        const isInsideTrigger = triggerEl?.contains(target) || triggerEl === target;
        const isInsideContent = popoverContent?.contains(target);

        if (!isInsideTrigger && !isInsideContent) {
          setOpen(false);
          onOpenChange?.(false);
        }
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, [isControlled, isOpen, onOpenChange]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <PopoverContext.Provider value={{ open: isOpen, setOpen: handleOpenChange, triggerRef }}>
      {children}
    </PopoverContext.Provider>
  );
}

interface PopoverTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export const PopoverTrigger: React.FC<PopoverTriggerProps> = ({ 
  children,
  asChild = false,
}) => {
  const { open, setOpen, triggerRef } = React.useContext(PopoverContext);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(!open);
  };

  const childProps = {
    onClick: handleClick,
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node;
    },
    "aria-expanded": open,
    "aria-haspopup": true,
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, childProps);
  }

  return (
    <button type="button" {...childProps}>
      {children}
    </button>
  );
};

interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

export const PopoverContent: React.FC<PopoverContentProps> = ({ 
  children,
  className,
  align = "center",
  sideOffset = 4,
  ...props
}) => {
  const { open, triggerRef } = React.useContext(PopoverContext);
  const contentRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
  });

  useEffect(() => {
    if (open && triggerRef.current && contentRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();
      
      let left = 0;
      if (align === "start") {
        left = triggerRect.left;
      } else if (align === "center") {
        left = triggerRect.left + (triggerRect.width / 2) - (contentRect.width / 2);
      } else if (align === "end") {
        left = triggerRect.right - contentRect.width;
      }

      // Position the content below the trigger by default
      setPosition({
        top: triggerRect.bottom + sideOffset,
        left,
      });
    }
  }, [open, align, sideOffset]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      style={{
        position: "absolute",
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      data-popover-content
      {...props}
    >
      {children}
    </div>
  );
};

export function PopoverAnchor({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
