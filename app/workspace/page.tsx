// app/workspace/page.tsx

export default function WorkspaceTestPage() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Document Workspace</h1>
        <p className="text-gray-600 mb-6">
          Select a document from the file explorer to begin viewing and annotating.
        </p>
        <div className="text-sm text-gray-500">
          <p>• Use the left sidebar to browse files</p>
          <p>• Use the right sidebar for annotations and AI assistance</p>
          <p>• Click the expand/minimize buttons to control sidebar visibility</p>
        </div>
      </div>
    </div>
  );
}
  