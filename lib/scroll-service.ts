import { Annotation } from "@/components/pdf_viewer/AnnotationOverlay";

export interface ScrollPosition {
  pageNumber: number;
  elementId?: string;
  annotationId?: string;
  yOffset?: number;
}

export interface ScrollToAnnotationOptions {
  highlight?: boolean;
  smooth?: boolean;
  focus?: boolean;
}

// Create a class that will manage scrolling between the PDF and annotation panels
export class ScrollService {
  private static instance: ScrollService;
  private listeners: Map<string, (position: ScrollPosition) => void>;
  
  private constructor() {
    this.listeners = new Map();
  }
  
  /**
   * Get the singleton instance of the ScrollService
   */
  public static getInstance(): ScrollService {
    if (!ScrollService.instance) {
      ScrollService.instance = new ScrollService();
    }
    return ScrollService.instance;
  }
  
  /**
   * Register a listener for scroll events
   * @param id Unique identifier for the listener
   * @param callback Function to call when a scroll event occurs
   */
  public addListener(id: string, callback: (position: ScrollPosition) => void): void {
    this.listeners.set(id, callback);
  }
  
  /**
   * Remove a listener
   * @param id Identifier of the listener to remove
   */
  public removeListener(id: string): void {
    this.listeners.delete(id);
  }
  
  /**
   * Scroll to a specific page in the PDF
   * @param pageNumber Page number to scroll to
   * @param options Additional scroll options
   */
  public scrollToPage(pageNumber: number, options: { smooth?: boolean } = {}): void {
    const position: ScrollPosition = { 
      pageNumber,
    };
    
    this.notifyListeners(position);
  }
  
  /**
   * Scroll to a specific annotation in the PDF
   * @param annotation The annotation to scroll to
   * @param options Additional options
   */
  public scrollToAnnotation(annotation: Annotation, options: ScrollToAnnotationOptions = {}): void {
    const position: ScrollPosition = {
      pageNumber: annotation.pageNumber,
      annotationId: annotation.id,
    };
    
    this.notifyListeners(position);
  }
  
  /**
   * Notify all listeners of a scroll event
   * @param position The new scroll position
   */
  private notifyListeners(position: ScrollPosition): void {
    this.listeners.forEach(callback => {
      try {
        callback(position);
      } catch (error) {
        console.error('Error in scroll listener:', error);
      }
    });
  }
  
  /**
   * Scroll an element with the given ID into view
   * @param elementId ID of the element to scroll into view
   * @param options Scroll options
   */
  public scrollElementIntoView(elementId: string, options: { smooth?: boolean, focus?: boolean } = {}): void {
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`Element with ID ${elementId} not found`);
      return;
    }
    
    element.scrollIntoView({
      behavior: options.smooth ? 'smooth' : 'auto',
      block: 'nearest'
    });
    
    if (options.focus) {
      setTimeout(() => {
        element.focus();
        // Add a temporary highlight effect
        element.classList.add('scroll-highlight');
        setTimeout(() => {
          element.classList.remove('scroll-highlight');
        }, 2000);
      }, options.smooth ? 500 : 0);
    }
  }
  
  /**
   * Get the current visible page in the PDF viewer
   * @param containerSelector Selector for the PDF container
   */
  public getCurrentVisiblePage(containerSelector: string): number | null {
    const container = document.querySelector(containerSelector);
    if (!container) return null;
    
    const pages = container.querySelectorAll('.react-pdf__Page');
    if (!pages.length) return null;
    
    const containerRect = container.getBoundingClientRect();
    const containerMiddleY = containerRect.top + containerRect.height / 2;
    
    let closestPage = null;
    let closestDistance = Infinity;
    
    pages.forEach((page: Element) => {
      const pageRect = page.getBoundingClientRect();
      const pageMiddleY = pageRect.top + pageRect.height / 2;
      const distance = Math.abs(pageMiddleY - containerMiddleY);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPage = page;
      }
    });
    
    if (closestPage) {
      const pageNumber = parseInt(closestPage.getAttribute('data-page-number') || '1', 10);
      return pageNumber;
    }
    
    return 1; // Default to first page
  }
}

// Export a singleton instance
export default ScrollService.getInstance(); 