'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Clipboard, 
  ExternalLink, 
  BookOpen, 
  Users, 
  CalendarIcon 
} from 'lucide-react';

export interface CitationInfo {
  id: string;
  title: string;
  authors: string[];
  year: number;
  journal?: string;
  doi?: string;
  url?: string;
  abstract?: string;
}

interface CitationPopupProps {
  citation: CitationInfo;
  onClose: () => void;
}

export function CitationPopup({ citation, onClose }: CitationPopupProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const copyAPA = () => {
    const authorString = citation.authors.length > 3
      ? `${citation.authors[0]} et al.`
      : citation.authors.join(', ');
    
    const apaFormat = `${authorString} (${citation.year}). ${citation.title}${citation.journal ? `. ${citation.journal}` : ''}${citation.doi ? `. https://doi.org/${citation.doi}` : ''}`;
    
    copyToClipboard(apaFormat);
  };

  return (
    <Card className="w-[350px] shadow-lg animate-in fade-in-0 zoom-in-95">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium line-clamp-2">
          {citation.title}
        </CardTitle>
        <CardDescription className="flex items-center text-xs gap-1">
          <CalendarIcon className="h-3 w-3" />
          <span>{citation.year}</span>
          {citation.journal && (
            <>
              <span>•</span>
              <BookOpen className="h-3 w-3" />
              <span className="truncate">{citation.journal}</span>
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center gap-1 mb-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground line-clamp-1">
            {citation.authors.join(', ')}
          </p>
        </div>
        
        {citation.abstract && (
          <p className="text-xs line-clamp-3 text-muted-foreground">
            {citation.abstract}
          </p>
        )}
      </CardContent>
      <CardFooter className="pt-0 flex justify-between">
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={copyAPA}>
            <Clipboard className="h-3.5 w-3.5 mr-1" />
            Cite
          </Button>
          {citation.doi && (
            <Button 
              size="sm" 
              variant="outline" 
              asChild
            >
              <a 
                href={`https://doi.org/${citation.doi}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                DOI
              </a>
            </Button>
          )}
        </div>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={onClose}
        >
          Close
        </Button>
      </CardFooter>
    </Card>
  );
} 