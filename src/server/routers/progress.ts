/**
 * Progress Router
 * Cloud persistence for challenge progress.
 * All endpoints require authentication (protectedProcedure).
 */

import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { router, protectedProcedure } from '../trpc.ts';

/**
 * Get server-side Supabase client (service role — bypasses RLS).
 * Auth is already verified by the tRPC protectedProcedure middleware.
 */
function getServiceClient() {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_SERVICE_ROLE_KEY'];

  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(url, key);
}

const progressSchema = z.object({
  challengeId: z.string().min(1),
  bestScore: z.number().min(0).max(100),
  stars: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  attempts: z.number().int().min(0),
  completed: z.boolean(),
});

export const progressRouter = router({
  /**
   * Get all progress records for the authenticated user.
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const supabase = getServiceClient();

    const { data, error } = await supabase
      .from('user_progress')
      .select('challenge_id, best_score, stars, attempts, completed')
      .eq('user_id', ctx.user.id);

    if (error) {
      throw new Error(`Failed to fetch progress: ${error.message}`);
    }

    // Convert from snake_case DB format to camelCase app format
    const progress: Record<string, {
      challengeId: string;
      bestScore: number;
      stars: 0 | 1 | 2 | 3;
      attempts: number;
      completed: boolean;
    }> = {};

    for (const row of data ?? []) {
      progress[row.challenge_id] = {
        challengeId: row.challenge_id,
        bestScore: Number(row.best_score),
        stars: row.stars as 0 | 1 | 2 | 3,
        attempts: row.attempts,
        completed: row.completed,
      };
    }

    return progress;
  }),

  /**
   * Upsert a single challenge progress record.
   * Used on challenge completion (fire-and-forget from frontend).
   */
  upsert: protectedProcedure
    .input(progressSchema)
    .mutation(async ({ ctx, input }) => {
      const supabase = getServiceClient();

      const { error } = await supabase
        .from('user_progress')
        .upsert(
          {
            user_id: ctx.user.id,
            challenge_id: input.challengeId,
            best_score: input.bestScore,
            stars: input.stars,
            attempts: input.attempts,
            completed: input.completed,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,challenge_id' }
        );

      if (error) {
        throw new Error(`Failed to upsert progress: ${error.message}`);
      }

      return { success: true };
    }),

  /**
   * Bulk upsert progress records.
   * Used on initial sync after login — merges all local progress to cloud.
   */
  bulkUpsert: protectedProcedure
    .input(z.array(progressSchema).max(400))
    .mutation(async ({ ctx, input }) => {
      if (input.length === 0) return { success: true, count: 0 };

      const supabase = getServiceClient();

      const rows = input.map((p) => ({
        user_id: ctx.user.id,
        challenge_id: p.challengeId,
        best_score: p.bestScore,
        stars: p.stars,
        attempts: p.attempts,
        completed: p.completed,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('user_progress')
        .upsert(rows, { onConflict: 'user_id,challenge_id' });

      if (error) {
        throw new Error(`Failed to bulk upsert progress: ${error.message}`);
      }

      return { success: true, count: input.length };
    }),
});
