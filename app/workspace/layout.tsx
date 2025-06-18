// app/workspace/layout.tsx
"use client"; // Required for react-resizable-panels
import React, { useState, useRef } from 'react';
import { Case } from '@/types/file_explorer/file-structure';
import { ClientAnnotationProvider } from '@/components/context_panel/annotations/ClientAnnotationProvider';
import LeftSidebar from '@/components/workspace/LeftSidebar';
import CenterPane from '@/components/workspace/CenterPane';
import RightSidebar from '@/components/workspace/RightSidebar';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { ChevronLeft, ChevronRight, PanelLeftClose, PanelRightClose, PanelLeftOpen, PanelRightOpen } from 'lucide-react';

// Note: fetchCasesData has been moved to app/lib/data.ts
// This component is now client-side and expects 'cases' as a prop.
// For now, this layout assumes `cases` is passed as a prop.

export default function WorkspaceLayout({ children, cases }: { children: React.ReactNode, cases: Case[] }) {
  // Note: ThemeToggleButton is now in LayoutClient's left sidebar header.
  // This component (WorkspaceLayout) is a Server Component if `fetchCasesData` was still here,
  // but now it's primarily a structure for client components.
  // If it were to become a client component itself for other reasons, ThemeToggleButton could also go here.
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

  // Refs to control panel sizes for collapse/expand
  const leftPanelRef = useRef<any>(null);
  const rightPanelRef = useRef<any>(null);

  const toggleLeftSidebar = () => {
    setIsLeftCollapsed(!isLeftCollapsed);
    if (leftPanelRef.current) {
      if (isLeftCollapsed) {
        leftPanelRef.current.expand();
      } else {
        leftPanelRef.current.collapse();
      }
    }
  };

  const toggleRightSidebar = () => {
    setIsRightCollapsed(!isRightCollapsed);
    if (rightPanelRef.current) {
      if (isRightCollapsed) {
        rightPanelRef.current.expand();
      } else {
        rightPanelRef.current.collapse();
      }
    }
  };

  return (
    <ClientAnnotationProvider cases={cases}>
      {/* Use theme-aware classes for background and text */}
      <div className="flex h-screen w-screen bg-background text-foreground">
        <PanelGroup direction="horizontal" className="flex-grow">
          {!isLeftCollapsed && (
            <Panel
              ref={leftPanelRef}
              defaultSize={20}
              minSize={15}
              maxSize={40}
              collapsible={true}
              collapsedSize={0}
              onCollapse={() => setIsLeftCollapsed(true)}
              className="h-full"
              id="left-sidebar-panel"
            >
              <LeftSidebar />
            </Panel>
          )}
          <div className="relative">
            <button
              onClick={toggleLeftSidebar}
              className="absolute top-1/2 -translate-y-1/2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 p-1 rounded-full z-20 border border-gray-300 dark:border-gray-600 shadow-md"
              style={{
                left: isLeftCollapsed ? '4px' : 'auto',
                right: isLeftCollapsed ? 'auto' : '-14px', // Position slightly outside when expanded
                transform: isLeftCollapsed ? 'translateY(-50%)' : 'translateY(-50%) translateX(50%)'
              }}
              title={isLeftCollapsed ? "Expand Left Sidebar" : "Collapse Left Sidebar"}
            >
              {isLeftCollapsed ? <PanelRightOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
            {!isLeftCollapsed && (
              <PanelResizeHandle className="w-2 bg-gray-300 dark:bg-gray-600 hover:bg-blue-500 dark:hover:bg-blue-400 active:bg-blue-600 dark:active:bg-blue-500 transition-colors duration-150 relative z-10" />
            )}
          </div>
          <Panel defaultSize={60} minSize={30} className="h-full flex-grow relative z-0">
            <CenterPane>{children}</CenterPane>
          </Panel>
          <div className="relative">
            {!isRightCollapsed && (
              <PanelResizeHandle className="w-2 bg-gray-300 dark:bg-gray-600 hover:bg-blue-500 dark:hover:bg-blue-400 active:bg-blue-600 dark:active:bg-blue-500 transition-colors duration-150 relative z-10" />
            )}
            <button
              onClick={toggleRightSidebar}
              className="absolute top-1/2 -translate-y-1/2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 p-1 rounded-full z-20 border border-gray-300 dark:border-gray-600 shadow-md"
              style={{
                right: isRightCollapsed ? '4px' : 'auto',
                left: isRightCollapsed ? 'auto' : '-14px', // Position slightly outside when expanded
                transform: isRightCollapsed ? 'translateY(-50%)' : 'translateY(-50%) translateX(-50%)'
              }}
              title={isRightCollapsed ? "Expand Right Sidebar" : "Collapse Right Sidebar"}
            >
              {isRightCollapsed ? <PanelLeftOpen size={18} /> : <PanelRightClose size={18} />}
            </button>
          </div>
          {!isRightCollapsed && (
            <Panel
              ref={rightPanelRef}
              defaultSize={20}
              minSize={15}
              maxSize={40}
              collapsible={true}
              collapsedSize={0}
              onCollapse={() => setIsRightCollapsed(true)}
              className="h-full"
              id="right-sidebar-panel"
            >
              <RightSidebar />
            </Panel>
          )}
        </PanelGroup>
      </div>
    </ClientAnnotationProvider>
  );
}

// Need to adjust the page component that uses this layout to fetch cases and pass it as a prop.
// For example, in app/workspace/[caseId]/page.tsx (or similar)
// export default async function WorkspacePage({ params }: { params: { caseId: string } }) {
//   const cases = await fetchCasesData(); // Or a function to fetch a specific case
//   const currentCase = cases.find(c => c.id === params.caseId);
//   // ...
//   return (
//     <WorkspaceLayout cases={cases}> {/* or cases={currentCase} depending on needs */}
//       <PDFView file={currentCase?.root.children[0] as FileNode} />
//     </WorkspaceLayout>
//   );
// }
//
// And the fetchCasesData function might need to be moved or made available to both.
// For now, this layout assumes `cases` is passed as a prop.
