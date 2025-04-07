'use client';

import React, { useState } from 'react';
import { useAnnotations } from '@/components/context_panel/annotations/AnnotationProvider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Cog, Edit, CircleX, Plus, Check } from 'lucide-react';
import { USER_ANNOTATION_CATEGORIES } from './AnnotationFilterBar';

// Define a simple AnnotationType enum since we don't have AnnotationOverlay anymore
export enum AnnotationType {
  HIGHLIGHT = "highlight",
  NOTE = "note",
  DRAW = "draw",
  METHOD = "method",
  RESULT = "result",
  GOAL = "goal",
  KEY_INSIGHT = "key_insight",
  DEFINITION = "definition",
  REFERENCE = "reference"
}

// Define category types similar to Semantic Reader
export const CATEGORY_TYPES = [
  { id: 'method', label: 'Method', type: AnnotationType.METHOD, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'result', label: 'Result', type: AnnotationType.RESULT, color: 'bg-green-100 text-green-800 border-green-200' },
  { id: 'goal', label: 'Goal', type: AnnotationType.GOAL, color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'key_insight', label: 'Key Insight', type: AnnotationType.KEY_INSIGHT, color: 'bg-violet-100 text-violet-800 border-violet-200' },
  { id: 'definition', label: 'Definition', type: AnnotationType.DEFINITION, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'reference', label: 'Reference', type: AnnotationType.REFERENCE, color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
];

// Color options for customization
export const COLOR_OPTIONS = [
  { 
    id: 'blue', 
    highlight: 'bg-blue-200/60', 
    text: 'text-blue-800', 
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  { 
    id: 'green', 
    highlight: 'bg-green-200/60', 
    text: 'text-green-800', 
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-800 border-green-200'
  },
  { 
    id: 'amber', 
    highlight: 'bg-amber-200/60', 
    text: 'text-amber-800', 
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  { 
    id: 'violet', 
    highlight: 'bg-violet-200/60', 
    text: 'text-violet-800', 
    border: 'border-violet-200',
    badge: 'bg-violet-100 text-violet-800 border-violet-200'
  },
  { 
    id: 'emerald', 
    highlight: 'bg-emerald-200/60', 
    text: 'text-emerald-800', 
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  { 
    id: 'indigo', 
    highlight: 'bg-indigo-200/60', 
    text: 'text-indigo-800', 
    border: 'border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-200'
  },
  { 
    id: 'red', 
    highlight: 'bg-red-200/60', 
    text: 'text-red-800', 
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-800 border-red-200'
  },
  { 
    id: 'pink', 
    highlight: 'bg-pink-200/60', 
    text: 'text-pink-800', 
    border: 'border-pink-200', 
    badge: 'bg-pink-100 text-pink-800 border-pink-200'
  },
  { 
    id: 'yellow', 
    highlight: 'bg-yellow-200/60', 
    text: 'text-yellow-800', 
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
];

interface CategoryManagerProps {
  onGenerateSkimmingHighlights: () => void;
  hasAutoHighlights: boolean;
}

export default function CategoryManager({ onGenerateSkimmingHighlights, hasAutoHighlights }: CategoryManagerProps) {
  const { state, dispatch } = useAnnotations();
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    CATEGORY_TYPES.map(c => c.id)
  );
  const [highlightOpacity, setHighlightOpacity] = useState<number[]>([60]); // 0-100 scale
  const [showMarginFlags, setShowMarginFlags] = useState(true);
  const [highlightDensity, setHighlightDensity] = useState<string>("medium"); // few, medium, many
  const [editMode, setEditMode] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{id: string, label: string, color: string} | null>(null);
  
  // Custom settings for the skimming highlights
  const [categories, setCategories] = useState(CATEGORY_TYPES);
  
  const handleGenerateHighlights = () => {
    onGenerateSkimmingHighlights();
  };
  
  const handleToggleAutoHighlights = (checked: boolean) => {
    // In our new architecture, we don't have direct filter controls
    // We could add a setting to localStorage or similar
    console.log("Auto-highlights visibility toggled:", checked);
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });

    // We would update some global state here in a real implementation
    console.log("Category toggled:", categoryId);
  };

  const handleOpacityChange = (value: number[]) => {
    setHighlightOpacity(value);
    // In a real app, this would update the global state or settings
  };

  const handleMarginFlagsToggle = (checked: boolean) => {
    setShowMarginFlags(checked);
    // In a real app, this would update the global state or settings
  };

  const handleDensityChange = (value: string) => {
    setHighlightDensity(value);
    // In a real app, this would update the global state or settings
  };

  const startEditCategory = (category: {id: string, label: string, color: string}) => {
    setEditingCategory({...category});
    setEditMode(true);
  };

  const saveCategory = () => {
    if (!editingCategory) return;
    
    // In a real app, this would update a custom categories list in the database
    setCategories(prev => 
      prev.map(c => c.id === editingCategory.id ? 
        {...c, label: editingCategory.label, color: editingCategory.color} : c
      )
    );
    
    setEditMode(false);
    setEditingCategory(null);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditingCategory(null);
  };
  
  return (
    <div className="space-y-4 p-3">
      <div className="flex flex-col space-y-2">
        <h3 className="text-sm font-medium">Skimming Highlights</h3>
        <p className="text-xs text-muted-foreground">
          AI-generated highlighting to support skimming
        </p>
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2">
            <Switch 
              checked={true} 
              onCheckedChange={handleToggleAutoHighlights} 
            />
            <span className="text-sm">Enable Skimming</span>
          </div>
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleGenerateHighlights}
            disabled={hasAutoHighlights}
          >
            Generate
          </Button>
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Categories</h4>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Badge 
              key={category.id}
              variant="outline" 
              className={`${category.color} cursor-pointer ${
                selectedCategories.includes(category.id) 
                  ? 'opacity-100' 
                  : 'opacity-50'
              }`}
              onClick={() => handleCategoryToggle(category.id)}
            >
              {category.label}
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Show Margin Flags</h4>
          <Switch 
            checked={showMarginFlags}
            onCheckedChange={handleMarginFlagsToggle}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Label highlight types in the margin
        </p>
      </div>

      <Separator />

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Number of Highlights</h4>
        <p className="text-xs text-muted-foreground">
          Decreasing highlights may leave some details out.
        </p>
        <div className="flex mt-1 justify-between gap-2">
          <Button 
            variant={highlightDensity === "few" ? "default" : "outline"} 
            size="sm"
            className="flex-1"
            onClick={() => handleDensityChange("few")}
          >
            Few
          </Button>
          <Button 
            variant={highlightDensity === "medium" ? "default" : "outline"} 
            size="sm" 
            className="flex-1"
            onClick={() => handleDensityChange("medium")}
          >
            Medium
          </Button>
          <Button 
            variant={highlightDensity === "many" ? "default" : "outline"} 
            size="sm" 
            className="flex-1"
            onClick={() => handleDensityChange("many")}
          >
            Many
          </Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Highlight Opacity</h4>
        <div className="pt-2">
          <Slider 
            value={highlightOpacity} 
            min={0} 
            max={100} 
            step={10}
            onValueChange={handleOpacityChange} 
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Light</span>
          <span>Medium</span>
          <span>Dark</span>
        </div>
      </div>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full text-xs flex items-center gap-1">
            <Cog className="h-3 w-3" />
            <span>Advanced Settings</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Skimming Highlight Settings</AlertDialogTitle>
            <AlertDialogDescription>
              Customize categories, colors, and appearance of highlights.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {!editMode ? (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Customize Categories</h4>
                {categories.map(category => (
                  <div key={category.id} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => handleCategoryToggle(category.id)}
                      />
                      <Badge variant="outline" className={category.color}>
                        {category.label}
                      </Badge>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => startEditCategory(category)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Examples</h4>
                <div className="space-y-1">
                  <div className="flex gap-2 items-center">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                      Methods
                    </Badge>
                    <span className="text-xs">Paper methods appear in blue</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      Results
                    </Badge>
                    <span className="text-xs">Paper results appear in green</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                      Goals
                    </Badge>
                    <span className="text-xs">Paper objectives appear in amber</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Edit mode for category
            <div className="space-y-4 py-2">
              {editingCategory && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category Name</label>
                    <Input 
                      value={editingCategory.label} 
                      onChange={(e) => setEditingCategory({...editingCategory, label: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category Color</label>
                    <div className="grid grid-cols-3 gap-2">
                      {COLOR_OPTIONS.map(color => (
                        <div 
                          key={color.id}
                          className={`p-2 rounded-md cursor-pointer border-2 ${
                            editingCategory.color.includes(color.id) ? 'border-primary' : 'border-transparent'
                          }`}
                          onClick={() => setEditingCategory({...editingCategory, color: color.badge})}
                        >
                          <div className={`h-8 rounded ${color.badge}`}></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={cancelEdit}
                    >
                      <CircleX className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={saveCategory}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            {!editMode && <AlertDialogAction>Apply</AlertDialogAction>}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 