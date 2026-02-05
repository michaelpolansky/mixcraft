/**
 * Root tRPC Router
 * Combines all sub-routers into the app router
 */

import { router } from '../trpc.ts';
import { feedbackRouter } from './feedback.ts';

export const appRouter = router({
  feedback: feedbackRouter,
});

// Export type for client
export type AppRouter = typeof appRouter;
