/**
 * tRPC Client
 * Connects frontend to the backend API
 */

import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '../../server/routers/index.ts';

/**
 * Get the API URL from environment or default to localhost
 */
function getApiUrl(): string {
  // In production, this would be set to the Railway URL
  // For now, default to localhost
  return import.meta.env['VITE_API_URL'] ?? 'http://localhost:3002';
}

/**
 * tRPC client instance
 */
export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getApiUrl()}/trpc`,
      transformer: superjson,
    }),
  ],
});
