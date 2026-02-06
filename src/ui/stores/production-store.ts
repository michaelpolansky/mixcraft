/**
 * Production Challenge State Management
 * Handles multi-layer production challenges
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProductionChallenge, ChallengeProgress } from '../../core/types.ts';
import type { LayerState } from '../../core/production-source.ts';
import { LAYER_RANGES } from '../../core/production-source.ts';
import type { ProductionScoreResult } from '../../core/production-evaluation.ts';

interface ProductionStore {
  // Current challenge state
  currentChallenge: ProductionChallenge | null;
  currentAttempt: number;
  hintsRevealed: number;
  isScoring: boolean;
  lastResult: ProductionScoreResult | null;

  // Layer states (managed separately from audio engine)
  layerStates: LayerState[];

  // Progress tracking (persisted)
  progress: Record<string, ChallengeProgress>;

  // Actions - Challenge
  loadChallenge: (challenge: ProductionChallenge) => void;
  exitChallenge: () => void;
  revealHint: () => void;
  startScoring: () => void;
  submitResult: (result: ProductionScoreResult) => void;
  retry: () => void;

  // Actions - Layer controls
  setLayerVolume: (layerId: string, volume: number) => void;
  setLayerPan: (layerId: string, pan: number) => void;
  setLayerMuted: (layerId: string, muted: boolean) => void;
  setLayerSolo: (layerId: string, solo: boolean) => void;
  setLayerEQLow: (layerId: string, db: number) => void;
  setLayerEQHigh: (layerId: string, db: number) => void;
  resetLayers: () => void;

  // Progress queries
  getChallengeProgress: (challengeId: string) => ChallengeProgress | undefined;
  getModuleProgress: (moduleId: string, allChallenges: ProductionChallenge[]) => {
    completed: number;
    total: number;
    stars: number;
  };
}

const initialProgress: ChallengeProgress = {
  challengeId: '',
  bestScore: 0,
  stars: 0,
  attempts: 0,
  completed: false,
};

/**
 * Create initial layer states from challenge config
 */
function createInitialLayerStates(challenge: ProductionChallenge): LayerState[] {
  return challenge.layers.map((layer) => ({
    id: layer.id,
    name: layer.name,
    volume: layer.initialVolume ?? 0,
    pan: layer.initialPan ?? 0,
    muted: layer.initialMuted ?? false,
    solo: false,
    eqLow: 0,
    eqHigh: 0,
  }));
}

export const useProductionStore = create<ProductionStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentChallenge: null,
      currentAttempt: 0,
      hintsRevealed: 0,
      isScoring: false,
      lastResult: null,
      layerStates: [],
      progress: {},

      // Load a production challenge
      loadChallenge: (challenge: ProductionChallenge) => {
        const existingProgress = get().progress[challenge.id];
        const attempts = existingProgress?.attempts ?? 0;

        set({
          currentChallenge: challenge,
          currentAttempt: attempts + 1,
          hintsRevealed: 0,
          isScoring: false,
          lastResult: null,
          layerStates: createInitialLayerStates(challenge),
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
          layerStates: [],
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
      submitResult: (result: ProductionScoreResult) => {
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
          layerStates: createInitialLayerStates(currentChallenge),
        });
      },

      // Layer control actions
      setLayerVolume: (layerId: string, volume: number) => {
        set((state) => ({
          layerStates: state.layerStates.map((layer) =>
            layer.id === layerId
              ? {
                  ...layer,
                  volume: Math.max(
                    LAYER_RANGES.volume.min,
                    Math.min(LAYER_RANGES.volume.max, volume)
                  ),
                }
              : layer
          ),
        }));
      },

      setLayerPan: (layerId: string, pan: number) => {
        set((state) => ({
          layerStates: state.layerStates.map((layer) =>
            layer.id === layerId
              ? {
                  ...layer,
                  pan: Math.max(LAYER_RANGES.pan.min, Math.min(LAYER_RANGES.pan.max, pan)),
                }
              : layer
          ),
        }));
      },

      setLayerMuted: (layerId: string, muted: boolean) => {
        set((state) => ({
          layerStates: state.layerStates.map((layer) =>
            layer.id === layerId ? { ...layer, muted } : layer
          ),
        }));
      },

      setLayerSolo: (layerId: string, solo: boolean) => {
        set((state) => ({
          layerStates: state.layerStates.map((layer) =>
            layer.id === layerId ? { ...layer, solo } : layer
          ),
        }));
      },

      setLayerEQLow: (layerId: string, db: number) => {
        set((state) => ({
          layerStates: state.layerStates.map((layer) =>
            layer.id === layerId
              ? {
                  ...layer,
                  eqLow: Math.max(LAYER_RANGES.eqLow.min, Math.min(LAYER_RANGES.eqLow.max, db)),
                }
              : layer
          ),
        }));
      },

      setLayerEQHigh: (layerId: string, db: number) => {
        set((state) => ({
          layerStates: state.layerStates.map((layer) =>
            layer.id === layerId
              ? {
                  ...layer,
                  eqHigh: Math.max(
                    LAYER_RANGES.eqHigh.min,
                    Math.min(LAYER_RANGES.eqHigh.max, db)
                  ),
                }
              : layer
          ),
        }));
      },

      resetLayers: () => {
        const { currentChallenge } = get();
        if (!currentChallenge) return;

        set({
          layerStates: createInitialLayerStates(currentChallenge),
        });
      },

      // Get progress for a specific challenge
      getChallengeProgress: (challengeId: string) => {
        return get().progress[challengeId];
      },

      // Get progress for a module
      getModuleProgress: (moduleId: string, allChallenges: ProductionChallenge[]) => {
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
      name: 'mixcraft-production-progress',
      partialize: (state) => ({ progress: state.progress }),
    }
  )
);
