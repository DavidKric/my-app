'use client';

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Case } from '@/types/file_explorer/file-structure';

interface CaseSwitcherProps {
  cases: Case[];
  activeProjectId: string;
  onSelectProject: (projectId: string) => void;
}

export default function CaseSwitcher({ cases, activeProjectId, onSelectProject }: CaseSwitcherProps) {
  return (
    <Select value={activeProjectId} onValueChange={onSelectProject}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select Case" />
      </SelectTrigger>
      <SelectContent>
        {cases.map(cs => (
          <SelectItem key={cs.id} value={cs.id}>
            {cs.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
