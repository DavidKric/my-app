'use client';

import React, { useState } from 'react';
import { useAnnotations } from './AnnotationProvider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

// Define annotation category types for user annotations
export const USER_ANNOTATION_CATEGORIES = [
  { id: 'Important', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { id: 'Question', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'Definition', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'Reference', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { id: 'Other', color: 'bg-gray-100 text-gray-800 border-gray-200' },
];

export default function AnnotationFilterBar() {
  const { state } = useAnnotations();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showCurrentPageOnly, setShowCurrentPageOnly] = useState(false);
  
  const handleToggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) 
        ? prev.filter(c => c !== cat) 
        : [...prev, cat]
    );
  };
  
  const handleQueryChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(evt.target.value);
  };
  
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setShowCurrentPageOnly(false);
  };
  
  const handleToggleCurrentPageOnly = (checked: boolean) => {
    setShowCurrentPageOnly(checked);
  };
  
  return (
    <div className="p-3 space-y-3 border-b bg-muted/30">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-8 text-sm"
          placeholder="Search annotations..."
          value={searchQuery}
          onChange={handleQueryChange}
        />
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium">Categories</p>
        <div className="flex flex-wrap gap-1">
          {USER_ANNOTATION_CATEGORIES.map(category => (
            <Badge
              key={category.id}
              variant="outline"
              className={`${category.color} cursor-pointer ${
                selectedCategories.includes(category.id) 
                  ? 'opacity-100' 
                  : 'opacity-50'
              }`}
              onClick={() => handleToggleCategory(category.id)}
            >
              {category.id}
            </Badge>
          ))}
        </div>
      </div>
      
      <Separator />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch 
            checked={showCurrentPageOnly}
            onCheckedChange={handleToggleCurrentPageOnly}
          />
          <span className="text-sm">Current page only</span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-xs"
        >
          <X className="h-3 w-3 mr-1" />
          Clear filters
        </Button>
      </div>
    </div>
  );
} 