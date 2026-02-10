/**
 * usePlayerModel Hook
 *
 * Reads all 5 stores' progress, computes skill scores, weaknesses,
 * and recommendations. Memoized to avoid recomputation on every render.
 */

import { useMemo } from 'react';
import { useChallengeStore } from '../stores/challenge-store.ts';
import { useMixingStore } from '../stores/mixing-store.ts';
import { useProductionStore } from '../stores/production-store.ts';
import { useSamplerStore } from '../stores/sampler-store.ts';
import { useDrumSequencerStore } from '../stores/drum-sequencer-store.ts';
import {
  computeSkillScores,
  getWeaknesses,
  getRecommendations,
  type SkillScore,
  type Weakness,
  type Recommendation,
} from '../../core/player-model.ts';
import type { ChallengeProgress } from '../../core/types.ts';
import type { ChallengeMenuEntry } from '../../data/challenges/menu-metadata.ts';
import {
  sdMenuChallenges,
  mixingMenuChallenges,
  productionMenuChallenges,
  samplingMenuChallenges,
  drumSequencingMenuChallenges,
} from '../../data/challenges/menu-metadata.ts';

interface PlayerModel {
  skills: SkillScore[];
  weaknesses: Weakness[];
  recommendations: Recommendation[];
  totalAttempted: number;
}

/** Combine all challenge metadata into a single list */
const allChallenges: ChallengeMenuEntry[] = [
  ...sdMenuChallenges,
  ...mixingMenuChallenges,
  ...productionMenuChallenges,
  ...samplingMenuChallenges,
  ...drumSequencingMenuChallenges,
];

export function usePlayerModel(): PlayerModel {
  // Read progress from all 5 stores
  const sdProgress = useChallengeStore((s) => s.progress);
  const mixProgress = useMixingStore((s) => s.progress);
  const prodProgress = useProductionStore((s) => s.progress);
  const samplerProgress = useSamplerStore((s) => s.progress);
  const drumProgress = useDrumSequencerStore((s) => s.progress);

  return useMemo(() => {
    // Merge all progress into one flat record
    const allProgress: Record<string, ChallengeProgress> = {
      ...sdProgress,
      ...mixProgress,
      ...prodProgress,
      ...samplerProgress,
      ...drumProgress,
    };

    const totalAttempted = Object.values(allProgress).filter(p => p.attempts > 0).length;

    const skills = computeSkillScores(allProgress);
    const weaknesses = getWeaknesses(skills);
    const recommendations = getRecommendations(weaknesses, allProgress, allChallenges);

    return { skills, weaknesses, recommendations, totalAttempted };
  }, [sdProgress, mixProgress, prodProgress, samplerProgress, drumProgress]);
}
