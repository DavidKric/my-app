'use client';

import React, { createContext, useContext, useReducer, useMemo, useEffect } from 'react';
import { Annotation } from './ProfessionalAnnotationSidebar';

// State and action types
interface AnnotationState {
  annotations: Annotation[];
  currentPage: number;
  selectedAnnotationId: string | null;
}

type AnnotationAction =
  | { type: 'ADD_ANNOTATION'; annotation: Annotation }
  | { type: 'UPDATE_ANNOTATION'; id: string; data: Partial<Annotation> }
  | { type: 'DELETE_ANNOTATION'; id: string }
  | { type: 'SET_ANNOTATIONS'; annotations: Annotation[] }
  | { type: 'SELECT_ANNOTATION'; id: string | null }
  | { type: 'SET_CURRENT_PAGE'; page: number }
  | { type: 'ADD_COMMENT'; annotationId: string; comment: any }
  | { type: 'UPDATE_COMMENT'; annotationId: string; commentId: string; text: string }
  | { type: 'DELETE_COMMENT'; annotationId: string; commentId: string };

interface AnnotationsContextType {
  state: AnnotationState;
  dispatch: React.Dispatch<AnnotationAction>;
  addAnnotation: (annotation: Annotation) => Promise<void>;
  updateAnnotation: (id: string, data: Partial<Annotation>) => Promise<void>;
  deleteAnnotation: (id: string) => Promise<void>;
}

// Create context
const AnnotationsContext = createContext<AnnotationsContextType | null>(null);

// Reducer function
const annotationsReducer = (state: AnnotationState, action: AnnotationAction): AnnotationState => {
  switch (action.type) {
    case 'ADD_ANNOTATION':
      return {
        ...state,
        annotations: [...state.annotations, action.annotation]
      };
    
    case 'UPDATE_ANNOTATION':
      return {
        ...state,
        annotations: state.annotations.map(annotation =>
          annotation.id === action.id
            ? { ...annotation, ...action.data }
            : annotation
        )
      };
    
    case 'DELETE_ANNOTATION':
      return {
        ...state,
        annotations: state.annotations.filter(annotation => annotation.id !== action.id)
      };

    case 'SET_ANNOTATIONS':
      return {
        ...state,
        annotations: action.annotations
      };
    
    case 'SELECT_ANNOTATION':
      return {
        ...state,
        selectedAnnotationId: action.id
      };
    
    case 'SET_CURRENT_PAGE':
      return {
        ...state,
        currentPage: action.page
      };
    
    case 'ADD_COMMENT':
      return {
        ...state,
        annotations: state.annotations.map(annotation => {
          if (annotation.id === action.annotationId) {
            return {
              ...annotation,
              comments: [...annotation.comments, action.comment]
            };
          }
          return annotation;
        })
      };
    
    case 'UPDATE_COMMENT':
      return {
        ...state,
        annotations: state.annotations.map(annotation => {
          if (annotation.id === action.annotationId) {
            return {
              ...annotation,
              comments: annotation.comments.map(comment => 
                comment.id === action.commentId
                  ? { ...comment, text: action.text }
                  : comment
              )
            };
          }
          return annotation;
        })
      };
    
    case 'DELETE_COMMENT':
      return {
        ...state,
        annotations: state.annotations.map(annotation => {
          if (annotation.id === action.annotationId) {
            return {
              ...annotation,
              comments: annotation.comments.filter(comment => comment.id !== action.commentId)
            };
          }
          return annotation;
        })
      };
    
    default:
      return state;
  }
};

// Provider component
interface AnnotationProviderProps {
  children: React.ReactNode;
  documentId?: string;
}

export function AnnotationProvider({ children, documentId }: AnnotationProviderProps) {
  const [state, dispatch] = useReducer(annotationsReducer, {
    annotations: [],
    currentPage: 1,
    selectedAnnotationId: null
  });

  useEffect(() => {
    const query = documentId ? `?documentId=${encodeURIComponent(documentId)}` : '';
    fetch(`/api/annotations${query}`)
      .then(res => res.json())
      .then(data => dispatch({ type: 'SET_ANNOTATIONS', annotations: data }))
      .catch(() => {});
  }, [documentId]);

  const addAnnotation = async (annotation: Annotation) => {
    const res = await fetch('/api/annotations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(annotation)
    });
    const saved = await res.json();
    dispatch({ type: 'ADD_ANNOTATION', annotation: saved });
  };

  const updateAnnotation = async (id: string, data: Partial<Annotation>) => {
    const res = await fetch(`/api/annotations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const updated = await res.json();
    dispatch({ type: 'UPDATE_ANNOTATION', id, data: updated });
  };

  const deleteAnnotation = async (id: string) => {
    await fetch(`/api/annotations/${id}`, { method: 'DELETE' });
    dispatch({ type: 'DELETE_ANNOTATION', id });
  };

  const contextValue = useMemo(
    () => ({ state, dispatch, addAnnotation, updateAnnotation, deleteAnnotation }),
    [state]
  );

  return (
    <AnnotationsContext.Provider value={contextValue}>
      {children}
    </AnnotationsContext.Provider>
  );
}

// Custom hook to use the context
export function useAnnotations() {
  const context = useContext(AnnotationsContext);
  if (!context) {
    throw new Error('useAnnotations must be used within an AnnotationProvider');
  }
  return context;
}

// Utility function to create a unique annotation ID
export function createAnnotationId() {
  return `annotation-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
