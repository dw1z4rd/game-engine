import { serve } from 'bun';

serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);
    
    // Serve the main HTML file for root path
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return new Response(Bun.file('dist/index.html'));
    }
    
    // Serve the built JavaScript file
    if (url.pathname === '/main.js') {
      return new Response(Bun.file('dist/main.js'));
    }
    
    // 404 for other paths
    return new Response('Not Found', { status: 404 });
  },
});

console.log('🎮 Game Engine dev server running at http://localhost:3000');