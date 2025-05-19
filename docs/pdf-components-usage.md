# Usage of @allenai/pdf-components

This document summarizes where the main components from the `@allenai/pdf-components` library are used in the codebase.

## DocumentWrapper

- **Purpose**: Provides the surrounding context for PDF pages and manages document loading.
- **Usage**:
  - `components/pdf_viewer/core/PDFComponents.tsx` – wraps the entire list of pages.
  - `components/PdfViewer.tsx` – simple wrapper when embedding a PDF.

## PageWrapper

- **Purpose**: Renders an individual PDF page with built‑in events and scaling logic.
- **Usage**:
  - `components/pdf_viewer/core/PDFComponents.tsx` – main viewer implementation.
  - `components/PageView.tsx` – simplified page view used with overlays.

## HighlightOverlay

- **Purpose**: Displays visual highlights on top of pages.
- **Usage**:
  - `components/pdf_viewer/core/PDFComponents.tsx` – imported for future use in annotation overlays.

## BoundingBox

- **Purpose**: Renders a rectangular highlight region.
- **Usage**:
  - `components/AnnotationOverlay.tsx` – our custom annotation overlay.
  - `components/pdf_viewer/annotations/AnnotationOverlay.tsx` – advanced overlay handling selection and hover logic.
  - `components/pdf_viewer/core/PDFComponents.tsx` – included for direct highlight rendering.

## Outline and OutlineItem

- **Purpose**: Represent the document outline (table of contents).
- **Usage**:
  - `components/pdf_viewer/core/PDFOutline.tsx` – custom outline panel implementation.
  - `components/pdf_viewer/core/PDFViewer.tsx` – manages outline state and toggling.

## ThumbnailList

- **Purpose**: Displays page thumbnails for quick navigation.
- **Usage**:
  - `components/pdf_viewer/core/PDFThumbnails.tsx` – thumbnail sidebar component.

For more details about the integration process and design decisions see `docs/allen-ai-integration.md`.
