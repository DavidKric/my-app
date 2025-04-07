type AnnotationCreator = 'USER' | 'AI';

interface Annotation {
  id: string;                // unique ID
  pageNumber: number;
  textSnippet: string;       // excerpt from PDF
  category: string;          // e.g. "Risk", "Clause", ...
  creator: AnnotationCreator;// user or AI
  timestamp: number;         // epoch or Date.now()
  comment?: string;          // optional user comment
  boundingRect?: {           // for bounding boxes if needed
    x: number; 
    y: number; 
    width: number; 
    height: number;
  };
}

interface AnnotationFilters {
    categories: string[];      // e.g. ["Risk", "Clause"], empty means "all"
    creator: AnnotationCreator | 'ALL'; 
    query: string;             // search text
    currentPageOnly: boolean;  // whether to show only current PDF page
  }
  
export type { Annotation, AnnotationFilters };