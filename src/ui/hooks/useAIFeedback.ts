/**
 * Hook for fetching AI feedback with cancellation support
 */

import { useState, useEffect } from 'react';

export function useAIFeedback(
  fetchFn: () => Promise<{ feedback: string }>,
  deps: unknown[]
): { feedback: string | null; loading: boolean } {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function doFetch() {
      try {
        const response = await fetchFn();
        if (!cancelled) {
          setFeedback(response.feedback);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch AI feedback:', error);
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    doFetch();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { feedback, loading };
}
