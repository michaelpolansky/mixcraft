/**
 * tRPC Server Initialization
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { createClient } from '@supabase/supabase-js';
import superjson from 'superjson';

/**
 * Context available to all procedures
 */
export interface Context {
  user: { id: string; email: string } | null;
}

/**
 * Create context from incoming request.
 * Extracts and verifies JWT from Authorization header.
 */
export async function createContext(opts: { req: Request }): Promise<Context> {
  const supabaseUrl = process.env['SUPABASE_URL'];
  const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

  if (!supabaseUrl || !supabaseServiceKey) {
    return { user: null };
  }

  const authHeader = opts.req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { user: null };
  }

  const token = authHeader.slice(7);

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return { user: null };
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email ?? '',
      },
    };
  } catch {
    return { user: null };
  }
}

/**
 * Initialize tRPC with superjson for rich type serialization
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure — requires authenticated user
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be signed in to perform this action.',
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});
