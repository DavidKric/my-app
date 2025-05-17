# PDF Annotation Application

A modern PDF viewer and annotation tool for legal documents. This application utilizes the professional @allenai/pdf-components library and follows Next.js 15 App Router best practices.

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
├── components/             # Reusable React components
│   ├── context_panel/      # Sidebar and context panels
│   ├── pdf_viewer/         # PDF viewer components
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

## Enhanced PDF.js Worker Handling

The application uses several techniques to ensure the PDF.js worker loads correctly without CORS issues:

1. **Blob URL Creation**: The app fetches the worker script and creates a blob URL from it, which avoids CORS entirely.

2. **Memory Caching**: The proxy server caches the worker script in memory for faster subsequent requests.

3. **Disk Backup**: The worker script is saved to disk as a backup in case the CDN is unavailable.

4. **Dynamic Import Patching**: The app intercepts dynamic imports that try to load workers from CDNs.

5. **Worker Shim**: A minimal worker implementation is provided as a fallback for environments where other methods fail.

## Integration with @allenai/pdf-components

This application leverages the professional @allenai/pdf-components library for PDF rendering and management. The library provides:

- `DocumentWrapper`: For handling PDF document loading and state
- `PageWrapper`: For rendering individual PDF pages
- `HighlightOverlay`: For displaying highlights on PDF pages
- Various context providers for document state management

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

## License

MIT License





