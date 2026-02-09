/**
 * Progress Sync Hook
 * Subscribes to all 5 Zustand progress stores and pushes changes to cloud
 * when the user is signed in. Fire-and-forget, non-blocking.
 */

import { useEffect, useRef } from 'react';
import { useChallengeStore } from '../stores/challenge-store.ts';
import { useMixingStore } from '../stores/mixing-store.ts';
import { useProductionStore } from '../stores/production-store.ts';
import { useSamplerStore } from '../stores/sampler-store.ts';
import { useDrumSequencerStore } from '../stores/drum-sequencer-store.ts';
import { useAuthStore } from '../stores/auth-store.ts';
import type { ChallengeProgress } from '../../core/types.ts';

/**
 * Find changed progress entries by comparing old and new progress records.
 */
function getChangedEntries(
  prev: Record<string, ChallengeProgress>,
  next: Record<string, ChallengeProgress>,
): ChallengeProgress[] {
  const changed: ChallengeProgress[] = [];

  for (const [id, progress] of Object.entries(next)) {
    const old = prev[id];
    if (
      !old ||
      old.bestScore !== progress.bestScore ||
      old.stars !== progress.stars ||
      old.attempts !== progress.attempts ||
      old.completed !== progress.completed
    ) {
      changed.push(progress);
    }
  }

  return changed;
}

/**
 * Mount once in App.tsx. Subscribes to store progress changes
 * and pushes them to cloud when signed in.
 */
export function useProgressSync() {
  const pendingRef = useRef<ChallengeProgress[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const flush = () => {
      const { pushChallengeProgress, session } = useAuthStore.getState();
      if (!session || pendingRef.current.length === 0) {
        pendingRef.current = [];
        return;
      }

      for (const progress of pendingRef.current) {
        pushChallengeProgress(progress.challengeId, progress);
      }
      pendingRef.current = [];
    };

    const enqueue = (entries: ChallengeProgress[]) => {
      pendingRef.current.push(...entries);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flush, 300);
    };

    // Subscribe to each store's progress field
    const stores = [
      useChallengeStore,
      useMixingStore,
      useProductionStore,
      useSamplerStore,
      useDrumSequencerStore,
    ] as const;

    const unsubscribes = stores.map((store) => {
      let prevProgress = store.getState().progress;

      return store.subscribe((state) => {
        const nextProgress = state.progress;
        if (nextProgress === prevProgress) return;

        const changed = getChangedEntries(prevProgress, nextProgress);
        prevProgress = nextProgress;

        if (changed.length > 0) {
          enqueue(changed);
        }
      });
    });

    return () => {
      unsubscribes.forEach((unsub) => unsub());
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);
}
