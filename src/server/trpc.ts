/**
 * tRPC Server Initialization
 */

import { initTRPC } from '@trpc/server';
import superjson from 'superjson';

/**
 * Context available to all procedures
 */
export interface Context {
  // Add user session, etc. here later
}

export function createContext(): Context {
  return {};
}

/**
 * Initialize tRPC with superjson for rich type serialization
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
