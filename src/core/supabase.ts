/**
 * Supabase Client
 * Shared frontend instance for auth and real-time features.
 * Uses VITE_ prefixed env vars (available in browser via Vite).
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

/**
 * Get the shared Supabase client instance.
 * Returns null if env vars are not configured (graceful degradation).
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (client) return client;

  const url = import.meta.env['VITE_SUPABASE_URL'] as string | undefined;
  const anonKey = import.meta.env['VITE_SUPABASE_ANON_KEY'] as string | undefined;

  if (!url || !anonKey) {
    return null;
  }

  client = createClient(url, anonKey);
  return client;
}
