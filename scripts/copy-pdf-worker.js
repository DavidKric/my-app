#!/usr/bin/env node

/**
 * Script to copy the PDF.js worker file to the public directory
 * This ensures the worker file is available for both local development and production
 */

const fs = require('fs');
const path = require('path');

// Define the paths
const rootDir = path.resolve(__dirname, '..');
const nodeModulesDir = path.join(rootDir, 'node_modules');
const publicDir = path.join(rootDir, 'public');

// Get the worker files based on how they're packaged in different versions
const possibleWorkerPaths = [
  // Modern version using .mjs
  path.join(nodeModulesDir, 'pdfjs-dist', 'build', 'pdf.worker.min.mjs'),
  // Legacy version using .js
  path.join(nodeModulesDir, 'pdfjs-dist', 'build', 'pdf.worker.min.js'),
  // Allen AI custom build
  path.join(nodeModulesDir, '@allenai', 'pdf-components', 'dist', 'pdf.worker.min.js'),
  // Standard build non-minified
  path.join(nodeModulesDir, 'pdfjs-dist', 'build', 'pdf.worker.js'),
];

// Create public directory if it doesn't exist
if (!fs.existsSync(publicDir)) {
  console.log(`Creating public directory at ${publicDir}`);
  fs.mkdirSync(publicDir, { recursive: true });
}

// Find the first worker file that exists
let workerPath = null;
let workerDestPath = null;

for (const possiblePath of possibleWorkerPaths) {
  if (fs.existsSync(possiblePath)) {
    workerPath = possiblePath;
    
    // Determine the destination file name based on the source extension
    const ext = path.extname(possiblePath);
    workerDestPath = path.join(publicDir, `pdf.worker.min${ext}`);
    break;
  }
}

if (!workerPath) {
  console.error('Error: Could not find PDF.js worker file in node_modules!');
  console.error('Searched the following paths:');
  possibleWorkerPaths.forEach(p => console.error(`- ${p}`));
  process.exit(1);
}

try {
  // Copy the worker file to the public directory
  console.log(`Copying PDF.js worker from ${workerPath} to ${workerDestPath}`);
  fs.copyFileSync(workerPath, workerDestPath);
  console.log('PDF.js worker file copied successfully!');
} catch (error) {
  console.error('Error copying PDF.js worker file:', error);
  process.exit(1);
} 