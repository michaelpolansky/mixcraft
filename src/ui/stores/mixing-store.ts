/**
 * Mixing Challenge State Management
 * Handles mixing challenges with EQ and compressor controls
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MixingChallenge, ChallengeProgress, EQParams, CompressorFullParams, ParametricEQParams, ParametricBand } from '../../core/types.ts';
import { DEFAULT_EQ, DEFAULT_COMPRESSOR, DEFAULT_PARAMETRIC_BANDS } from '../../core/mixing-effects.ts';
import { extractMixingBreakdown } from '../../core/player-model.ts';

/** Per-track EQ parameters */
export interface TrackEQParams {
  low: number;
  mid: number;
  high: number;
  volume: number; // dB, 0 = unity
  pan: number; // -1 (left) to +1 (right), 0 = center
  reverbMix: number; // 0 to 100 (dry to wet percentage)
  reverbSize: number; // 0 to 100 (small to large room)
}

/** Result from mixing challenge evaluation */
export interface MixingScoreResult {
  overall: number;
  stars: 1 | 2 | 3;
  passed: boolean;
  breakdown: {
    eq?: { low: number; mid: number; high: number; total: number };
    compressor?: { threshold: number; amount: number; attack?: number; release?: number; total: number };
    tracks?: Record<string, { low: number; mid: number; high: number; total: number }>;
    busCompressor?: number;
    conditions?: { description: string; passed: boolean }[];
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

  // Player's current settings (single-track)
  eqParams: EQParams;
  compressorParams: CompressorFullParams;

  // Player's current settings (multi-track)
  trackParams: Record<string, TrackEQParams>;

  // Parametric EQ settings (single-track, for I-module challenges)
  parametricEQ: ParametricEQParams;
  // Parametric EQ settings (multi-track)
  trackParametricEQ: Record<string, ParametricEQParams>;

  // Bus-level settings (master bus processing)
  busEQParams: EQParams;

  // Progress tracking (persisted)
  progress: Record<string, ChallengeProgress>;

  // Actions - Challenge
  loadChallenge: (challenge: MixingChallenge) => void;
  exitChallenge: () => void;
  revealHint: () => void;
  startScoring: () => void;
  submitResult: (result: MixingScoreResult) => void;
  retry: () => void;

  // Actions - EQ (single-track)
  setEQLow: (value: number) => void;
  setEQMid: (value: number) => void;
  setEQHigh: (value: number) => void;
  resetEQ: () => void;

  // Actions - Track EQ (multi-track)
  setTrackEQLow: (trackId: string, value: number) => void;
  setTrackEQMid: (trackId: string, value: number) => void;
  setTrackEQHigh: (trackId: string, value: number) => void;
  setTrackVolume: (trackId: string, value: number) => void;
  setTrackPan: (trackId: string, value: number) => void;
  setTrackReverbMix: (trackId: string, value: number) => void;
  setTrackReverbSize: (trackId: string, value: number) => void;
  resetTrackEQ: (trackId: string) => void;

  // Actions - Parametric EQ (single-track)
  setParametricBand: (index: number, params: Partial<ParametricBand>) => void;
  // Actions - Parametric EQ (multi-track)
  setTrackParametricBand: (trackId: string, index: number, params: Partial<ParametricBand>) => void;

  // Actions - Compressor (bus)
  setCompressorThreshold: (value: number) => void;
  setCompressorAmount: (value: number) => void;
  setCompressorAttack: (value: number) => void;
  setCompressorRelease: (value: number) => void;
  resetCompressor: () => void;

  // Actions - Bus EQ
  setBusEQLow: (value: number) => void;
  setBusEQMid: (value: number) => void;
  setBusEQHigh: (value: number) => void;
  resetBusEQ: () => void;

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

const DEFAULT_TRACK_EQ: TrackEQParams = { low: 0, mid: 0, high: 0, volume: 0, pan: 0, reverbMix: 0, reverbSize: 50 };

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
      trackParams: {},
      parametricEQ: { bands: DEFAULT_PARAMETRIC_BANDS.map(b => ({ ...b })) as [ParametricBand, ParametricBand, ParametricBand, ParametricBand] },
      trackParametricEQ: {},
      busEQParams: { ...DEFAULT_EQ },
      progress: {},

      // Load a mixing challenge
      loadChallenge: (challenge: MixingChallenge) => {
        const existingProgress = get().progress[challenge.id];
        const attempts = existingProgress?.attempts ?? 0;

        // Initialize track params for multi-track challenges
        const trackParams: Record<string, TrackEQParams> = {};
        if (challenge.tracks) {
          for (const track of challenge.tracks) {
            trackParams[track.id] = {
              ...DEFAULT_TRACK_EQ,
              volume: track.initialVolume ?? 0,
              pan: track.initialPan ?? 0,
            };
          }
        }

        // Initialize parametric EQ per-track if needed
        const trackParametricEQ: Record<string, ParametricEQParams> = {};
        if (challenge.tracks && challenge.controls.eq === 'parametric') {
          for (const track of challenge.tracks) {
            trackParametricEQ[track.id] = {
              bands: DEFAULT_PARAMETRIC_BANDS.map(b => ({ ...b })) as [ParametricBand, ParametricBand, ParametricBand, ParametricBand],
            };
          }
        }

        set({
          currentChallenge: challenge,
          currentAttempt: attempts + 1,
          hintsRevealed: 0,
          isScoring: false,
          lastResult: null,
          eqParams: { ...DEFAULT_EQ },
          compressorParams: { ...DEFAULT_COMPRESSOR },
          trackParams,
          parametricEQ: { bands: DEFAULT_PARAMETRIC_BANDS.map(b => ({ ...b })) as [ParametricBand, ParametricBand, ParametricBand, ParametricBand] },
          trackParametricEQ,
          busEQParams: { ...DEFAULT_EQ },
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
        const isBestScore = result.overall >= existing.bestScore;
        const breakdown = extractMixingBreakdown(result);

        // Update progress if this is a better score
        const newProgress: ChallengeProgress = {
          challengeId,
          bestScore: Math.max(existing.bestScore, result.overall),
          stars: Math.max(existing.stars, result.passed ? result.stars : 0) as 0 | 1 | 2 | 3,
          attempts: existing.attempts + 1,
          completed: existing.completed || result.passed,
          breakdown: isBestScore ? breakdown : existing.breakdown,
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

        // Reset track params for multi-track challenges
        const trackParams: Record<string, TrackEQParams> = {};
        if (currentChallenge.tracks) {
          for (const track of currentChallenge.tracks) {
            trackParams[track.id] = {
              ...DEFAULT_TRACK_EQ,
              volume: track.initialVolume ?? 0,
              pan: track.initialPan ?? 0,
            };
          }
        }

        // Reset parametric EQ per-track if needed
        const trackParametricEQ: Record<string, ParametricEQParams> = {};
        if (currentChallenge.tracks && currentChallenge.controls.eq === 'parametric') {
          for (const track of currentChallenge.tracks) {
            trackParametricEQ[track.id] = {
              bands: DEFAULT_PARAMETRIC_BANDS.map(b => ({ ...b })) as [ParametricBand, ParametricBand, ParametricBand, ParametricBand],
            };
          }
        }

        set({
          currentAttempt: get().currentAttempt + 1,
          hintsRevealed: 0,
          isScoring: false,
          lastResult: null,
          eqParams: { ...DEFAULT_EQ },
          compressorParams: { ...DEFAULT_COMPRESSOR },
          trackParams,
          parametricEQ: { bands: DEFAULT_PARAMETRIC_BANDS.map(b => ({ ...b })) as [ParametricBand, ParametricBand, ParametricBand, ParametricBand] },
          trackParametricEQ,
          busEQParams: { ...DEFAULT_EQ },
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

      // Track EQ Actions (multi-track)
      setTrackEQLow: (trackId: string, value: number) => {
        const { trackParams } = get();
        const existing = trackParams[trackId] ?? { ...DEFAULT_TRACK_EQ };
        set({
          trackParams: {
            ...trackParams,
            [trackId]: { ...existing, low: value },
          },
        });
      },

      setTrackEQMid: (trackId: string, value: number) => {
        const { trackParams } = get();
        const existing = trackParams[trackId] ?? { ...DEFAULT_TRACK_EQ };
        set({
          trackParams: {
            ...trackParams,
            [trackId]: { ...existing, mid: value },
          },
        });
      },

      setTrackEQHigh: (trackId: string, value: number) => {
        const { trackParams } = get();
        const existing = trackParams[trackId] ?? { ...DEFAULT_TRACK_EQ };
        set({
          trackParams: {
            ...trackParams,
            [trackId]: { ...existing, high: value },
          },
        });
      },

      setTrackVolume: (trackId: string, value: number) => {
        const { trackParams } = get();
        const existing = trackParams[trackId] ?? { ...DEFAULT_TRACK_EQ };
        set({
          trackParams: {
            ...trackParams,
            [trackId]: { ...existing, volume: value },
          },
        });
      },

      setTrackPan: (trackId: string, value: number) => {
        const { trackParams } = get();
        const existing = trackParams[trackId] ?? { ...DEFAULT_TRACK_EQ };
        set({
          trackParams: {
            ...trackParams,
            [trackId]: { ...existing, pan: value },
          },
        });
      },

      setTrackReverbMix: (trackId: string, value: number) => {
        const { trackParams } = get();
        const existing = trackParams[trackId] ?? { ...DEFAULT_TRACK_EQ };
        set({
          trackParams: {
            ...trackParams,
            [trackId]: { ...existing, reverbMix: value },
          },
        });
      },

      setTrackReverbSize: (trackId: string, value: number) => {
        const { trackParams } = get();
        const existing = trackParams[trackId] ?? { ...DEFAULT_TRACK_EQ };
        set({
          trackParams: {
            ...trackParams,
            [trackId]: { ...existing, reverbSize: value },
          },
        });
      },

      resetTrackEQ: (trackId: string) => {
        const { currentChallenge } = get();
        const track = currentChallenge?.tracks?.find((t) => t.id === trackId);
        set((state) => ({
          trackParams: {
            ...state.trackParams,
            [trackId]: {
              ...DEFAULT_TRACK_EQ,
              volume: track?.initialVolume ?? 0,
              pan: track?.initialPan ?? 0,
            },
          },
        }));
      },

      // Parametric EQ Actions (single-track)
      setParametricBand: (index: number, params: Partial<ParametricBand>) => {
        const { parametricEQ } = get();
        const newBands = parametricEQ.bands.map((b, i) =>
          i === index ? { ...b, ...params } : { ...b }
        ) as [ParametricBand, ParametricBand, ParametricBand, ParametricBand];
        set({ parametricEQ: { bands: newBands } });
      },

      // Parametric EQ Actions (multi-track)
      setTrackParametricBand: (trackId: string, index: number, params: Partial<ParametricBand>) => {
        const { trackParametricEQ } = get();
        const existing = trackParametricEQ[trackId];
        if (!existing) return;
        const newBands = existing.bands.map((b, i) =>
          i === index ? { ...b, ...params } : { ...b }
        ) as [ParametricBand, ParametricBand, ParametricBand, ParametricBand];
        set({
          trackParametricEQ: {
            ...trackParametricEQ,
            [trackId]: { bands: newBands },
          },
        });
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

      // Bus EQ Actions
      setBusEQLow: (value: number) => {
        set((state) => ({
          busEQParams: { ...state.busEQParams, low: value },
        }));
      },

      setBusEQMid: (value: number) => {
        set((state) => ({
          busEQParams: { ...state.busEQParams, mid: value },
        }));
      },

      setBusEQHigh: (value: number) => {
        set((state) => ({
          busEQParams: { ...state.busEQParams, high: value },
        }));
      },

      resetBusEQ: () => {
        set({ busEQParams: { ...DEFAULT_EQ } });
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
