/**
 * Supabase Client
 * Shared frontend instance for auth and real-time features.
 * Uses VITE_ prefixed env vars (available in browser via Vite).
 *
 * Lazy-loaded via dynamic import() to keep @supabase/supabase-js (~80KB)
 * out of the main bundle. The SDK is only fetched when auth is first needed.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

let loadPromise: Promise<SupabaseClient | null> | null = null;

/**
 * Get the shared Supabase client instance.
 * Returns null if env vars are not configured (graceful degradation).
 */
export async function getSupabaseClient(): Promise<SupabaseClient | null> {
  if (loadPromise) return loadPromise;

  const url = import.meta.env['VITE_SUPABASE_URL'] as string | undefined;
  const anonKey = import.meta.env['VITE_SUPABASE_ANON_KEY'] as string | undefined;

  if (!url || !anonKey) {
    loadPromise = Promise.resolve(null);
    return loadPromise;
  }

  loadPromise = import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(url, anonKey)
  );

  return loadPromise;
}
