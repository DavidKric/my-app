'use client';

import React from 'react';
import { AnnotationProvider } from './AnnotationProvider';
import { Case } from '@/types/file_explorer/file-structure';
import { LayoutClient } from '@/components/workspace/LayoutClient';

interface ClientAnnotationProviderProps {
  children: React.ReactNode;
  cases: Case[];
}

export function ClientAnnotationProvider({ children, cases }: ClientAnnotationProviderProps) {
  return (
    <AnnotationProvider>
      <LayoutClient cases={cases}>
        {children}
      </LayoutClient>
    </AnnotationProvider>
  );
} 