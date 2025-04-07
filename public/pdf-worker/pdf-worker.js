// PDF Worker
// This file is used to load the PDF.js worker in a way that's compatible with Next.js

// Set up self as window for compatibility
self.window = self;

// Import from PDF.js worker
importScripts('/pdf-worker/pdf.worker.min.mjs'); 