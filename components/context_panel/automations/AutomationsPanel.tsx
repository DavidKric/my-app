'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, Zap, Settings2 } from 'lucide-react';

interface AutomationAction {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
}

const AutomationsPanel: React.FC = () => {
  // Placeholder data
  const automations: AutomationAction[] = [
    { id: 'auto1', name: 'Summarize Document', description: 'Generate a concise summary of the entire document.', icon: PlayCircle },
    { id: 'auto2', name: 'Extract Key Terms', description: 'Identify and list all key terms found.', icon: Zap },
    { id: 'auto3', name: 'Generate Report Outline', description: 'Create a structured outline for a report based on content.', icon: Settings2 },
  ];

  return (
    <ScrollArea className="h-full p-4">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground mb-3">Automations</h2>
        {automations.map((automation) => (
          <Card key={automation.id} className="bg-card/80 hover:shadow-md transition-shadow">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <automation.icon className="h-4 w-4 mr-2 text-primary" />
                {automation.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <CardDescription className="text-xs mb-3">{automation.description}</CardDescription>
              <Button size="xs" variant="outline" className="w-full">
                <PlayCircle className="h-3.5 w-3.5 mr-1.5" />
                Run Automation
              </Button>
            </CardContent>
          </Card>
        ))}
        {automations.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-10">
            No automations available for this document type.
          </p>
        )}
      </div>
    </ScrollArea>
  );
};

export default AutomationsPanel;
