import React from 'react';
import { useAnnotations } from '@/components/context_panel/annotations/AnnotationProvider';
import AnnotatePanel from '@/components/context_panel/annotations/AnnotatePanel';
import { Annotation } from '@/components/pdf_viewer/annotations/AnnotationOverlay';

export default function AnnotationsTab() {
  const { dispatch, state } = useAnnotations();
  
  // Handle jumping to annotation in the PDF
  const handleJumpToAnnotation = (annotation: Annotation) => {
    // Set as selected annotation
    dispatch({ type: 'SELECT_ANNOTATION', id: annotation.id });
    
    // Change to the page where the annotation exists
    dispatch({ type: 'SET_CURRENT_PAGE', page: annotation.pageNumber });
  };
  
  // Handle generating auto annotations
  const handleGenerateAnnotations = () => {
    console.log('Generating annotations...');
    // This would typically connect to an API
    // For now, we'll use the AnnotatePanel's built-in mock behavior
  };
  
  // Check if we have any auto-generated annotations
  const hasAutoAnnotations = state.annotations.some(a => a.isAutoGenerated);
  
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <AnnotatePanel 
        onJumpToAnnotation={handleJumpToAnnotation}
        onGenerateAnnotations={handleGenerateAnnotations}
        hasAutoAnnotations={hasAutoAnnotations}
      />
    </div>
  );
}
