# PDF Annotation Application

A modern PDF viewer and annotation tool for legal documents. This application utilizes the professional `@davidkric/pdf-components` library and follows Next.js 15 App Router best practices.

## ⚠️ Critical Implementation Notes

### Render Type Selection
**ALWAYS use `RENDER_TYPE.MULTI_CANVAS`** - This is crucial for proper PDF rendering:

- ✅ **MULTI_CANVAS**: Provides correct sizing, proper zoom behavior, and reliable rendering
- ❌ **SINGLE_CANVAS**: Causes severe sizing issues, broken zoom, and poor user experience

See `/render-comparison` for a visual demonstration of the difference.

### Library Usage
The application uses `@davidkric/pdf-components` which provides:
- Built-in zoom and scale management (no external scale state needed)
- Proper canvas rendering with `MULTI_CANVAS` mode
- Context providers for document state
- Professional PDF viewer components

## Features

- **Document Viewer:** Advanced PDF viewing with zooming, rotating, and page navigation
- **Annotation Tools:** Highlight text, add notes, and create comments
- **Context Panels:** Sidebar for viewing annotations and file navigation
- **Modern UI:** Clean, responsive interface with modern design patterns
- **CORS-Free Worker:** Specialized PDF.js worker handling to avoid common CORS issues
- **AI Copilot Chat:** Integrated chat assistant for document analysis

## Project Structure

The project follows Next.js 15 App Router conventions:

```
my-app/
├── app/                    # Next.js App Router pages
│   ├── workspace/          # Main application workspace
│   │   ├── viewer/         # PDF viewer page
│   │   └── ...
│   ├── render-comparison/  # Demonstration of render type differences
│   ├── test-sizing/        # Library defaults testing
│   └── ...
├── components/             # Reusable React components
│   ├── context_panel/      # Sidebar and context panels
│   ├── pdf_viewer/         # PDF viewer components
│   │   ├── core/           # Core PDF components
│   │   ├── controls/       # Toolbar and controls
│   │   ├── annotations/    # Annotation overlays
│   │   └── ...
│   ├── ui/                 # UI components (buttons, inputs, etc.)
│   └── ...
├── lib/                    # Utility functions and services
│   ├── pdf-setup.ts        # PDF.js configuration
│   └── ...
├── public/                 # Static assets
│   ├── pdfjs-worker-shim.js # PDF.js worker shim for CORS handling
│   └── ...
└── proxy/                  # PDF.js worker proxy server
```

## Development Setup

To run the application with the PDF.js worker proxy:

1. Start the PDF.js worker proxy server:

```bash
# Install dependencies (first time only)
cd proxy
npm install

# Start the proxy server
npm start
```

2. In a separate terminal, start the Next.js development server:

```bash
# From the project root
npm run dev
```
This command runs a helper script that copies the `pdf.worker.min.js` file from
`node_modules` into the `public` directory so the viewer can load the worker
without CORS issues.

3. Visit http://localhost:3000 to access the application

## Key Application Routes

- `/workspace/viewer` - Main PDF viewer with annotation capabilities
- `/render-comparison` - Visual comparison of SINGLE_CANVAS vs MULTI_CANVAS
- `/test-sizing` - Testing page for library defaults

## Enhanced PDF.js Worker Handling

The application uses several techniques to ensure the PDF.js worker loads correctly without CORS issues:

1. **Blob URL Creation**: The app fetches the worker script and creates a blob URL from it, which avoids CORS entirely.

2. **Memory Caching**: The proxy server caches the worker script in memory for faster subsequent requests.

3. **Disk Backup**: The worker script is saved to disk as a backup in case the CDN is unavailable.

4. **Dynamic Import Patching**: The app intercepts dynamic imports that try to load workers from CDNs.

5. **Worker Shim**: A minimal worker implementation is provided as a fallback for environments where other methods fail.

## Integration with @davidkric/pdf-components

This application leverages the professional `@davidkric/pdf-components` library for PDF rendering and management. **Key implementation insights:**

### Core Components Used:
- `ContextProvider`: Provides document state management
- `DocumentWrapper`: Handles PDF document loading with `RENDER_TYPE.MULTI_CANVAS`
- `PageWrapper`: Renders individual PDF pages properly sized
- `DocumentContext`: Access to document state (numPages, etc.)
- `RENDER_TYPE`: Constants for render mode selection

### Critical Implementation Requirements:
1. **Always use `RENDER_TYPE.MULTI_CANVAS`** for proper rendering
2. **Let the library handle zoom/scale** - no external scale management needed
3. **Use ContextProvider wrapper** for all PDF components
4. **Access document state** through DocumentContext

### Example Correct Usage:
```tsx
<ContextProvider>
  <DocumentWrapper 
    file={fileUrl}
    renderType={RENDER_TYPE.MULTI_CANVAS}
  >
    <YourPDFComponent />
  </DocumentWrapper>
</ContextProvider>
```

Custom UI components are built on top of these foundational components to create a cohesive and feature-rich application.

## Context Sidebar and AI Copilot

The right sidebar, defined in `ContextSidebar.tsx`, provides two major tools:

- **Professional Annotation Sidebar** – lists annotations for the current PDF with search, filtering by type, and sorting options.
- **AI Copilot Chat** – a chat interface that lets you discuss the document with an AI assistant. New messages cause the tab to highlight until opened.

### Enabling

1. Wrap workspace pages with `ClientAnnotationProvider` (see `app/workspace/layout.tsx`) to supply annotation state.
2. Include `<ContextSidebar />` in your layout and control the active tab via its props if needed.

Annotations are persisted through the Prisma-backed API under `app/api/annotations`.

## Browser Compatibility

The application is designed to work in modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## File Explorer Manual Testing

To verify file and folder actions in the sidebar:

1. Start the development server as described in **Development Setup**.
2. In the workspace view, open the file explorer.
3. Right-click a file to rename or delete it. Renaming should update the entry immediately and deleting should remove it from the tree.
4. Right-click a folder to create a new file or subfolder, rename it, or delete it. Newly created items appear under the selected folder.
5. Refresh the page to confirm that changes persist in the current session.

## License

MIT License





