import { serve } from 'bun';
import { file } from 'bun';

serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    
    console.log(`📡 Request: ${url.pathname}`);
    
    try {
      // Serve the main HTML file for root path
      if (url.pathname === '/' || url.pathname === '/index.html') {
        const htmlFile = file('index.html');
        try {
          await htmlFile.text(); // Check if file exists by trying to read it
          return new Response(htmlFile, {
            headers: { 'Content-Type': 'text/html' }
          });
        } catch {
          console.error('❌ index.html not found');
          return new Response('index.html not found', { status: 404 });
        }
      }
      
      // Handle TypeScript/module requests for development
      if (url.pathname.startsWith('/src/') && url.pathname.endsWith('.ts')) {
        const tsFile = file(url.pathname.slice(1)); // Remove leading slash
        try {
          await tsFile.text();
          return new Response(tsFile, {
            headers: { 
              'Content-Type': 'text/typescript',
              'Access-Control-Allow-Origin': '*'
            }
          });
        } catch {
          // File not found, continue to other handlers
        }
      }
      
      // Handle module imports with proper MIME types
      if (url.pathname.endsWith('.js')) {
        const jsFile = file(url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname);
        try {
          await jsFile.text();
          return new Response(jsFile, {
            headers: { 
              'Content-Type': 'application/javascript',
              'Access-Control-Allow-Origin': '*'
            }
          });
        } catch {
          // Try serving from dist folder
          const distJsFile = file(`dist${url.pathname}`);
          try {
            await distJsFile.text();
            return new Response(distJsFile, {
              headers: { 
                'Content-Type': 'application/javascript',
                'Access-Control-Allow-Origin': '*'
              }
            });
          } catch {
            // Not found, continue
          }
        }
      }
      
      // Handle node_modules imports for development
      if (url.pathname.startsWith('/node_modules/')) {
        const moduleFile = file(url.pathname.slice(1));
        try {
          await moduleFile.text();
          const contentType = url.pathname.endsWith('.js') ? 'application/javascript' : 
                           url.pathname.endsWith('.ts') ? 'text/typescript' :
                           url.pathname.endsWith('.json') ? 'application/json' :
                           'text/plain';
          return new Response(moduleFile, {
            headers: { 
              'Content-Type': contentType,
              'Access-Control-Allow-Origin': '*'
            }
          });
        } catch {
          // File not found, continue
        }
      }
      
      // Serve built files from dist
      const distFile = file(`dist${url.pathname}`);
      try {
        await distFile.text();
        const contentType = url.pathname.endsWith('.js') ? 'application/javascript' :
                         url.pathname.endsWith('.css') ? 'text/css' :
                         url.pathname.endsWith('.html') ? 'text/html' :
                         'application/octet-stream';
        return new Response(distFile, {
          headers: { 
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*'
          }
        });
      } catch {
        // File not found
      }
      
      console.error(`❌ File not found: ${url.pathname}`);
      return new Response(`File not found: ${url.pathname}`, { 
        status: 404,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
      
    } catch (error) {
      console.error('❌ Server error:', error);
      return new Response('Internal server error', { 
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }
  },
});

console.log('🎮 Game Engine dev server running at http://localhost:3000');
console.log('📁 Serving files from: ./ and ./dist/');
console.log('🔧 TypeScript files supported for development');