/**
 * tRPC Client
 * Connects frontend to the backend API.
 *
 * Lazy-loaded via dynamic import() to keep @trpc/client + superjson (~40KB)
 * out of the main bundle. The client is only created when first needed
 * (AI feedback, progress sync).
 */

import type { CreateTRPCClient } from '@trpc/client';
import type { AppRouter } from '../../server/routers/index.ts';
import { useAuthStore } from '../stores/auth-store.ts';

type TRPCClient = CreateTRPCClient<AppRouter>;

let loadPromise: Promise<TRPCClient> | null = null;

/**
 * Get the API URL from environment or default to localhost
 */
function getApiUrl(): string {
  return import.meta.env['VITE_API_URL'] ?? 'http://localhost:3002';
}

/**
 * Get the shared tRPC client instance (lazy-loaded).
 */
export async function getTRPC(): Promise<TRPCClient> {
  if (loadPromise) return loadPromise;

  loadPromise = Promise.all([
    import('@trpc/client'),
    import('superjson'),
  ]).then(([{ createTRPCClient, httpBatchLink }, superjsonModule]) => {
    const superjson = superjsonModule.default;
    return createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: `${getApiUrl()}/trpc`,
          transformer: superjson,
          headers() {
            const session = useAuthStore.getState().session;
            if (session?.access_token) {
              return { Authorization: `Bearer ${session.access_token}` };
            }
            return {};
          },
        }),
      ],
    });
  });

  return loadPromise;
}
