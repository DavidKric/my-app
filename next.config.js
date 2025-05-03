// next.config.js
const path = require('path');
const fs = require('fs');
const CopyPlugin = require('copy-webpack-plugin');

const nextConfig = {
  // Ensure the third-party package is transpiled by Next:
  transpilePackages: ['@allenai/pdf-components'],

  // Handle canvas in SSR (important for PDF.js)
  webpack: (config, { dev, isServer }) => {
    // Mock canvas and other browser-only modules in SSR
    if (isServer) {
      // Handle canvas and other non-SSR modules
      config.resolve.alias.canvas = false;
      config.resolve.alias.encoding = false;

      // On the server: ignore .less imports
      config.module.rules.push({
        test: /\.less$/,
        use: 'ignore-loader'
      });
    } else {
      // On the client: use style-loader, css-loader, and less-loader
      config.module.rules.push({
        test: /\.less$/,
        use: [
          dev
            ? 'style-loader'
            : require('next/dist/compiled/mini-css-extract-plugin').loader,
          'css-loader',
          'less-loader'
        ]
      });
      
      // Copy PDF.js worker to public directory
      if (!dev) {
        const pdfWorkerPath = require.resolve('pdfjs-dist/build/pdf.worker.min.js');
        
        // Use copy-webpack-plugin to copy the file to the output directory
        config.plugins.push(
          new CopyPlugin({
            patterns: [
              {
                from: pdfWorkerPath,
                to: path.join(__dirname, 'public', 'pdf.worker.min.js'),
              },
            ],
          })
        );
      }
    }

    return config;
  },

  // Add Turbopack's loader config at the top level:
  experimental: {
    turbo: {
      rules: {
        // Tell Turbopack to use less-loader for .less files
        '*.less': {
          loaders: ['less-loader'],
          as: '*.css'   // treat the output as CSS
        }
      },
      // Properly handle canvas and other modules in turbopack
      resolveAlias: {
        canvas: false,
        encoding: false
      }
    }
  }
};

module.exports = nextConfig;
