'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component to catch and handle errors in PDF rendering
 * This prevents errors from crashing the entire application
 */
class PDFErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // For AbortException errors, we don't want to show the fallback UI
    if (error.name === 'AbortException' || 
        (error.message && error.message.includes('TextLayer task cancelled'))) {
      return { 
        hasError: false, 
        error: null 
      };
    }
    
    // For other errors, update state to trigger fallback UI
    return { 
      hasError: true, 
      error 
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Ignore AbortException errors
    if (error.name === 'AbortException' || 
        (error.message && error.message.includes('TextLayer task cancelled'))) {
      return;
    }
    
    // Log other errors and call onError callback if provided
    console.error('PDF rendering error:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Render fallback UI if provided, otherwise a default error message
      return this.props.fallback || (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md">
          <h3 className="font-medium mb-2">Error rendering PDF content</h3>
          <p className="text-sm">Please try refreshing the page.</p>
          {this.state.error && (
            <p className="text-xs mt-2 font-mono">{this.state.error.toString()}</p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default PDFErrorBoundary; 