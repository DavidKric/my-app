'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';

const TimelinePanel: React.FC = () => {
  // Placeholder data
  const events = [
    { id: 'evt1', date: '2023-01-15', title: 'Contract Signed', description: 'Initial agreement finalized.' },
    { id: 'evt2', date: '2023-03-01', title: 'Project Kick-off', description: 'Phase 1 started.' },
    { id: 'evt3', date: '2023-06-30', title: 'Mid-term Review', description: 'Review of Phase 1 deliverables.' },
    { id: 'evt4', date: '2023-12-15', title: 'Project Completion', description: 'Expected end date for Phase 2.' },
  ];

  return (
    <ScrollArea className="h-full p-4">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground mb-3">Key Dates & Events</h2>
        {events.map((event, index) => (
          <div key={event.id} className="relative pl-8">
            {/* Timeline line */}
            {index < events.length -1 && (
              <div className="absolute left-[19px] top-[10px] h-full w-0.5 bg-border" />
            )}
            {/* Timeline point */}
            <div className="absolute left-[11px] top-[3px] flex h-6 w-6 items-center justify-center rounded-full bg-primary">
              <CalendarDays className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <Card className="bg-card/80 hover:shadow-md transition-shadow">
              <CardHeader className="p-3">
                <CardTitle className="text-sm font-medium">{event.title}</CardTitle>
                <CardDescription className="text-xs">{event.date}</CardDescription>
              </CardHeader>
              <CardContent className="p-3 text-xs text-muted-foreground">
                <p>{event.description}</p>
              </CardContent>
            </Card>
          </div>
        ))}
        {events.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-10">
            No timeline events identified in this document.
          </p>
        )}
      </div>
    </ScrollArea>
  );
};

export default TimelinePanel;
