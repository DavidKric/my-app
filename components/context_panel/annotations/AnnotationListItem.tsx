import React from 'react';
import { useAnnotations } from '@/components/context_panel/annotations/AnnotationProvider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import AnnotationActionsMenu from '@/components/context_panel/annotations/AnnotationActionsMenu';
import { Annotation } from '@/components/pdf_viewer/AnnotationOverlay';
import { UserCircle2, Bot, MessageSquare, Calendar } from 'lucide-react';

// Define category colors for visual distinction
const CATEGORY_COLORS: Record<string, string> = {
  "Clause": "bg-blue-100 border-blue-200 text-blue-800 hover:bg-blue-200",
  "Risk": "bg-red-100 border-red-200 text-red-800 hover:bg-red-200",
  "Definition": "bg-green-100 border-green-200 text-green-800 hover:bg-green-200",
  "Reference": "bg-purple-100 border-purple-200 text-purple-800 hover:bg-purple-200",
  "Other": "bg-gray-100 border-gray-200 text-gray-800 hover:bg-gray-200",
  // Default fallback
  "default": "bg-gray-100 border-gray-200 text-gray-800 hover:bg-gray-200"
};

interface AnnotationListItemProps {
  annotation: Annotation;
  bulkMode: boolean;
  selected: boolean;
  onToggleSelect: () => void;
}

export default function AnnotationListItem(props: AnnotationListItemProps) {
  const { annotation, bulkMode, selected, onToggleSelect } = props;
  const { dispatch } = useAnnotations();

  const handleClick = () => {
    // scroll PDF viewer to this annotation
    scrollToAnnotation(annotation);
  };

  // Example placeholder scroll function
  const scrollToAnnotation = (ann: Annotation) => {
    // If using react-pdf-highlighter or a custom approach
    console.log('Scrolling to annotation', ann);
  };

  // Format the timestamp
  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return 'Unknown date';
    
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + 
           ' at ' + 
           date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  // Get appropriate color for the category
  const getCategoryColor = (category: string) => {
    return CATEGORY_COLORS[category] || CATEGORY_COLORS.default;
  };

  // Use the content property if textSnippet is not available
  const displayText = annotation.textSnippet || annotation.content || '';

  return (
    <div
      className={`group flex items-start gap-3 p-3 mb-1 rounded-md border border-transparent transition-all ${
        selected ? 'bg-primary/10 border-primary/40' : 'hover:bg-accent/50 hover:border-border'
      }`}
      onClick={() => !bulkMode && handleClick()}
    >
      {bulkMode && (
        <div className="pt-1">
          <Checkbox 
            checked={selected} 
            onCheckedChange={onToggleSelect}
            className={selected ? 'border-primary' : ''}
          />
        </div>
      )}

      <div className="flex-1 min-w-0">
        {/* Top row with category and actions */}
        <div className="flex items-center justify-between mb-1.5">
          {/* Category */}
          <Badge 
            variant="outline" 
            className={`px-2 py-0.5 text-xs font-medium ${getCategoryColor(annotation.category)}`}
          >
            {annotation.category}
          </Badge>

          {/* Actions menu */}
          {!bulkMode && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <AnnotationActionsMenu annotation={annotation} />
            </div>
          )}
        </div>

        {/* Text snippet - main content */}
        <div className="text-sm font-medium leading-5 mb-2">
          {displayText.length > 120 
            ? `${displayText.substring(0, 120)}...` 
            : displayText}
        </div>

        {/* Comment if present */}
        {annotation.comment && (
          <div className="flex items-start gap-1.5 mb-2 pl-1 border-l-2 border-muted">
            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              {annotation.comment}
            </p>
          </div>
        )}

        {/* Meta information row */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {/* Creator */}
          <div className="flex items-center gap-1">
            {annotation.creator === 'USER' 
              ? <UserCircle2 className="h-3 w-3" /> 
              : <Bot className="h-3 w-3" />}
            <span>{annotation.creator}</span>
          </div>

          <span className="text-muted-foreground/40">•</span>

          {/* Page number */}
          <span>Page {annotation.pageNumber}</span>

          <span className="text-muted-foreground/40">•</span>

          {/* Timestamp */}
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(annotation.timestamp)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
