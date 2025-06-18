import React from 'react';

interface CenterPaneProps {
  children: React.ReactNode;
}

const CenterPane: React.FC<CenterPaneProps> = ({ children }) => {
  return (
    // Use bg-background for the main content area that might host the PDF viewer
    // The PDF Viewer itself might have its own white background for pages.
    <div className="h-full flex-grow bg-background p-4">
      {/* PDFViewer will go here */}
      {children}
    </div>
  );
};

export default CenterPane;
