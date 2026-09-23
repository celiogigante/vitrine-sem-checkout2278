interface Env {
  ASSETS: { get(key: string): Promise<Response | null> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Try to serve the exact asset
    let response = await env.ASSETS.get(pathname);

    // If not found and not a file (no extension), serve index.html for SPA routing
    if (!response && !pathname.includes('.') && pathname !== '/') {
      response = await env.ASSETS.get('/index.html');
    }

    // If still not found and is root, serve index.html
    if (!response && pathname === '/') {
      response = await env.ASSETS.get('/index.html');
    }

    // Return 404 if still not found
    if (!response) {
      return new Response('Not Found', { status: 404 });
    }

    // Clone response to modify headers
    const newResponse = new Response(response.body, response);

    // Add cache headers
    if (pathname.includes('.') && !pathname.endsWith('.html')) {
      // Assets with hash can be cached indefinitely
      newResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (pathname.endsWith('.html') || pathname === '/') {
      // HTML should not be cached aggressively
      newResponse.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
    }

    return newResponse;
  },
};
