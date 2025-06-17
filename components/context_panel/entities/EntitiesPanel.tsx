'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag } from 'lucide-react';

const EntitiesPanel: React.FC = () => {
  // Placeholder data
  const entities = [
    { id: 'ent1', name: 'Acme Corp', type: 'Organization', relevance: 0.9 },
    { id: 'ent2', name: 'John Doe', type: 'Person', relevance: 0.8 },
    { id: 'ent3', name: 'Project Titan', type: 'Project', relevance: 0.75 },
    { id: 'ent4', name: 'New York', type: 'Location', relevance: 0.6 },
  ];

  return (
    <ScrollArea className="h-full p-4">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground mb-3">Extracted Entities</h2>
        {entities.map((entity) => (
          <Card key={entity.id} className="bg-card/80 hover:shadow-md transition-shadow">
            <CardHeader className="p-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <Tag className="h-4 w-4 mr-2 text-primary" />
                {entity.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 text-xs text-muted-foreground">
              <p>Type: {entity.type}</p>
              <p>Relevance: {entity.relevance}</p>
              {/* Add more metadata here */}
            </CardContent>
          </Card>
        ))}
        {entities.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-10">
            No entities extracted from this document yet.
          </p>
        )}
      </div>
    </ScrollArea>
  );
};

export default EntitiesPanel;
