/**
 * Challenge State Management
 * Handles current challenge, progress tracking, and persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Challenge, ChallengeProgress } from '../../core/types.ts';
import type { ScoreResult } from '../../core/sound-comparison.ts';
import { getChallenge, getNextChallenge, allChallenges } from '../../data/challenges/index.ts';

interface ChallengeStore {
  // Current challenge state
  currentChallenge: Challenge | null;
  currentAttempt: number;
  hintsRevealed: number;
  isScoring: boolean;
  lastResult: ScoreResult | null;

  // Progress tracking (persisted)
  progress: Record<string, ChallengeProgress>;

  // Actions
  loadChallenge: (challengeId: string) => void;
  exitChallenge: () => void;
  revealHint: () => void;
  startScoring: () => void;
  submitResult: (result: ScoreResult) => void;
  nextChallenge: () => void;
  retry: () => void;

  // Progress queries
  getChallengeProgress: (challengeId: string) => ChallengeProgress | undefined;
  getModuleProgress: (moduleId: string) => { completed: number; total: number; stars: number };
  getTotalProgress: () => { completed: number; total: number; stars: number };
}

const initialProgress: ChallengeProgress = {
  challengeId: '',
  bestScore: 0,
  stars: 0,
  attempts: 0,
  completed: false,
};

export const useChallengeStore = create<ChallengeStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentChallenge: null,
      currentAttempt: 0,
      hintsRevealed: 0,
      isScoring: false,
      lastResult: null,
      progress: {},

      // Load a challenge by ID
      loadChallenge: (challengeId: string) => {
        const challenge = getChallenge(challengeId);
        if (!challenge) {
          console.error(`Challenge not found: ${challengeId}`);
          return;
        }

        const existingProgress = get().progress[challengeId];
        const attempts = existingProgress?.attempts ?? 0;

        set({
          currentChallenge: challenge,
          currentAttempt: attempts + 1,
          hintsRevealed: 0,
          isScoring: false,
          lastResult: null,
        });
      },

      // Exit the current challenge
      exitChallenge: () => {
        set({
          currentChallenge: null,
          currentAttempt: 0,
          hintsRevealed: 0,
          isScoring: false,
          lastResult: null,
        });
      },

      // Reveal the next hint
      revealHint: () => {
        const { currentChallenge, hintsRevealed } = get();
        if (!currentChallenge) return;

        const maxHints = currentChallenge.hints.length;
        if (hintsRevealed < maxHints) {
          set({ hintsRevealed: hintsRevealed + 1 });
        }
      },

      // Start the scoring process
      startScoring: () => {
        set({ isScoring: true });
      },

      // Submit scoring result and update progress
      submitResult: (result: ScoreResult) => {
        const { currentChallenge, progress } = get();
        if (!currentChallenge) return;

        const challengeId = currentChallenge.id;
        const existing = progress[challengeId] ?? { ...initialProgress, challengeId };

        // Update progress if this is a better score
        const newProgress: ChallengeProgress = {
          challengeId,
          bestScore: Math.max(existing.bestScore, result.overall),
          stars: Math.max(existing.stars, result.passed ? result.stars : 0) as 0 | 1 | 2 | 3,
          attempts: existing.attempts + 1,
          completed: existing.completed || result.passed,
        };

        set({
          isScoring: false,
          lastResult: result,
          progress: {
            ...progress,
            [challengeId]: newProgress,
          },
        });
      },

      // Move to next challenge
      nextChallenge: () => {
        const { currentChallenge } = get();
        if (!currentChallenge) return;

        const next = getNextChallenge(currentChallenge.id);
        if (next) {
          get().loadChallenge(next.id);
        } else {
          // No more challenges, exit to menu
          get().exitChallenge();
        }
      },

      // Retry current challenge
      retry: () => {
        const { currentChallenge } = get();
        if (!currentChallenge) return;

        set({
          currentAttempt: get().currentAttempt + 1,
          hintsRevealed: 0,
          isScoring: false,
          lastResult: null,
        });
      },

      // Get progress for a specific challenge
      getChallengeProgress: (challengeId: string) => {
        return get().progress[challengeId];
      },

      // Get progress for a module
      getModuleProgress: (moduleId: string) => {
        const { progress } = get();
        const moduleChallenges = allChallenges.filter(c => c.module === moduleId);

        let completed = 0;
        let stars = 0;

        for (const challenge of moduleChallenges) {
          const p = progress[challenge.id];
          if (p?.completed) completed++;
          stars += p?.stars ?? 0;
        }

        return {
          completed,
          total: moduleChallenges.length,
          stars,
        };
      },

      // Get total progress across all challenges
      getTotalProgress: () => {
        const { progress } = get();

        let completed = 0;
        let stars = 0;

        for (const challenge of allChallenges) {
          const p = progress[challenge.id];
          if (p?.completed) completed++;
          stars += p?.stars ?? 0;
        }

        return {
          completed,
          total: allChallenges.length,
          stars,
        };
      },
    }),
    {
      name: 'mixcraft-challenge-progress',
      partialize: (state) => ({ progress: state.progress }),
    }
  )
);
