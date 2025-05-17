#!/usr/bin/env node

/**
 * Legacy wrapper script for PDF worker setup.
 * The application now relies on @allenai/pdf-components which
 * manages the PDF.js worker automatically.
 * We keep this script for compatibility with existing npm scripts.
 */

console.log('[setup-pdf-worker] Delegating to copy-pdf-worker.js');
require('./copy-pdf-worker.js');

