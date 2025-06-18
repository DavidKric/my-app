import React from 'react';

const LeftSidebar = () => {
  // This component is largely superseded by ExplorerSidebar, but if used directly,
  // it should use theme-aware classes.
  // Assuming ExplorerSidebar is the one primarily in use and styled correctly.
  // For this placeholder:
  return (
    <div className="h-full bg-card text-card-foreground p-4">
      <h2 className="text-lg font-semibold">File Explorer</h2>
      {/* Placeholder content for file explorer */}
      <p className="text-muted-foreground">File list goes here...</p>
    </div>
  );
};

export default LeftSidebar;
