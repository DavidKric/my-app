import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * A utility function for constructing class names with Tailwind CSS
 * Combines clsx and twMerge for optimal class name handling
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date to a human-readable string
 */
export function formatDate(date: Date | string): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

/**
 * Truncates a string to a specified length and adds an ellipsis
 */
export function truncateString(str: string, length: number): string {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
}

/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified wait time has elapsed since the last invocation
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function(...args: Parameters<T>): void {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttles a function to only execute once within the specified time period
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  return function(...args: Parameters<T>): void {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Generates a random string ID of specified length
 */
export function generateId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Deep clones an object or array
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }
  
  const result = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = deepClone(obj[key]);
    }
  }
  
  return result;
}

/**
 * Creates a glowing effect at the cursor position or center of an element
 * @param event Mouse event or element to center the glow on
 * @param type Type of effect: 'selection', 'highlight', 'comment', 'question', 'important'
 */
export function createGlowEffect(
  event: MouseEvent | Element, 
  type: 'selection' | 'highlight' | 'comment' | 'question' | 'important' = 'selection'
) {
  // Create the effect element
  const effect = document.createElement('div');
  
  // Position the effect
  if (event instanceof MouseEvent) {
    effect.style.position = 'fixed';
    effect.style.left = `${event.clientX}px`;
    effect.style.top = `${event.clientY}px`;
  } else {
    // Center on the element
    effect.style.position = 'absolute';
    effect.style.left = '50%';
    effect.style.top = '50%';
    effect.style.transform = 'translate(-50%, -50%)';
  }
  
  // Set the effect class based on type
  if (type === 'selection') {
    effect.className = 'text-selection-glow';
  } else {
    effect.className = `annotation-reaction annotation-reaction-${type}`;
  }
  
  // Add to document
  document.body.appendChild(effect);
  
  // Remove after animation completes
  setTimeout(() => {
    effect.remove();
  }, 1000);
}

/**
 * Creates a radiating rings effect at the cursor position
 * @param event Mouse event or element to center the rings on
 */
export function createRadiatingRingsEffect(event: MouseEvent | Element) {
  // Create the effect element
  const effect = document.createElement('div');
  
  // Position the effect
  if (event instanceof MouseEvent) {
    effect.style.position = 'fixed';
    effect.style.left = `${event.clientX}px`;
    effect.style.top = `${event.clientY}px`;
  } else {
    // Center on the element
    effect.style.position = 'absolute';
    effect.style.left = '50%';
    effect.style.top = '50%';
    effect.style.transform = 'translate(-50%, -50%)';
  }
  
  // Set the effect class
  effect.className = 'radiating-rings';
  
  // Add to document
  document.body.appendChild(effect);
  
  // Remove after animation completes
  setTimeout(() => {
    effect.remove();
  }, 1500);
}
