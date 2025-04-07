"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
  value: number[];
  min: number;
  max: number;
  step?: number;
  onValueChange: (value: number[]) => void;
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ value, min, max, step = 1, onValueChange, className, disabled = false, 'aria-label': ariaLabel }, ref) => {
    const trackRef = React.useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    
    const currentValue = value[0] || min;
    const percentage = ((currentValue - min) / (max - min)) * 100;
    
    const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      
      const track = trackRef.current;
      if (!track) return;
      
      const rect = track.getBoundingClientRect();
      const position = e.clientX - rect.left;
      const percentage = position / rect.width;
      
      let newValue = min + percentage * (max - min);
      
      // Snap to step
      newValue = Math.round(newValue / step) * step;
      
      // Clamp to min/max
      newValue = Math.max(min, Math.min(max, newValue));
      
      onValueChange([newValue]);
    };
    
    const handleDragStart = () => {
      if (disabled) return;
      setIsDragging(true);
    };
    
    const handleDragEnd = () => {
      setIsDragging(false);
    };
    
    React.useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging || disabled) return;
        
        const track = trackRef.current;
        if (!track) return;
        
        const rect = track.getBoundingClientRect();
        const position = e.clientX - rect.left;
        const percentage = position / rect.width;
        
        let newValue = min + percentage * (max - min);
        
        // Snap to step
        newValue = Math.round(newValue / step) * step;
        
        // Clamp to min/max
        newValue = Math.max(min, Math.min(max, newValue));
        
        onValueChange([newValue]);
      };
      
      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleDragEnd);
      }
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }, [isDragging, min, max, step, onValueChange, disabled]);
    
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className,
          disabled && "opacity-50 cursor-not-allowed"
        )}
        aria-disabled={disabled}
      >
        <div
          ref={trackRef}
          className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary"
          onClick={handleTrackClick}
        >
          <div
            className="absolute h-full bg-primary"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div
          className={cn(
            "block h-5 w-5 rounded-full border-2 border-primary bg-background transition-colors absolute",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:pointer-events-none cursor-pointer"
          )}
          onMouseDown={handleDragStart}
          style={{ left: `calc(${percentage}% - 10px)` }}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={currentValue}
          tabIndex={disabled ? -1 : 0}
          aria-label={ariaLabel}
        />
      </div>
    );
  }
);

Slider.displayName = "Slider";

export { Slider } 