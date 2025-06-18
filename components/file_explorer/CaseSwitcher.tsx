'use client';

import React from 'react';
import { useCaseContext } from '@/contexts/CaseContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

const CaseSwitcher: React.FC = () => {
  const { cases, selectedCase, selectCase } = useCaseContext();

  // Placeholder for case creation logic
  const handleCreateNewCase = () => {
    // This would eventually trigger a modal or a different UI flow
    console.log("Placeholder: Create New Case clicked");
    // Example: selectCase('new-case-id'); // if a new case is immediately created and selected
  };

  if (!cases || cases.length === 0) {
    return (
      <div className="p-2 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">No cases available.</p>
        <Button variant="outline" size="sm" className="w-full" onClick={handleCreateNewCase}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Case
        </Button>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-2 border-b border-border">
      <Select
        value={selectedCase?.id || ''}
        onValueChange={(value) => {
          if (value) { // Ensure a valid case ID is selected
            selectCase(value);
          }
        }}
      >
        <SelectTrigger className="w-full bg-background hover:bg-muted/80">
          <SelectValue placeholder="Select a case..." />
        </SelectTrigger>
        <SelectContent>
          {cases.map((caseItem) => (
            <SelectItem key={caseItem.id} value={caseItem.id}>
              {caseItem.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" size="sm" className="w-full text-xs" onClick={handleCreateNewCase}>
        <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
        New Case
      </Button>
    </div>
  );
};

export default CaseSwitcher;
