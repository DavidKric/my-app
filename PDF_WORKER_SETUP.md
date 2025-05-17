# PDF.js Worker Setup

## Overview
PDF.js uses a separate worker script to parse PDF files in a web worker. Loading this worker from a CDN or from `node_modules` directly can trigger browser CORS restrictions. To ensure the worker loads from the same origin as the Next.js app, the project copies the worker file into the `public/` directory.

## copy-pdf-worker.js
The script `scripts/copy-pdf-worker.js` runs automatically through the `npm run setup-pdf-worker` command. It searches several locations in `node_modules` for `pdf.worker.min.js` (or `.mjs`) and copies the first one it finds into `public/`:

```bash
node scripts/copy-pdf-worker.js
```

Key steps:

1. Creates `public/` if it does not exist.
2. Looks for the worker file in `pdfjs-dist` or `@allenai/pdf-components`.
3. Copies the worker file to `public/pdf.worker.min.js` (or `.mjs`).

This script is invoked before `npm run dev`, `npm run build`, and `npm run start` so the worker is always present in production and during development.

## Avoiding CORS Errors
By serving `pdf.worker.min.js` from the `public/` folder, the worker is fetched from the same origin as the application. This prevents cross-origin requests that would otherwise require CORS headers or be blocked entirely. The viewer can simply load `/pdf.worker.min.js`, and the browser treats it as a same-origin resource.
