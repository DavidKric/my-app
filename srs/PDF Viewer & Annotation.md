You are an expert in building robust PDF annotation UIs in React and Next.js.

Please guide me on constructing the **Main PDF Viewer & Annotation interface** for a legal document review system. 

Requirements:
1. Next.js 14 (App Router)
2. Integrate react-pdf for rendering and Allen AI PAWLS for token-based highlights/bounding boxes.
3. Word-like UI for reviewing PDF content, adding highlights, comments, categories, bounding box selection.
4. Context menu on text selection with "Add Annotation", "Research Using Agent", "Add to Chat."
5. Undo/Redo for annotation actions.
6. Use Shadcn/UI for consistent theming.
7. Refer to my SRS [paste or link it], specifically the PDF viewer + annotation sections.
8. Key references:
   - react-pdf: https://www.npmjs.com/package/react-pdf
   - PAWLS: https://github.com/allenai/pawls
   - Semantic Reader style: https://www.semanticscholar.org/product/semantic-reader
   - React PDF Highlighter example: https://agentcooper.github.io/react-pdf-highlighter/

Please detail:
- Component architecture (PDFViewer, PDFToolbar, AnnotationOverlay, etc.)
- Handling large PDFs (virtualization, performance considerations)
- Data flow for annotations (local store, hooking to remote if needed)
- The user interactions (select text, confirm highlight, category assignment, adding comments)
- Implementation outline (pseudocode, recommended libraries or approaches)
- Proposed UI design for a doc toolbar (zoom, page nav, highlight color, etc.)
- Potential pitfalls (rendering performance, memory usage) and solutions
- Plans for eventual collaboration or multi-user scenario

Conclude with a step-by-step user flow for adding annotations and storing them.
