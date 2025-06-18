'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bookmark, PlusCircle, Trash2 } from 'lucide-react';

interface BookmarkItem {
  id: string;
  pageNumber: number;
  label?: string;
  createdAt: string;
}

const BookmarksPanel: React.FC = () => {
  // Placeholder state and data
  const [bookmarks, setBookmarks] = React.useState<BookmarkItem[]>([
    { id: 'bm1', pageNumber: 5, label: 'Key Introduction', createdAt: new Date().toISOString() },
    { id: 'bm2', pageNumber: 12, label: 'Methodology Section', createdAt: new Date().toISOString() },
    { id: 'bm3', pageNumber: 28, createdAt: new Date().toISOString() },
  ]);

  const addBookmark = (pageNumber: number, label?: string) => {
    const newBookmark: BookmarkItem = {
      id: `bm${Date.now()}`,
      pageNumber,
      label: label || `Page ${pageNumber}`,
      createdAt: new Date().toISOString(),
    };
    setBookmarks(prev => [...prev, newBookmark]);
  };

  const removeBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(bm => bm.id !== id));
  };

  return (
    <ScrollArea className="h-full p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-foreground">Bookmarks</h2>
          <Button size="sm" variant="outline" onClick={() => addBookmark(1, 'New Bookmark (Sample)')}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Bookmark
          </Button>
        </div>

        {bookmarks.map((bookmark) => (
          <Card key={bookmark.id} className="bg-card/80 hover:shadow-md transition-shadow">
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <div className="flex items-center text-sm font-medium">
                  <Bookmark className="h-4 w-4 mr-2 text-primary" />
                  <span>{bookmark.label || `Page ${bookmark.pageNumber}`}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Page {bookmark.pageNumber} - Added on {new Date(bookmark.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeBookmark(bookmark.id)}>
                <Trash2 className="h-4 w-4 text-destructive/80 hover:text-destructive" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {bookmarks.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-10">
            No bookmarks added for this document yet.
          </p>
        )}
      </div>
    </ScrollArea>
  );
};

export default BookmarksPanel;
