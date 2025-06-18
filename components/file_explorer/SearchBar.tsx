'use client';

import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';

interface SearchBarProps {
  query: string;
  onChange: (query: string) => void;
  /**
   * Called when the user submits the search form (e.g. presses Enter).
   */
  onSearch?: (query: string) => void;
}

export default function SearchBar({ query, onChange, onSearch }: SearchBarProps) {
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
        onKeyDown={e => {
          if (e.key === 'Enter' && onSearch) {
            onSearch(localQuery);
          }
        }}
        className="pl-8"
        dir="auto" // Added for RTL support
      />
      {/* Search icon inside input */}
      {onSearch && (
        <button
          type="button"
          className="absolute left-1 top-1.5 p-1 text-muted-foreground"
          onClick={() => onSearch(localQuery)}
          aria-label="Search"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.5 3.5a7.5 7.5 0 0013.15 13.15z"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
