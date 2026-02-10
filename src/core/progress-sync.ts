/**
 * Progress Sync Logic
 * Pure functions for merging local/cloud progress and reading/writing Zustand stores.
 * No React dependencies — used by auth-store for sync orchestration.
 */

import type { ChallengeProgress } from './types.ts';
import { useChallengeStore } from '../ui/stores/challenge-store.ts';
import { useMixingStore } from '../ui/stores/mixing-store.ts';
import { useProductionStore } from '../ui/stores/production-store.ts';
import { useSamplerStore } from '../ui/stores/sampler-store.ts';
import { useDrumSequencerStore } from '../ui/stores/drum-sequencer-store.ts';

/**
 * Merge two progress records using "best wins" strategy.
 * Commutative: merge(A, B) === merge(B, A)
 * Idempotent: merge(A, merge(A, B)) === merge(A, B)
 */
export function mergeProgress(
  local: Record<string, ChallengeProgress>,
  cloud: Record<string, ChallengeProgress>,
): Record<string, ChallengeProgress> {
  const merged: Record<string, ChallengeProgress> = {};

  // Collect all unique challenge IDs
  const allIds = new Set([...Object.keys(local), ...Object.keys(cloud)]);

  for (const id of allIds) {
    const l = local[id];
    const c = cloud[id];

    if (l && !c) {
      merged[id] = l;
    } else if (!l && c) {
      merged[id] = c;
    } else if (l && c) {
      // Keep breakdown from whichever side had the higher bestScore
      const bestBreakdown = l.bestScore >= c.bestScore ? l.breakdown : c.breakdown;
      merged[id] = {
        challengeId: id,
        bestScore: Math.max(l.bestScore, c.bestScore),
        stars: Math.max(l.stars, c.stars) as 0 | 1 | 2 | 3,
        attempts: Math.max(l.attempts, c.attempts),
        completed: l.completed || c.completed,
        breakdown: bestBreakdown,
      };
    }
  }

  return merged;
}

/**
 * Read all progress from all 5 Zustand stores.
 * Returns a single flat record keyed by challenge ID.
 */
export function getAllLocalProgress(): Record<string, ChallengeProgress> {
  const stores = [
    useChallengeStore.getState().progress,
    useMixingStore.getState().progress,
    useProductionStore.getState().progress,
    useSamplerStore.getState().progress,
    useDrumSequencerStore.getState().progress,
  ];

  const all: Record<string, ChallengeProgress> = {};
  for (const storeProgress of stores) {
    Object.assign(all, storeProgress);
  }
  return all;
}

// Challenge ID prefix → store mapping
// SD challenges go to challenge-store
// F/I/A/M (mixing) challenges go to mixing-store
// P challenges go to production-store
// SM challenges go to sampler-store
// DS challenges go to drum-sequencer-store
function getStoreForChallenge(challengeId: string): 'challenge' | 'mixing' | 'production' | 'sampler' | 'drum-sequencer' {
  if (challengeId.startsWith('SM')) return 'sampler';
  if (challengeId.startsWith('SD')) return 'challenge';
  if (challengeId.startsWith('DS')) return 'drum-sequencer';
  if (challengeId.startsWith('P')) return 'production';
  // F, I, A, M prefixes are all mixing
  if (challengeId.startsWith('F') || challengeId.startsWith('I') || challengeId.startsWith('A') || challengeId.startsWith('M')) return 'mixing';
  // Default to challenge store
  return 'challenge';
}

/**
 * Write merged progress back to the correct Zustand stores.
 * Groups progress by store and does a single setState per store.
 */
export function writeProgressToStores(merged: Record<string, ChallengeProgress>): void {
  const challengeBucket: Record<string, ChallengeProgress> = {};
  const mixingBucket: Record<string, ChallengeProgress> = {};
  const productionBucket: Record<string, ChallengeProgress> = {};
  const samplerBucket: Record<string, ChallengeProgress> = {};
  const drumSequencerBucket: Record<string, ChallengeProgress> = {};

  for (const [id, progress] of Object.entries(merged)) {
    const store = getStoreForChallenge(id);
    switch (store) {
      case 'challenge': challengeBucket[id] = progress; break;
      case 'mixing': mixingBucket[id] = progress; break;
      case 'production': productionBucket[id] = progress; break;
      case 'sampler': samplerBucket[id] = progress; break;
      case 'drum-sequencer': drumSequencerBucket[id] = progress; break;
    }
  }

  // Merge with existing store state (don't overwrite non-progress fields)
  if (Object.keys(challengeBucket).length > 0) {
    useChallengeStore.setState({
      progress: { ...useChallengeStore.getState().progress, ...challengeBucket },
    });
  }
  if (Object.keys(mixingBucket).length > 0) {
    useMixingStore.setState({
      progress: { ...useMixingStore.getState().progress, ...mixingBucket },
    });
  }
  if (Object.keys(productionBucket).length > 0) {
    useProductionStore.setState({
      progress: { ...useProductionStore.getState().progress, ...productionBucket },
    });
  }
  if (Object.keys(samplerBucket).length > 0) {
    useSamplerStore.setState({
      progress: { ...useSamplerStore.getState().progress, ...samplerBucket },
    });
  }
  if (Object.keys(drumSequencerBucket).length > 0) {
    useDrumSequencerStore.setState({
      progress: { ...useDrumSequencerStore.getState().progress, ...drumSequencerBucket },
    });
  }
}

/**
 * Get the store name for a challenge ID (exported for testing).
 */
export { getStoreForChallenge };
