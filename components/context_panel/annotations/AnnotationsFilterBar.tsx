import React, { useState } from 'react';
import { useAnnotations } from '@/components/context_panel/annotations/AnnotationProvider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Search, Filter, X, CheckSquare, ChevronDown, ChevronUp } from 'lucide-react';

const ALL_CATEGORIES = ["Clause", "Risk", "Definition", "Reference", "Other"];

const CATEGORY_COLORS = {
  "Clause": "bg-blue-100 text-blue-800 border-blue-200",
  "Risk": "bg-red-100 text-red-800 border-red-200",
  "Definition": "bg-green-100 text-green-800 border-green-200",
  "Reference": "bg-purple-100 text-purple-800 border-purple-200",
  "Other": "bg-gray-100 text-gray-800 border-gray-200",
};

export default function AnnotationFilterBar() {
  const { state, dispatch } = useAnnotations();
  const { filters } = state;
  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleToggleCategory = (cat: string) => {
    let newCats = [...filters.categories];
    if (newCats.includes(cat)) {
      newCats = newCats.filter(c => c !== cat);
    } else {
      newCats.push(cat);
    }
    dispatch({ type: 'SET_FILTERS', filters: { categories: newCats } });
  };

  const handleChangeCreator = (creator: 'ALL' | 'USER' | 'AI') => {
    dispatch({ type: 'SET_FILTERS', filters: { creator } });
  };

  const handleQueryChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_FILTERS', filters: { query: evt.target.value } });
  };

  const clearFilters = () => {
    dispatch({ 
      type: 'SET_FILTERS', 
      filters: { 
        categories: [], 
        creator: 'ALL', 
        query: '',
        currentPageOnly: false 
      } 
    });
  };

  const hasActiveFilters = 
    filters.categories.length > 0 || 
    filters.creator !== 'ALL' || 
    filters.query !== '' ||
    filters.currentPageOnly;

  return (
    <div className="border-b border-border">
      {/* Search bar - always visible */}
      <div className="p-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            className="pl-9 pr-8 py-2 h-10 text-sm"
            placeholder="Search annotations..." 
            value={filters.query}
            onChange={handleQueryChange}
          />
          {filters.query && (
            <button
              onClick={() => dispatch({ type: 'SET_FILTERS', filters: { query: '' } })}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 h-10 px-3"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {filtersOpen ? 
              <ChevronUp className="h-3 w-3 ml-1" /> : 
              <ChevronDown className="h-3 w-3 ml-1" />
            }
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                {(filters.categories.length > 0 ? 1 : 0) + 
                 (filters.creator !== 'ALL' ? 1 : 0) + 
                 (filters.currentPageOnly ? 1 : 0)}
              </span>
            )}
          </Button>
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-9 px-2.5 ml-1"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear filters</span>
            </Button>
          )}
        </div>
      </div>

      {/* Expandable filter section */}
      {filtersOpen && (
        <div className="px-3 pb-3 space-y-3 animate-in slide-in-from-top-2">
          {/* Category Toggles */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1.5">Categories</div>
            <div className="flex flex-wrap gap-1.5">
              {ALL_CATEGORIES.map(cat => {
                const active = filters.categories.includes(cat);
                return (
                  <Toggle
                    key={cat}
                    pressed={active}
                    onPressedChange={() => handleToggleCategory(cat)}
                    className={`text-xs border px-2 py-1 h-7 ${active ? CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] : 'bg-background'}`}
                  >
                    {cat}
                  </Toggle>
                );
              })}
            </div>
          </div>

          {/* Creator Filter */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1.5">Created By</div>
            <div className="flex gap-1 items-center">
              <Button 
                variant={filters.creator === 'ALL' ? "default" : "outline"}
                size="sm"
                onClick={() => handleChangeCreator('ALL')}
                className="h-7 px-2.5"
              >
                All
              </Button>
              <Button 
                variant={filters.creator === 'USER' ? "default" : "outline"}
                size="sm"
                onClick={() => handleChangeCreator('USER')}
                className="h-7 px-2.5"
              >
                User
              </Button>
              <Button 
                variant={filters.creator === 'AI' ? "default" : "outline"}
                size="sm"
                onClick={() => handleChangeCreator('AI')}
                className="h-7 px-2.5"
              >
                AI
              </Button>
            </div>
          </div>

          {/* Current Page Toggle */}
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch({ 
                type: 'SET_FILTERS', 
                filters: { currentPageOnly: !filters.currentPageOnly }
              })}
              className={`h-7 px-2.5 ${filters.currentPageOnly ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
            >
              <CheckSquare className={`h-4 w-4 mr-2 ${filters.currentPageOnly ? '' : 'text-muted-foreground'}`} />
              <span>Current Page Only</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
