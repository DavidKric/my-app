#!/usr/bin/env node

/**
 * DEPRECATED: PDF Worker Setup Script
 * 
 * This script is now a placeholder that does nothing.
 * 
 * The application now uses @allenai/pdf-components which manages its own
 * PDF.js worker configuration internally, so there's no need for any
 * manual worker setup or file copying.
 */

console.log('⚠️  NOTICE: PDF Worker Setup Script');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('This script is now a placeholder.');
console.log('The application uses @allenai/pdf-components which handles its own PDF worker setup internally.');
console.log('No manual worker configuration or file copying is needed.');

// Exit successfully to avoid breaking the build process
process.exit(0); 