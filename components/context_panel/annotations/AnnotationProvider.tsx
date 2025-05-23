'use client';

import React, { createContext, useContext, useReducer, useMemo, useEffect } from 'react';
import { Annotation } from '@/components/pdf_viewer/annotations/AnnotationOverlay';
import { mockAnnotations } from './ProfessionalAnnotationSidebar';
import type { AnnotationFilters } from '@/types/integrated_ai/integrated_ai';

// State and action types
interface AnnotationState {
  annotations: Annotation[];
  currentPage: number;
  selectedAnnotationId: string | null;
  filters: AnnotationFilters;
}

type AnnotationAction =
  | { type: 'ADD_ANNOTATION'; annotation: Annotation }
  | { type: 'UPDATE_ANNOTATION'; id: string; data: Partial<Annotation> }
  | { type: 'DELETE_ANNOTATION'; id: string }
  | { type: 'SET_ANNOTATIONS'; annotations: Annotation[] }
  | { type: 'SELECT_ANNOTATION'; id: string | null }
  | { type: 'SET_CURRENT_PAGE'; page: number }
  | { type: 'SET_FILTERS'; filters: Partial<AnnotationFilters> }
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

    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.filters }
      };
    
    case 'ADD_COMMENT':
      return {
        ...state,
        annotations: state.annotations.map(annotation => {
          if (annotation.id === action.annotationId) {
            return {
              ...annotation
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
              ...annotation
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
              ...annotation
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
    selectedAnnotationId: null,
    filters: {
      categories: [],
      creator: 'ALL',
      query: '',
      currentPageOnly: false
    }
  });

  useEffect(() => {
    const query = documentId ? `?documentId=${encodeURIComponent(documentId)}` : '';
    fetch(`/api/annotations${query}`)
      .then(res => res.json())
      .then(data => {
        // Transform the data if needed and validate it
        const validAnnotations = Array.isArray(data)
          ? data
              .filter(ann => ann && typeof ann === 'object' && ann.id && ann.type)
          : [];
        dispatch({ type: 'SET_ANNOTATIONS', annotations: validAnnotations });
      })
      .catch((err) => {
        console.error('Error fetching annotations:', err);
        // Initialize with empty array on error
        dispatch({ type: 'SET_ANNOTATIONS', annotations: [] });
      });
  }, [documentId]);

  const addAnnotation = async (annotation: Annotation) => {
    const payload = { ...annotation };
    const res = await fetch('/api/annotations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const saved = await res.json();
    dispatch({ type: 'ADD_ANNOTATION', annotation: saved });
  };

  const updateAnnotation = async (id: string, data: Partial<Annotation>) => {
    const payload = { ...data };
    const res = await fetch(`/api/annotations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
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
