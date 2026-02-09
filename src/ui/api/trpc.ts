/**
 * tRPC Client
 * Connects frontend to the backend API
 */

import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '../../server/routers/index.ts';
import { useAuthStore } from '../stores/auth-store.ts';

/**
 * Get the API URL from environment or default to localhost
 */
function getApiUrl(): string {
  return import.meta.env['VITE_API_URL'] ?? 'http://localhost:3002';
}

/**
 * tRPC client instance
 * Injects Authorization header from auth store when user is signed in.
 */
export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getApiUrl()}/trpc`,
      transformer: superjson,
      headers() {
        const session = useAuthStore.getState().session;

        if (session?.access_token) {
          return {
            Authorization: `Bearer ${session.access_token}`,
          };
        }

        return {};
      },
    }),
  ],
});
