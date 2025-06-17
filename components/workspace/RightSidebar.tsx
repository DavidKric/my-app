import React from 'react';

const RightSidebar = () => {
  // This component is largely superseded by ContextSidebar, but if used directly,
  // it should use theme-aware classes.
  // Assuming ContextSidebar is the one primarily in use and styled correctly.
  return (
    <div className="h-full bg-card text-card-foreground p-4">
      <h2 className="text-lg font-semibold">Contextual Information</h2>
      {/* Placeholder content for contextual information */}
      <p className="text-muted-foreground">Contextual data goes here...</p>
    </div>
  );
};

export default RightSidebar;
