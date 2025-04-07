/**
 * PDF Worker Proxy Server
 * 
 * This Express server provides a proxy for PDF.js worker scripts to avoid CORS issues.
 * It fetches the worker script from CDN, caches it, and serves it to the client.
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
const http = require('http');
const https = require('https');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());

// Cache for the worker script
let workerScriptCache = null;
let workerLastFetched = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

/**
 * Fetches and caches the worker script from CDN
 * @returns {Promise<string>} The worker script content
 */
async function fetchWorkerScript() {
  return new Promise((resolve, reject) => {
    const workerUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.js';
    console.log(`Fetching fresh worker from: ${workerUrl}`);
    
    // Choose http or https module based on URL
    const httpClient = workerUrl.startsWith('https') ? https : http;
    
    // Request the worker script
    httpClient.get(workerUrl, (proxyRes) => {
      // Check if response is successful
      if (proxyRes.statusCode !== 200) {
        return reject(new Error(`Failed to fetch worker: ${proxyRes.statusCode}`));
      }
      
      // Collect data
      let data = '';
      proxyRes.on('data', (chunk) => {
        data += chunk;
      });
      
      // Return the script on completion
      proxyRes.on('end', () => {
        workerScriptCache = data;
        workerLastFetched = Date.now();
        
        // Also save to disk as backup
        try {
          const publicPath = path.join(__dirname, '../public/pdf.worker.min.js');
          fs.writeFileSync(publicPath, data);
          console.log('Worker script saved to disk as backup');
        } catch (err) {
          console.warn('Failed to save worker script to disk:', err);
        }
        
        resolve(data);
      });
      
      // Handle errors
      proxyRes.on('error', (err) => {
        console.error('Error while receiving worker file:', err);
        reject(err);
      });
    }).on('error', (err) => {
      console.error('Error while requesting worker file:', err);
      reject(err);
    });
  });
}

/**
 * Checks if the local worker script backup exists and is readable
 * @returns {Promise<string|null>} The worker script content or null if not available
 */
async function readLocalWorkerBackup() {
  return new Promise((resolve) => {
    try {
      const backupPath = path.join(__dirname, '../public/pdf.worker.min.js');
      
      if (fs.existsSync(backupPath)) {
        const stats = fs.statSync(backupPath);
        
        // Check if the file is not empty and is readable
        if (stats.size > 0) {
          const data = fs.readFileSync(backupPath, 'utf8');
          console.log('Loaded backup worker script from disk');
          resolve(data);
          return;
        }
      }
      
      // If we get here, the backup is not usable
      resolve(null);
    } catch (error) {
      console.error('Failed to read backup worker script:', error);
      resolve(null);
    }
  });
}

/**
 * Route to serve the PDF.js worker script
 */
app.get('/pdf.worker.min.js', async (req, res) => {
  try {
    // Check if we need to refresh the cache
    const now = Date.now();
    const cacheExpired = now - workerLastFetched > CACHE_DURATION;
    
    // If script is not cached or cache is expired, fetch it
    if (!workerScriptCache || cacheExpired) {
      try {
        await fetchWorkerScript();
      } catch (fetchError) {
        console.error('Failed to fetch worker script from CDN:', fetchError);
        
        // Try to load from local backup if fetching fails
        const backupScript = await readLocalWorkerBackup();
        if (backupScript) {
          workerScriptCache = backupScript;
        } else {
          // If we have no backup, use the worker shim as a last resort
          const shimPath = path.join(__dirname, '../public/pdfjs-worker-shim.js');
          if (fs.existsSync(shimPath)) {
            workerScriptCache = fs.readFileSync(shimPath, 'utf8');
            console.log('Using worker shim as last resort');
          } else {
            return res.status(500).send('No worker script available');
          }
        }
      }
    } else {
      console.log('Using cached worker script');
    }
    
    // Set appropriate headers
    res.set({
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*'
    });
    
    // Send the worker script
    return res.send(workerScriptCache);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).send('Proxy error');
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.status(200).send({
    status: 'ok',
    timestamp: new Date().toISOString(),
    cache: {
      isCached: !!workerScriptCache,
      lastFetched: workerLastFetched ? new Date(workerLastFetched).toISOString() : null
    }
  });
});

// Serve static files from public directory as fallback
app.use(express.static(path.join(__dirname, '../public')));

// Start the server
app.listen(PORT, () => {
  console.log(`PDF Worker proxy server running on port ${PORT}`);
  
  // Prefetch the worker script at startup
  fetchWorkerScript()
    .then(() => console.log('Worker script prefetched and cached'))
    .catch(err => {
      console.error('Failed to prefetch worker script:', err);
      // Try to load from backup
      readLocalWorkerBackup()
        .then(script => {
          if (script) {
            workerScriptCache = script;
            workerLastFetched = Date.now(); // Set to avoid immediate refetch
            console.log('Loaded backup worker script on startup');
          }
        })
        .catch(backupErr => console.error('Failed to load backup script:', backupErr));
    });
}); 