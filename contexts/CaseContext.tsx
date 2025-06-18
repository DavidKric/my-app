'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Case } from '@/types/file_explorer/file-structure';

import { FolderNode, FileNode as FileNodeType } from '@/types/file_explorer/file-structure'; // Added FileNode for type clarity

interface CaseContextType {
  cases: Case[];
  selectedCase: Case | undefined;
  selectCase: (caseId: string) => void;
  addFilesToSelectedCase: (parentId: string, newFiles: FileNodeType[]) => void; // New function
  updateNodeName: (nodeId: string, newName: string) => void; // For rename
  deleteNodeInSelectedCase: (nodeId: string) => void; // For delete
  // TODO: Add functions for moveNode, createFolderInSelectedCase if needed directly in context
}

const CaseContext = createContext<CaseContextType | undefined>(undefined);

export const useCaseContext = () => {
  const context = useContext(CaseContext);
  if (!context) {
    throw new Error('useCaseContext must be used within a CaseProvider');
  }
  return context;
};

interface CaseProviderProps {
  children: ReactNode;
  initialCases: Case[];
}

export const CaseProvider: React.FC<CaseProviderProps> = ({ children, initialCases }) => {
  const [cases, setCases] = useState<Case[]>(initialCases);
  const [selectedCaseId, setSelectedCaseId] = useState<string | undefined>(
    initialCases.length > 0 ? initialCases[0].id : undefined
  );

  useEffect(() => {
    // If initialCases changes and the current selectedCaseId is no longer valid,
    // or if no case was selected and cases become available, select the first one.
    if (initialCases.length > 0) {
      const currentCaseExists = initialCases.some(c => c.id === selectedCaseId);
      if (!currentCaseExists || !selectedCaseId) {
        setSelectedCaseId(initialCases[0].id);
      }
    } else {
      setSelectedCaseId(undefined);
    }
    // Also update the internal cases state if initialCases prop changes.
    // This might happen if cases are fetched/updated dynamically at a higher level.
    setCases(initialCases);
  }, [initialCases, selectedCaseId]);

  const selectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
  };

  const selectedCase = cases.find(c => c.id === selectedCaseId);

  const addFilesToSelectedCase = (parentId: string, newFiles: FileNodeType[]) => {
    if (!selectedCase) return;

    const updatedRoot = { ...selectedCase.root }; // Shallow copy root

    // Recursive function to find the parent node and add files
    const findAndAdd = (node: FolderNode): FolderNode => {
      if (node.id === parentId) {
        return { ...node, children: [...node.children, ...newFiles] };
      }
      return {
        ...node,
        children: node.children.map(child =>
          child.type === 'folder' ? findAndAdd(child as FolderNode) : child
        ),
      };
    };

    const newRoot = findAndAdd(updatedRoot);

    const updatedCases = cases.map(c =>
      c.id === selectedCase.id ? { ...c, root: newRoot } : c
    );
    setCases(updatedCases);
    // FileTree will observe selectedCase.root changing and should persist via its own useEffect
  };

  const updateNodeName = (nodeId: string, newName: string) => {
    if (!selectedCase) return;
    const updateNameRecursive = (nodes: (FolderNode | FileNodeType)[]): (FolderNode | FileNodeType)[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, name: newName };
        }
        if (node.type === 'folder') {
          return { ...node, children: updateNameRecursive(node.children) };
        }
        return node;
      });
    };
    const newRoot = { ...selectedCase.root, children: updateNameRecursive(selectedCase.root.children) };
    const updatedCases = cases.map(c =>
      c.id === selectedCase.id ? { ...c, root: newRoot } : c
    );
    setCases(updatedCases);
  };

  const deleteNodeInSelectedCase = (nodeId: string) => {
    if (!selectedCase) return;
    const deleteRecursive = (nodes: (FolderNode | FileNodeType)[]): (FolderNode | FileNodeType)[] => {
      return nodes.filter(node => node.id !== nodeId).map(node => {
        if (node.type === 'folder') {
          return { ...node, children: deleteRecursive(node.children) };
        }
        return node;
      });
    };
    const newRoot = { ...selectedCase.root, children: deleteRecursive(selectedCase.root.children) };
     const updatedCases = cases.map(c =>
      c.id === selectedCase.id ? { ...c, root: newRoot } : c
    );
    setCases(updatedCases);
  };


  return (
    <CaseContext.Provider value={{ cases, selectedCase, selectCase, addFilesToSelectedCase, updateNodeName, deleteNodeInSelectedCase }}>
      {children}
    </CaseContext.Provider>
  );
};
