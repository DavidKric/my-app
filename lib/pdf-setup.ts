'use client';

/**
 * Minimal PDF.js worker configuration.
 * The @allenai/pdf-components package bundles its own worker and
 * expects the standard worker location in /public.
 */
import { pdfjs } from 'react-pdf';

export function initializePdf() {
  if (typeof window === 'undefined') return;
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
  }
}

if (typeof window !== 'undefined') {
  initializePdf();
}

export default initializePdf;

