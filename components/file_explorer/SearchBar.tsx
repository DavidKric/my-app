'use client';

import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';

interface SearchBarProps {
  query: string;
  onChange: (query: string) => void;
}

export default function SearchBar({ query, onChange }: SearchBarProps) {
  const [localQuery, setLocalQuery] = useState(query);

  // Update local state when parent passes a new query (if needed)
  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  // Update onChange with a small debounce to avoid very frequent updates on each key stroke (optional)
  useEffect(() => {
    const timeout = setTimeout(() => onChange(localQuery), 300);
    return () => clearTimeout(timeout);
  }, [localQuery]);

  return (
    <div className="relative">
      <Input 
        type="text" 
        placeholder="Search files..." 
        value={localQuery} 
        onChange={e => setLocalQuery(e.target.value)} 
        className="pl-8"
      />
      {/* Search icon inside input */}
      <svg className="w-4 h-4 text-muted-foreground absolute left-2 top-2.5" /* ... SVG for search icon ... */ />
    </div>
  );
}
