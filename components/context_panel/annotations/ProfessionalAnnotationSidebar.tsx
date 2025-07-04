"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useAnnotations } from "./AnnotationProvider";
import { 
  BookText, 
  AlertTriangle, 
  FileText, 
  Link as LinkIcon, 
  Search, 
  Filter,
  LocateFixed, // For scroll to annotation
  X, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  MoreHorizontal,
  Clock,
  User,
  Calendar,
  Check,
  Flag,
  Highlighter,
  Pen,
  Brain,
  FlaskConical,
  Target,
  Goal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

// Types
export interface Annotation {
  id: string;
  type: "clause" | "risk" | "definition" | "reference" | "highlight" | "note" | "comment" | "draw" | "key_insight" | "method" | "result" | "goal" | string;
  text: string;
  excerpt: string;
  page: number;
  groupId?: string;
  createdAt: Date;
  author: {
    name: string;
    avatar?: string;
  };
  comments: Comment[];
  tags: string[];
  citation?: {
    source: string;
    page?: number;
    url?: string;
  };
  flagged?: boolean;
}

export interface Comment {
  id: string;
  text: string;
  author: {
    name: string;
    avatar?: string;
  };
  createdAt: Date;
}

interface AnnotationSidebarProps {
  annotations: Annotation[];
  currentPage?: number;
  onAnnotationClick?: (id: string) => void;
  className?: string;
}

import scrollService from '@/lib/scroll-service'; // Import scrollService

// Helper functions
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric'
  }).format(date);
};

// Color mapping for annotation types
const typeColors: Record<Annotation["type"], string> = {
  clause: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700",
  risk: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700",
  definition: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700",
  reference: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700",
  // Add other types if they have specific badges and need theme adjustments
  highlight: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700",
  note: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700",
  comment: "bg-gray-100 dark:bg-gray-700/30 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600",
  draw: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-300 dark:border-pink-700",
  key_insight: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-700",
  method: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700",
  result: "bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-300 border-lime-300 dark:border-lime-700",
  goal: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700",
  // Default for any other string types that might appear
  other: "bg-gray-100 dark:bg-gray-700/30 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600",
};

const typeIcons: Record<Annotation["type"], React.ReactNode> = {
  clause: <BookText className="h-4 w-4" />,
  risk: <AlertTriangle className="h-4 w-4" />,
  definition: <FileText className="h-4 w-4" />,
  reference: <LinkIcon className="h-4 w-4" />,
  highlight: <Highlighter className="h-4 w-4" />, // Assuming Highlighter icon exists
  note: <MessageSquare className="h-4 w-4" />,
  comment: <MessageSquare className="h-4 w-4" />, // Could be same as note or different
  draw: <Pen className="h-4 w-4" />, // Assuming Pen icon exists
  key_insight: <Brain className="h-4 w-4" />, // Assuming Brain icon
  method: <FlaskConical className="h-4 w-4" />, // Assuming FlaskConical
  result: <Target className="h-4 w-4" />, // Assuming Target
  goal: <Goal className="h-4 w-4" />, // Assuming Goal
  other: <FileText className="h-4 w-4" />, // Default icon
};

// Components
const AnnotationTypeBadge = ({ type }: { type: Annotation["type"] }) => {
  const colorClass = typeColors[type] || typeColors.other;
  const icon = typeIcons[type] || typeIcons.other;
  return (
    <Badge variant="outline" className={cn("flex items-center gap-1 font-normal py-0.5 px-1.5 text-xs", colorClass)}>
      {icon}
      <span className="capitalize">{type}</span>
    </Badge>
  );
};

const AnnotationCard = ({
  annotation,
  expanded = false,
  onClick
}: {
  annotation: Annotation;
  expanded?: boolean;
  onClick?: () => void;
}) => {
  const [isExpanded, setIsExpanded] = React.useState(expanded);
  const [showComments, setShowComments] = React.useState(false);
  const [newTag, setNewTag] = React.useState("");
  const { updateAnnotation } = useAnnotations();

  const handleAddTag = () => {
    if (newTag.trim() && annotation.tags && !annotation.tags.includes(newTag.trim())) {
      const updatedTags = [...annotation.tags, newTag.trim()];
      // @ts-expect-error: 'tags' may not be in Partial<Annotation> but is supported by backend
      updateAnnotation(annotation.id, { tags: updatedTags });
      setNewTag("");
    }
  };
  const handleRemoveTag = (tagToRemove: string) => {
    if (annotation.tags) {
      const updatedTags = annotation.tags.filter(tag => tag !== tagToRemove);
      // @ts-expect-error: 'tags' may not be in Partial<Annotation> but is supported by backend
      updateAnnotation(annotation.id, { tags: updatedTags });
    }
  };
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (onClick) onClick();
  };

  return (
    <Card className="mb-3 overflow-hidden">
      <div className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <AnnotationTypeBadge type={annotation.type} />
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="mr-1 h-3 w-3" />
              {formatDate(annotation.createdAt)}
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={toggleExpand}>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        <div className="mt-2">
          <p className="text-sm font-medium">{annotation.text}</p>

          {annotation.tags && annotation.tags.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {annotation.tags.map(tag => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
              {isExpanded && (
                <Input
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add tag"
                  className="h-6 w-20 px-1 py-0 text-xs"
                  dir="auto" // Added for RTL support
                />
              )}
            </div>
          )}
          
          {isExpanded && (
            <div className="mt-2">
              <div className="rounded-md bg-muted p-2 text-xs">
                <p className="italic">"{annotation.excerpt}"</p>
              </div>

              {annotation.citation && (
                <div className="mt-2 flex items-center text-xs text-muted-foreground">
                  <span className="font-medium">Citation: </span>
                  <span className="ml-1">{annotation.citation.source}</span>
                  {annotation.citation.page && <span>, p. {annotation.citation.page}</span>}
                  {annotation.citation.url && (
                    <a 
                      href={annotation.citation.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-1 text-blue-600 hover:underline"
                    >
                      <LinkIcon className="ml-1 inline h-3 w-3" />
                    </a>
                  )}
                </div>
              )}

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{annotation.author.name}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Page {annotation.page}</span>
                </div>
              </div>

              <Separator className="my-3" />

              <div className="flex items-center gap-2 mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={() => navigator.clipboard.writeText(`${location.href}#ann-${annotation.id}`)}
                >
                  <LinkIcon className="h-3 w-3" /> Share
                </Button>
                <Button
                  variant={annotation.flagged ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={() => updateAnnotation(annotation.id, { flagged: !annotation.flagged })}
                >
                  <Flag className="h-3 w-3" /> {annotation.flagged ? 'Flagged' : 'Flag'}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={() => setShowComments(!showComments)}
                >
                  <MessageSquare className="h-3 w-3" />
                  {annotation.comments.length} {annotation.comments.length === 1 ? 'Comment' : 'Comments'}
                </Button>
                <Button variant="ghost" size="sm" className="h-7 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              {showComments && (
                <div className="mt-2">
                  {annotation.comments.map((comment) => (
                    <div key={comment.id} className="mb-2 rounded-md border p-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{comment.author.name}</div>
                        <div className="text-muted-foreground">{formatTime(comment.createdAt)}</div>
                      </div>
                      <p className="mt-1">{comment.text}</p>
                    </div>
                  ))}
                  <div className="mt-2">
                    <Input 
                      placeholder="Add a comment..." 
                      className="h-8 text-xs"
                      dir="auto" // Added for RTL support
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export function AnnotationSidebar({
  annotations,
  currentPage,
  onAnnotationClick,
  className
}: AnnotationSidebarProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedTypes, setSelectedTypes] = React.useState<Annotation["type"][]>([]);
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [sortBy, setSortBy] = React.useState<"newest" | "oldest" | "type" | "page">("newest"); // Added "page"
  const [selectedGroup, setSelectedGroup] = React.useState<string>("all");
  const groups = React.useMemo(
    () => Array.from(new Set(annotations.map(a => a.groupId).filter(Boolean))),
    [annotations]
  );

  const allTags = React.useMemo(() => {
    const tags = new Set<string>();
    annotations.forEach(a => a.tags?.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [annotations]);

  // Filter annotations based on search, type, and current page
  const filteredAnnotations = React.useMemo(() => {
    return annotations.filter(annotation => {
      // Filter by search query
      const matchesSearch = searchQuery === "" ||
        annotation.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        annotation.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by selected types
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(annotation.type);
      const matchesTags =
        selectedTags.length === 0 ||
        (annotation.tags && annotation.tags.some(t => selectedTags.includes(t)));

      return matchesSearch && matchesType && matchesTags;
    });
  }, [annotations, searchQuery, selectedTypes, selectedTags]);

  // Get annotations for current page
  const currentPageAnnotations = React.useMemo(() => {
    return filteredAnnotations.filter(annotation => 
      currentPage === undefined || annotation.page === currentPage
    );
  }, [filteredAnnotations, currentPage]);

  // Sort annotations
  const sortedAnnotations = React.useMemo(() => {
    return [...filteredAnnotations].sort((a, b) => {
      if (sortBy === "newest") {
        return b.createdAt.getTime() - a.createdAt.getTime();
      } else if (sortBy === "oldest") {
        return a.createdAt.getTime() - b.createdAt.getTime();
      } else if (sortBy === "type") {
        return a.type.localeCompare(b.type);
      } else if (sortBy === "page") {
        return (a.page || 0) - (b.page || 0); // Sort by page number, handle undefined
      }
      return 0;
    });
  }, [filteredAnnotations, sortBy]);

  // Sort current page annotations
  const sortedCurrentPageAnnotations = React.useMemo(() => {
    return [...currentPageAnnotations].sort((a, b) => {
      if (sortBy === "newest") {
        return b.createdAt.getTime() - a.createdAt.getTime();
      } else if (sortBy === "oldest") {
        return a.createdAt.getTime() - b.createdAt.getTime();
      } else if (sortBy === "type") {
        return a.type.localeCompare(b.type);
      } else if (sortBy === "page") {
        return a.page - b.page; // Sort by page number
      }
      return 0;
    });
  }, [currentPageAnnotations, sortBy]);

  // Group annotations by type
  const annotationsByType = React.useMemo(() => {
    // Initialize grouped with all possible keys from typeColors to ensure all categories appear
    const grouped: Record<string, Annotation[]> = {};
    Object.keys(typeColors).forEach(key => {
      grouped[key] = [];
    });
    
    if (filteredAnnotations && Array.isArray(filteredAnnotations)) {
      filteredAnnotations.forEach(annotation => {
        if (annotation && annotation.type) {
          if (!grouped[annotation.type]) { // Handle types not in initial typeColors (e.g. "other")
            grouped[annotation.type] = [];
          }
          grouped[annotation.type].push(annotation);
        }
      });
    }
    // Filter out empty groups unless they were part of the original typeColors, for consistent display
    for (const type in grouped) {
        if (grouped[type].length === 0 && !typeColors[type as Annotation["type"]]) {
            delete grouped[type];
        }
    }
    return grouped;
  }, [filteredAnnotations]);

  const toggleType = (type: Annotation["type"]) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedTags([]);
    setSearchQuery("");
    setSelectedGroup("all");
  };

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="border-b p-4">
        {groups.length > 0 && (
          <div>
            <select
              className="w-full rounded-md border bg-background px-2 py-1 text-sm"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
            >
              <option value="all">All Groups</option>
              {groups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="mt-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search annotations..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              dir="auto" // Added for RTL support
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1.5 h-7 w-7 p-0"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(Object.keys(typeColors) as Annotation["type"][]).map((type) => (
            <Badge
              key={type}
              variant={selectedTypes.includes(type) ? "default" : "outline"}
              className={cn(
                "cursor-pointer",
                selectedTypes.includes(type) 
                  ? "bg-foreground text-background hover:bg-foreground/90" 
                  : typeColors[type]
              )}
              onClick={() => toggleType(type)}
            >
              {typeIcons[type]}
              <span className="ml-1 capitalize">{type}</span>
            </Badge>
          ))}
          {(selectedTypes.length > 0 || searchQuery || selectedTags.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-7 text-xs"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          )}
        </div>
        {allTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Sort by:</span>
          </div>
          <select
            className="rounded-md border bg-background px-2 py-1 text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "type" | "page")}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="page">Page Number</option> {/* Added Page Number option */}
            <option value="type">Type</option>
          </select>
        </div>
      </div>

      <Tabs defaultValue="all" className="flex-1">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="current">Current Page</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="flex-1 p-0">
          <ScrollArea className="h-[calc(100vh-330px)] px-4">
            <div className="py-2">
              {sortedAnnotations.length > 0 ? (
                sortedAnnotations.map((annotation) => (
                  <AnnotationCard
                    key={annotation.id}
                    annotation={annotation}
                    onClick={() => {
                      // Use scrollService to navigate
                      // Assuming 'annotation' object matches what scrollService expects
                      // or can be easily adapted. The key parts are id and page/pageNumber.
                      // The local Annotation type uses 'page', scrollService uses 'pageNumber'.
                      // We need to ensure the object passed to scrollService has 'pageNumber'.
                      const annotationForScroll = {
                        ...annotation,
                        pageNumber: annotation.page // Map 'page' to 'pageNumber'
                      };
                      scrollService.scrollToAnnotation(annotationForScroll as any);
                      // Call original onAnnotationClick if it exists for other purposes
                      onAnnotationClick?.(annotation.id);
                    }}
                  />
                ))
              ) : (
                <div className="flex h-32 flex-col items-center justify-center text-center text-muted-foreground">
                  <p>No annotations found</p>
                  {(selectedTypes.length > 0 || searchQuery || selectedTags.length > 0) && (
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-2"
                      onClick={clearFilters}
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="current" className="flex-1 p-0">
          <ScrollArea className="h-[calc(100vh-330px)] px-4">
            <div className="py-2">
              {currentPage !== undefined ? (
                sortedCurrentPageAnnotations.length > 0 ? (
                  sortedCurrentPageAnnotations.map((annotation) => (
                    <AnnotationCard
                      key={annotation.id}
                      annotation={annotation}
                      onClick={() => onAnnotationClick?.(annotation.id)}
                    />
                  ))
                ) : (
                  <div className="flex h-32 flex-col items-center justify-center text-center text-muted-foreground">
                    <p>No annotations on page {currentPage}</p>
                  </div>
                )
              ) : (
                <div className="flex h-32 items-center justify-center text-center text-muted-foreground">
                  <p>No current page selected</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="categories" className="flex-1 p-0">
          <ScrollArea className="h-[calc(100vh-330px)] px-4">
            <div className="py-2">
              {Object.entries(annotationsByType).map(([type, annotations]) => (
                <div key={type} className="mb-4">
                  <div className="mb-2 flex items-center gap-2">
                    <AnnotationTypeBadge type={type as Annotation["type"]} />
                    <span className="text-sm text-muted-foreground">
                      ({annotations.length})
                    </span>
                  </div>
                  {annotations.length > 0 ? (
                    annotations.map((annotation) => (
                      <AnnotationCard
                        key={annotation.id}
                        annotation={annotation}
                    onClick={() => {
                      const annotationForScroll = {
                        ...annotation,
                        pageNumber: annotation.page
                      };
                      scrollService.scrollToAnnotation(annotationForScroll as any);
                      onAnnotationClick?.(annotation.id);
                    }}
                      />
                    ))
                  ) : (
                    <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                      No {type} annotations
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// For testing purposes, we provide some sample data to demonstrate the component
export const mockAnnotations: Annotation[] = [
  {
    id: "1",
    type: "clause",
    text: "Non-Compete Clause",
    excerpt: "The Contractor agrees not to engage in any activity that competes with the Company for a period of two years after termination.",
    page: 2,
    groupId: "group-a",
    createdAt: new Date("2023-10-15T14:30:00"),
    author: {
      name: "Jane Smith",
      avatar: "/avatars/jane.png"
    },
    comments: [
      {
        id: "c1",
        text: "This clause may not be enforceable in California.",
        author: {
          name: "Robert Johnson"
        },
        createdAt: new Date("2023-10-15T15:45:00")
      },
      {
        id: "c2",
        text: "We should revise the duration to one year to ensure enforceability.",
        author: {
          name: "Jane Smith"
        },
        createdAt: new Date("2023-10-16T09:20:00")
      }
    ],
    tags: ["contract", "non-compete"],
    citation: {
      source: "California Business and Professions Code",
      page: 16700,
      url: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&sectionNum=16700"
    },
    flagged: false
  },
  {
    id: "2",
    type: "risk",
    text: "Liability Limitation",
    excerpt: "Company's liability shall not exceed the total amount paid by Client in the 12 months preceding any claim.",
    page: 3,
    groupId: "group-a",
    createdAt: new Date("2023-10-14T11:20:00"),
    author: {
      name: "Michael Chen"
    },
    comments: [
      {
        id: "c3",
        text: "This limitation may be too restrictive and could be challenged.",
        author: {
          name: "Michael Chen"
        },
        createdAt: new Date("2023-10-14T11:25:00")
      }
    ],
    tags: [],
    flagged: false
  },
  {
    id: "3",
    type: "definition",
    text: "Intellectual Property Definition",
    excerpt: "\"Intellectual Property\" means all patents, trademarks, copyrights, trade secrets, and other proprietary rights.",
    page: 1,
    groupId: "group-b",
    createdAt: new Date("2023-10-13T09:15:00"),
    author: {
      name: "Sarah Williams"
    },
    comments: [],
    tags: [],
    flagged: false
  },
  {
    id: "4",
    type: "reference",
    text: "Reference to Master Agreement",
    excerpt: "This Statement of Work is governed by the terms of the Master Services Agreement dated January 1, 2023.",
    page: 2,
    groupId: "group-b",
    createdAt: new Date("2023-10-12T16:40:00"),
    author: {
      name: "David Lee"
    },
    comments: [
      {
        id: "c4",
        text: "We should attach the MSA as an exhibit for clarity.",
        author: {
          name: "Sarah Williams"
        },
        createdAt: new Date("2023-10-12T17:30:00")
      }
    ],
    tags: ["reference"],
    citation: {
      source: "Master Services Agreement",
      page: 1,
    },
    flagged: false
  }
];
