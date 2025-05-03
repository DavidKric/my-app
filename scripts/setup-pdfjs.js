#!/usr/bin/env node

/**
 * This script sets up the PDF.js files needed for production build
 * It copies worker, cmaps, and standard fonts to the public directory
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const CMAPS_DIR = path.join(PUBLIC_DIR, 'cmaps');
const STANDARD_FONTS_DIR = path.join(PUBLIC_DIR, 'standard_fonts');

// Ensure destination directories exist
console.log('Creating directories if they don\'t exist...');
[PUBLIC_DIR, CMAPS_DIR, STANDARD_FONTS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Try to find PDF.js files from node_modules
try {
  const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
  const workerPath = path.join(pdfjsDistPath, 'build', 'pdf.worker.min.js');
  const cmapsPath = path.join(pdfjsDistPath, 'cmaps');
  const standardFontsPath = path.join(pdfjsDistPath, 'standard_fonts');
  
  console.log('Copying PDF.js worker file...');
  fs.copyFileSync(workerPath, path.join(PUBLIC_DIR, 'pdf.worker.min.js'));
  
  // Copy cMaps
  console.log('Copying cMaps...');
  if (fs.existsSync(cmapsPath)) {
    const cMaps = fs.readdirSync(cmapsPath);
    cMaps.forEach(file => {
      fs.copyFileSync(
        path.join(cmapsPath, file),
        path.join(CMAPS_DIR, file)
      );
    });
    console.log(`Copied ${cMaps.length} cMap files.`);
  } else {
    console.warn('Could not find cMaps directory.');
  }
  
  // Copy standard fonts
  console.log('Copying standard fonts...');
  if (fs.existsSync(standardFontsPath)) {
    const standardFonts = fs.readdirSync(standardFontsPath);
    standardFonts.forEach(file => {
      fs.copyFileSync(
        path.join(standardFontsPath, file),
        path.join(STANDARD_FONTS_DIR, file)
      );
    });
    console.log(`Copied ${standardFonts.length} standard font files.`);
  } else {
    console.warn('Could not find standard_fonts directory.');
  }
  
  console.log('PDF.js setup completed successfully!');
} catch (error) {
  console.error('Error setting up PDF.js files:', error);
  process.exit(1);
} 