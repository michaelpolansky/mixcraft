/**
 * Mixing Challenge State Management
 * Handles mixing challenges with EQ and compressor controls
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MixingChallenge, ChallengeProgress, EQParams, CompressorFullParams } from '../../core/types.ts';
import { DEFAULT_EQ, DEFAULT_COMPRESSOR } from '../../core/mixing-effects.ts';

/** Result from mixing challenge evaluation */
export interface MixingScoreResult {
  overall: number;
  stars: 1 | 2 | 3;
  passed: boolean;
  breakdown: {
    eq?: { low: number; mid: number; high: number; total: number };
    compressor?: { threshold: number; amount: number; attack?: number; release?: number; total: number };
  };
  feedback: string[];
}

interface MixingStore {
  // Current challenge state
  currentChallenge: MixingChallenge | null;
  currentAttempt: number;
  hintsRevealed: number;
  isScoring: boolean;
  lastResult: MixingScoreResult | null;

  // Player's current settings
  eqParams: EQParams;
  compressorParams: CompressorFullParams;

  // Progress tracking (persisted)
  progress: Record<string, ChallengeProgress>;

  // Actions - Challenge
  loadChallenge: (challenge: MixingChallenge) => void;
  exitChallenge: () => void;
  revealHint: () => void;
  startScoring: () => void;
  submitResult: (result: MixingScoreResult) => void;
  retry: () => void;

  // Actions - EQ
  setEQLow: (value: number) => void;
  setEQMid: (value: number) => void;
  setEQHigh: (value: number) => void;
  resetEQ: () => void;

  // Actions - Compressor
  setCompressorThreshold: (value: number) => void;
  setCompressorAmount: (value: number) => void;
  setCompressorAttack: (value: number) => void;
  setCompressorRelease: (value: number) => void;
  resetCompressor: () => void;

  // Progress queries
  getChallengeProgress: (challengeId: string) => ChallengeProgress | undefined;
  getModuleProgress: (moduleId: string, allChallenges: MixingChallenge[]) => { completed: number; total: number; stars: number };
}

const initialProgress: ChallengeProgress = {
  challengeId: '',
  bestScore: 0,
  stars: 0,
  attempts: 0,
  completed: false,
};

export const useMixingStore = create<MixingStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentChallenge: null,
      currentAttempt: 0,
      hintsRevealed: 0,
      isScoring: false,
      lastResult: null,
      eqParams: { ...DEFAULT_EQ },
      compressorParams: { ...DEFAULT_COMPRESSOR },
      progress: {},

      // Load a mixing challenge
      loadChallenge: (challenge: MixingChallenge) => {
        const existingProgress = get().progress[challenge.id];
        const attempts = existingProgress?.attempts ?? 0;

        set({
          currentChallenge: challenge,
          currentAttempt: attempts + 1,
          hintsRevealed: 0,
          isScoring: false,
          lastResult: null,
          eqParams: { ...DEFAULT_EQ },
          compressorParams: { ...DEFAULT_COMPRESSOR },
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
      submitResult: (result: MixingScoreResult) => {
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

      // Retry current challenge
      retry: () => {
        const { currentChallenge } = get();
        if (!currentChallenge) return;

        set({
          currentAttempt: get().currentAttempt + 1,
          hintsRevealed: 0,
          isScoring: false,
          lastResult: null,
          eqParams: { ...DEFAULT_EQ },
          compressorParams: { ...DEFAULT_COMPRESSOR },
        });
      },

      // EQ Actions
      setEQLow: (value: number) => {
        set((state) => ({
          eqParams: { ...state.eqParams, low: value },
        }));
      },

      setEQMid: (value: number) => {
        set((state) => ({
          eqParams: { ...state.eqParams, mid: value },
        }));
      },

      setEQHigh: (value: number) => {
        set((state) => ({
          eqParams: { ...state.eqParams, high: value },
        }));
      },

      resetEQ: () => {
        set({ eqParams: { ...DEFAULT_EQ } });
      },

      // Compressor Actions
      setCompressorThreshold: (value: number) => {
        set((state) => ({
          compressorParams: { ...state.compressorParams, threshold: value },
        }));
      },

      setCompressorAmount: (value: number) => {
        set((state) => ({
          compressorParams: { ...state.compressorParams, amount: value },
        }));
      },

      setCompressorAttack: (value: number) => {
        set((state) => ({
          compressorParams: { ...state.compressorParams, attack: value },
        }));
      },

      setCompressorRelease: (value: number) => {
        set((state) => ({
          compressorParams: { ...state.compressorParams, release: value },
        }));
      },

      resetCompressor: () => {
        set({ compressorParams: { ...DEFAULT_COMPRESSOR } });
      },

      // Get progress for a specific challenge
      getChallengeProgress: (challengeId: string) => {
        return get().progress[challengeId];
      },

      // Get progress for a module
      getModuleProgress: (moduleId: string, allChallenges: MixingChallenge[]) => {
        const { progress } = get();
        const moduleChallenges = allChallenges.filter((c) => c.module === moduleId);

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
    }),
    {
      name: 'mixcraft-mixing-progress',
      partialize: (state) => ({ progress: state.progress }),
    }
  )
);
