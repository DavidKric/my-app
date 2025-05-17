import { NextRequest, NextResponse } from 'next/server';

/**
 * Debug API endpoint for client-side service worker information
 * This endpoint provides HTML with JavaScript that will check and display service worker info
 */
export async function GET(request: NextRequest) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Service Worker Debug</title>
      <style>
        body { font-family: system-ui, sans-serif; line-height: 1.5; padding: 2rem; max-width: 800px; margin: 0 auto; }
        pre { background: #f5f5f5; padding: 1rem; overflow: auto; border-radius: 4px; }
        button { background: #0070f3; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; margin-right: 0.5rem; }
        button:hover { background: #0051cc; }
        .danger { background: #e00; }
        .danger:hover { background: #c00; }
        .section { margin-bottom: 2rem; border-bottom: 1px solid #eee; padding-bottom: 1rem; }
        h2 { margin-top: 0; }
      </style>
    </head>
    <body>
      <h1>Service Worker Debug Tool</h1>
      
      <div class="section">
        <h2>Current Service Worker Registrations</h2>
        <div id="registrations">Loading...</div>
        <button onclick="checkRegistrations()">Refresh</button>
      </div>
      
      <div class="section">
        <h2>Unregister Service Workers</h2>
        <p>Use these buttons to unregister service workers:</p>
        <button onclick="unregisterAll()">Unregister All Service Workers</button>
        <button class="danger" onclick="clearStorage()">Clear All Storage (IndexedDB, Cache, etc)</button>
      </div>
      
      <div class="section">
        <h2>PDF.js Debugging</h2>
        <p>Specific tools for PDF.js issues:</p>
        <button onclick="unregisterPdfWorkers()">Unregister PDF Service Workers</button>
        <button onclick="clearPdfCaches()">Clear PDF IndexedDB Caches</button>
      </div>
      
      <div class="section">
        <h2>Cache Storage Contents</h2>
        <div id="caches">Loading...</div>
        <button onclick="checkCaches()">Refresh</button>
      </div>
      
      <script>
        // Check for service worker registrations
        async function checkRegistrations() {
          const el = document.getElementById('registrations');
          el.innerHTML = 'Loading...';
          
          try {
            if (!('serviceWorker' in navigator)) {
              el.innerHTML = '<p>Service Workers are not supported in this browser.</p>';
              return;
            }
            
            const registrations = await navigator.serviceWorker.getRegistrations();
            
            if (registrations.length === 0) {
              el.innerHTML = '<p>No service workers are currently registered.</p>';
              return;
            }
            
            let html = '<ul>';
            registrations.forEach(reg => {
              html += \`<li>
                <strong>Scope:</strong> \${reg.scope}<br>
                <strong>State:</strong> \${reg.active ? 'Active' : (reg.installing ? 'Installing' : 'Waiting')}<br>
                <strong>URL:</strong> \${reg.active?.scriptURL || reg.installing?.scriptURL || 'Unknown'}<br>
                <button onclick="unregisterOne('\${reg.scope}')">Unregister</button>
              </li>\`;
            });
            html += '</ul>';
            
            el.innerHTML = html;
          } catch (err) {
            el.innerHTML = \`<p>Error checking registrations: \${err.message}</p>\`;
            console.error(err);
          }
        }
        
        // Unregister a specific service worker by scope
        async function unregisterOne(scope) {
          try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            const reg = registrations.find(r => r.scope === scope);
            
            if (reg) {
              await reg.unregister();
              alert(\`Service worker at \${scope} unregistered successfully.\`);
              checkRegistrations();
            }
          } catch (err) {
            alert(\`Error unregistering service worker: \${err.message}\`);
            console.error(err);
          }
        }
        
        // Unregister all service workers
        async function unregisterAll() {
          try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            
            if (registrations.length === 0) {
              alert('No service workers to unregister.');
              return;
            }
            
            for (const registration of registrations) {
              await registration.unregister();
            }
            
            alert(\`\${registrations.length} service worker(s) unregistered successfully.\`);
            checkRegistrations();
          } catch (err) {
            alert(\`Error unregistering service workers: \${err.message}\`);
            console.error(err);
          }
        }
        
        // Unregister just PDF related service workers
        async function unregisterPdfWorkers() {
          try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            let count = 0;
            
            for (const registration of registrations) {
              const scriptURL = registration.active?.scriptURL || '';
              const scope = registration.scope || '';
              
              if (scriptURL.includes('pdf-worker') || 
                  scriptURL.includes('pdf.worker') ||
                  scope.includes('pdf')) {
                await registration.unregister();
                count++;
              }
            }
            
            if (count > 0) {
              alert(\`\${count} PDF service worker(s) unregistered successfully.\`);
              checkRegistrations();
            } else {
              alert('No PDF service workers found.');
            }
          } catch (err) {
            alert(\`Error unregistering PDF service workers: \${err.message}\`);
            console.error(err);
          }
        }
        
        // Clear all storage (localStorage, sessionStorage, indexedDB, caches)
        async function clearStorage() {
          if (!confirm('This will clear ALL browser storage for this site. Continue?')) {
            return;
          }
          
          try {
            // Clear localStorage
            localStorage.clear();
            
            // Clear sessionStorage
            sessionStorage.clear();
            
            // Clear IndexedDB
            const databases = await indexedDB.databases();
            for (const db of databases) {
              if (db.name) indexedDB.deleteDatabase(db.name);
            }
            
            // Clear Cache Storage
            if ('caches' in window) {
              const cacheNames = await caches.keys();
              for (const name of cacheNames) {
                await caches.delete(name);
              }
            }
            
            alert('All storage cleared successfully. You may need to reload the page.');
            checkCaches();
          } catch (err) {
            alert(\`Error clearing storage: \${err.message}\`);
            console.error(err);
          }
        }
        
        // Clear PDF.js specific IndexedDB caches
        async function clearPdfCaches() {
          try {
            const pdfDatabases = [
              'pdf.js',
              'pdfjs-history',
              'pdfjs-storage'
            ];
            
            let count = 0;
            for (const dbName of pdfDatabases) {
              try {
                indexedDB.deleteDatabase(dbName);
                count++;
              } catch (e) {
                console.error(\`Failed to delete \${dbName}\`, e);
              }
            }
            
            alert(\`Cleared \${count} PDF.js database(s)\`);
          } catch (err) {
            alert(\`Error clearing PDF caches: \${err.message}\`);
            console.error(err);
          }
        }
        
        // Check cache storage contents
        async function checkCaches() {
          const el = document.getElementById('caches');
          el.innerHTML = 'Loading...';
          
          try {
            if (!('caches' in window)) {
              el.innerHTML = '<p>Cache API is not supported in this browser.</p>';
              return;
            }
            
            const cacheNames = await caches.keys();
            
            if (cacheNames.length === 0) {
              el.innerHTML = '<p>No caches found.</p>';
              return;
            }
            
            let html = '<ul>';
            for (const name of cacheNames) {
              const cache = await caches.open(name);
              const requests = await cache.keys();
              
              html += \`<li>
                <strong>Cache:</strong> \${name} (\${requests.length} items)<br>
                <details>
                  <summary>Show contents</summary>
                  <ul>\`;
                  
              for (const request of requests) {
                html += \`<li>\${request.url}</li>\`;
              }
              
              html += \`</ul>
                </details>
                <button onclick="deleteCache('\${name}')">Delete Cache</button>
              </li>\`;
            }
            html += '</ul>';
            
            el.innerHTML = html;
          } catch (err) {
            el.innerHTML = \`<p>Error checking caches: \${err.message}</p>\`;
            console.error(err);
          }
        }
        
        // Delete a specific cache
        async function deleteCache(name) {
          try {
            await caches.delete(name);
            alert(\`Cache '\${name}' deleted successfully.\`);
            checkCaches();
          } catch (err) {
            alert(\`Error deleting cache: \${err.message}\`);
            console.error(err);
          }
        }
        
        // Initialize
        window.addEventListener('load', () => {
          checkRegistrations();
          checkCaches();
        });
      </script>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
} 