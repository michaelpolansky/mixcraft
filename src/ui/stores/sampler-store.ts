/**
 * Zustand store for sampler state management
 * Bridges React UI with the SamplerEngine
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SamplerParams, SamplingChallenge, ChallengeProgress } from '../../core/types.ts';
import { DEFAULT_SAMPLER_PARAMS } from '../../core/types.ts';
import { SamplerEngine, createSamplerEngine } from '../../core/sampler-engine.ts';
import type { SamplingScoreResult } from '../../core/sampling-evaluation.ts';

interface SamplerStore {
  // State
  engine: SamplerEngine | null;
  isInitialized: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  params: SamplerParams;

  // Challenge state
  currentChallenge: SamplingChallenge | null;
  currentAttempt: number;
  hintsRevealed: number;
  isScoring: boolean;
  lastResult: SamplingScoreResult | null;

  // Progress tracking (persisted)
  progress: Record<string, ChallengeProgress>;

  // Initialization
  initEngine: () => void;

  // Sample loading
  loadSample: (url: string, name?: string) => Promise<void>;

  // Playback control
  play: () => void;
  stop: () => void;
  triggerSlice: (index: number) => void;

  // Parameter setters
  setPitch: (semitones: number) => void;
  setTimeStretch: (ratio: number) => void;
  setStartPoint: (point: number) => void;
  setEndPoint: (point: number) => void;
  setLoop: (enabled: boolean) => void;
  setReverse: (enabled: boolean) => void;
  setVolume: (db: number) => void;

  // Slice management
  addSlice: (start: number, end: number) => void;
  removeSlice: (id: string) => void;
  autoSlice: (numSlices?: number) => void;
  setSelectedSlice: (index: number) => void;

  // Utility
  getAnalyser: () => AnalyserNode | null;
  getWaveformData: () => Float32Array | null;
  resetToDefaults: () => void;

  // Challenge actions
  loadChallenge: (challenge: SamplingChallenge) => void;
  revealHint: () => void;
  startScoring: () => void;
  submitResult: (result: SamplingScoreResult) => void;
  saveProgress: (challengeId: string, score: number, stars: number) => void;
  retry: () => void;

  // Progress queries
  getChallengeProgress: (challengeId: string) => ChallengeProgress | undefined;
  getModuleProgress: (moduleId: string, allChallenges: SamplingChallenge[]) => { completed: number; total: number; stars: number };

  // Cleanup
  dispose: () => void;
}

export const useSamplerStore = create<SamplerStore>()(
  persist(
    (set, get) => ({
      // Initial state
      engine: null,
      isInitialized: false,
      isPlaying: false,
      isLoading: false,
      params: { ...DEFAULT_SAMPLER_PARAMS },

      // Challenge state
      currentChallenge: null,
      currentAttempt: 1,
      hintsRevealed: 0,
      isScoring: false,
      lastResult: null,

      // Progress tracking
      progress: {},

      // Initialize the sampler engine
  initEngine: () => {
    const existingEngine = get().engine;
    if (existingEngine) {
      existingEngine.dispose();
    }
    const engine = createSamplerEngine(get().params);
    set({ engine });
  },

  // Load a sample from URL
  loadSample: async (url: string, name?: string) => {
    const { engine } = get();
    if (!engine) return;

    set({ isLoading: true });

    try {
      // Ensure audio context is started
      await engine.ensureStarted();
      set({ isInitialized: true });

      // Load the sample
      await engine.loadSample(url, name ?? 'Sample');

      // Sync params from engine
      set({ params: engine.getParams(), isLoading: false });
    } catch (error) {
      console.error('Failed to load sample:', error);
      set({ isLoading: false });
    }
  },

  // Start playback
  play: () => {
    const { engine, isInitialized } = get();
    if (!engine || !isInitialized || !engine.loaded) return;

    engine.start();
    set({ isPlaying: true });
  },

  // Stop playback
  stop: () => {
    const { engine } = get();
    if (!engine) return;

    engine.stop();
    set({ isPlaying: false });
  },

  // Trigger a specific slice
  triggerSlice: (index: number) => {
    const { engine, isInitialized } = get();
    if (!engine || !isInitialized) return;

    engine.triggerSlice(index);
    set({ isPlaying: true });
  },

  // Set pitch shift in semitones
  setPitch: (semitones: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setPitch(semitones);
    set({ params: engine.getParams() });
  },

  // Set time stretch ratio
  setTimeStretch: (ratio: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setTimeStretch(ratio);
    set({ params: engine.getParams() });
  },

  // Set start point (0-1 normalized)
  setStartPoint: (point: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setStartPoint(point);
    set({ params: engine.getParams() });
  },

  // Set end point (0-1 normalized)
  setEndPoint: (point: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setEndPoint(point);
    set({ params: engine.getParams() });
  },

  // Enable/disable loop mode
  setLoop: (enabled: boolean) => {
    const { engine } = get();
    if (!engine) return;

    engine.setLoop(enabled);
    set({ params: engine.getParams() });
  },

  // Enable/disable reverse playback
  setReverse: (enabled: boolean) => {
    const { engine } = get();
    if (!engine) return;

    engine.setReverse(enabled);
    set({ params: engine.getParams() });
  },

  // Set volume in dB
  setVolume: (db: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setVolume(db);
    set({ params: engine.getParams() });
  },

  // Add a new slice
  addSlice: (start: number, end: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.addSlice(start, end);
    set({ params: engine.getParams() });
  },

  // Remove a slice by ID
  removeSlice: (id: string) => {
    const { engine } = get();
    if (!engine) return;

    engine.removeSlice(id);
    set({ params: engine.getParams() });
  },

  // Automatically divide sample into equal slices
  autoSlice: (numSlices: number = 8) => {
    const { engine } = get();
    if (!engine) return;

    engine.autoSlice(numSlices);
    set({ params: engine.getParams() });
  },

  // Set the currently selected slice index
  setSelectedSlice: (index: number) => {
    const { engine } = get();
    if (!engine) return;
    engine.setSelectedSlice(index);
    set({ params: engine.getParams() });
  },

  // Get the analyser node for visualization
  getAnalyser: () => {
    const { engine } = get();
    return engine?.getAnalyser() ?? null;
  },

  // Get waveform data for visualization
  getWaveformData: () => {
    const { engine } = get();
    return engine?.getWaveformData() ?? null;
  },

  // Reset sampler params to defaults
  resetToDefaults: () => {
    const { engine } = get();
    if (!engine) return;
    engine.setParams(DEFAULT_SAMPLER_PARAMS);
    set({ params: engine.getParams() });
  },

  // Load a sampling challenge
  loadChallenge: (challenge: SamplingChallenge) => {
    const { engine } = get();
    if (engine) {
      engine.setParams(DEFAULT_SAMPLER_PARAMS);
    }
    set({
      currentChallenge: challenge,
      currentAttempt: 1,
      hintsRevealed: 0,
      isScoring: false,
      lastResult: null,
      params: engine ? engine.getParams() : { ...DEFAULT_SAMPLER_PARAMS },
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

      // Submit scoring result
      submitResult: (result: SamplingScoreResult) => {
        set((state) => ({
          lastResult: result,
          isScoring: false,
          currentAttempt: state.currentAttempt + 1,
        }));
      },

      // Save progress for a challenge
      saveProgress: (challengeId: string, score: number, stars: number) => {
        set((state) => {
          const existing = state.progress[challengeId];
          const isNewBest = !existing || score > existing.bestScore;

          return {
            progress: {
              ...state.progress,
              [challengeId]: {
                challengeId,
                bestScore: isNewBest ? score : existing.bestScore,
                stars: isNewBest ? stars : Math.max(existing.stars, stars),
                completed: true,
                attempts: (existing?.attempts ?? 0) + 1,
              },
            },
          } as Partial<SamplerStore>;
        });
      },

      // Retry current challenge
      retry: () => {
        const { engine, currentAttempt } = get();
        if (engine) {
          engine.setParams(DEFAULT_SAMPLER_PARAMS);
        }
        set({
          lastResult: null,
          currentAttempt: currentAttempt + 1,
          params: engine ? engine.getParams() : { ...DEFAULT_SAMPLER_PARAMS },
        });
      },

      // Get progress for a specific challenge
      getChallengeProgress: (challengeId: string) => {
        return get().progress[challengeId];
      },

      // Get progress for a module
      getModuleProgress: (moduleId: string, allChallenges: SamplingChallenge[]) => {
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

      // Cleanup
      dispose: () => {
        const { engine } = get();
        if (engine) {
          engine.dispose();
          set({ engine: null, isInitialized: false, isPlaying: false });
        }
      },
    }),
    {
      name: 'mixcraft-sampling-progress',
      partialize: (state) => ({ progress: state.progress }),
    }
  )
);
