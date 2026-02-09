/**
 * MIXCRAFT Backend Server
 * tRPC API server using Bun's native HTTP server
 */

import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from './routers/index.ts';
import { createContext } from './trpc.ts';

const PORT = process.env['PORT'] ?? 3002;

// Allowed origins for CORS
const ALLOWED_ORIGINS = new Set([
  'http://localhost:3003',
  'http://localhost:5173',
  process.env['CORS_ORIGIN'],
].filter(Boolean));

/**
 * Get CORS origin - validate against allowed list
 */
function getCorsOrigin(request: Request): string {
  const origin = request.headers.get('Origin') ?? '';
  // In production, allow the configured origin
  // In development, allow localhost variants
  if (ALLOWED_ORIGINS.has(origin)) {
    return origin;
  }
  // Default to configured origin or wildcard for flexibility
  return process.env['CORS_ORIGIN'] ?? '*';
}

/**
 * Create the server using Bun's native fetch handler
 */
const server = Bun.serve({
  port: PORT,
  fetch: async (request) => {
    const url = new URL(request.url);
    const corsOrigin = getCorsOrigin(request);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // tRPC handler
    if (url.pathname.startsWith('/trpc')) {
      const response = await fetchRequestHandler({
        endpoint: '/trpc',
        req: request,
        router: appRouter,
        createContext: () => createContext({ req: request }),
      });

      // Add CORS headers to response
      const newHeaders = new Headers(response.headers);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        newHeaders.set(key, value);
      });

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    }

    // 404 for unknown routes
    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  },
});

console.log(`🚀 MIXCRAFT API server running on http://localhost:${server.port}`);
console.log(`   tRPC endpoint: http://localhost:${server.port}/trpc`);
console.log(`   Health check:  http://localhost:${server.port}/health`);
