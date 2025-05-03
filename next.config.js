// next.config.js
const nextConfig = {
  // Ensure the third-party package is transpiled by Next:
  transpilePackages: ['@allenai/pdf-components'],

  // Add Turbopack's loader config at the top level:
  experimental: {
    turbo: {
      // Add resolveAlias configuration for Turbopack
      resolveAlias: {
        canvas: './empty-module.js',
      },
      rules: {
        // Tell Turbopack to use less-loader for .less files
        '*.less': {
          loaders: ['less-loader'],
          as: '*.css'   // treat the output as CSS
        }
      }
    },
    // Add preload configuration to mitigate preload warnings
    optimizeCss: true,
    optimizePackageImports: ['@allenai/pdf-components']
  },

  webpack: (config, { dev, isServer }) => {
    // Add canvas module alias to fix PDF.js issue (for regular webpack builds)
    config.resolve.alias.canvas = false;
    
    // Add special handling for PDF.js worker files
    config.module.rules.push({
      test: /pdf\.worker\.(min\.)?js/,
      type: 'asset/resource',
      generator: {
        filename: 'static/worker/[hash][ext][query]',
      },
    });

    if (isServer) {
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
    }

    return config;
  }
};

module.exports = nextConfig;
