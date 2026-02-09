/**
 * Root tRPC Router
 * Combines all sub-routers into the app router
 */

import { router } from '../trpc.ts';
import { feedbackRouter } from './feedback.ts';
import { progressRouter } from './progress.ts';

export const appRouter = router({
  feedback: feedbackRouter,
  progress: progressRouter,
});

// Export type for client
export type AppRouter = typeof appRouter;
