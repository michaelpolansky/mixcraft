/**
 * Zustand store for drum sequencer state management
 * Bridges React UI with the DrumSequencerEngine
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  DrumPattern,
  DrumSequencingChallenge,
  ChallengeProgress,
} from '../../core/types.ts';
import { DEFAULT_DRUM_PATTERN, DEFAULT_DRUM_SEQUENCER_PARAMS } from '../../core/types.ts';
import {
  DrumSequencerEngine,
  createDrumSequencerEngine,
} from '../../core/drum-sequencer-engine.ts';

/**
 * Score result for drum sequencing challenges
 */
export interface DrumSequencingScoreResult {
  overall: number; // 0-100
  stars: 1 | 2 | 3;
  passed: boolean;
  breakdown: {
    patternScore?: number;
    velocityScore?: number;
    swingScore?: number;
    tempoScore?: number;
  };
  feedback: string[];
}

interface DrumSequencerStore {
  // State
  engine: DrumSequencerEngine | null;
  isInitialized: boolean;
  isLoading: boolean;
  pattern: DrumPattern;
  currentStep: number;
  isPlaying: boolean;
  selectedTrack: number;
  volume: number;

  // Challenge state
  currentChallenge: DrumSequencingChallenge | null;
  currentAttempt: number;
  hintsRevealed: number;
  isScoring: boolean;
  lastResult: DrumSequencingScoreResult | null;

  // Progress tracking (persisted)
  progress: Record<string, ChallengeProgress>;

  // Initialization
  initEngine: () => Promise<void>;

  // Playback control
  start: () => void;
  stop: () => void;
  setTempo: (bpm: number) => void;
  setSwing: (amount: number) => void;

  // Pattern editing
  toggleStep: (trackIndex: number, stepIndex: number) => void;
  setStepVelocity: (trackIndex: number, stepIndex: number, velocity: number) => void;
  clearTrack: (trackIndex: number) => void;
  clearAll: () => void;
  loadPattern: (pattern: DrumPattern) => Promise<void>;

  // Track selection
  setSelectedTrack: (trackIndex: number) => void;

  // Volume
  setVolume: (db: number) => void;

  // Challenge actions
  loadChallenge: (challenge: DrumSequencingChallenge) => void;
  revealHint: () => void;
  startScoring: () => void;
  submitResult: (result: DrumSequencingScoreResult) => void;
  saveProgress: (challengeId: string, score: number, stars: 0 | 1 | 2 | 3) => void;
  retry: () => void;

  // Progress queries
  getChallengeProgress: (challengeId: string) => ChallengeProgress | undefined;
  getModuleProgress: (
    moduleId: string,
    allChallenges: DrumSequencingChallenge[]
  ) => { completed: number; total: number; stars: number };

  // Cleanup
  dispose: () => void;
}

/**
 * Deep clone a drum pattern to avoid mutations
 */
function clonePattern(pattern: DrumPattern): DrumPattern {
  return {
    name: pattern.name,
    tempo: pattern.tempo,
    swing: pattern.swing,
    stepCount: pattern.stepCount,
    tracks: pattern.tracks.map((track) => ({
      id: track.id,
      name: track.name,
      sampleUrl: track.sampleUrl,
      steps: track.steps.map((step) => ({ ...step })),
    })),
  };
}

export const useDrumSequencerStore = create<DrumSequencerStore>()(
  persist(
    (set, get) => ({
      // Initial state
      engine: null,
      isInitialized: false,
      isLoading: false,
      pattern: clonePattern(DEFAULT_DRUM_PATTERN),
      currentStep: 0,
      isPlaying: false,
      selectedTrack: 0,
      volume: DEFAULT_DRUM_SEQUENCER_PARAMS.volume,

      // Challenge state
      currentChallenge: null,
      currentAttempt: 1,
      hintsRevealed: 0,
      isScoring: false,
      lastResult: null,

      // Progress tracking
      progress: {},

      // Initialize the drum sequencer engine
      initEngine: async () => {
        const { engine: existingEngine, pattern, volume } = get();

        // Dispose existing engine if any
        if (existingEngine) {
          existingEngine.dispose();
        }

        set({ isLoading: true });

        try {
          // Create new engine with current pattern
          const engine = createDrumSequencerEngine({
            pattern: clonePattern(pattern),
            volume,
          });

          // Wire up step change callback to update store state
          engine.onStepChange((step) => {
            set({ currentStep: step });
          });

          // Start the engine (initializes audio context and loads samples)
          await engine.start();

          set({
            engine,
            isInitialized: true,
            isLoading: false,
          });
        } catch (error) {
          console.error('Failed to initialize drum sequencer engine:', error);
          set({ isLoading: false });
        }
      },

      // Start playback
      start: () => {
        const { engine, isInitialized } = get();
        if (!engine || !isInitialized || !engine.loaded) return;

        engine.play();
        set({ isPlaying: true });
      },

      // Stop playback
      stop: () => {
        const { engine } = get();
        if (!engine) return;

        engine.stop();
        set({ isPlaying: false, currentStep: 0 });
      },

      // Set tempo
      setTempo: (bpm: number) => {
        const { engine, pattern } = get();
        if (engine) {
          engine.setTempo(bpm);
        }
        set({
          pattern: {
            ...pattern,
            tempo: bpm,
          },
        });
      },

      // Set swing amount
      setSwing: (amount: number) => {
        const { engine, pattern } = get();
        if (engine) {
          engine.setSwing(amount);
        }
        set({
          pattern: {
            ...pattern,
            swing: amount,
          },
        });
      },

      // Toggle step on/off
      toggleStep: (trackIndex: number, stepIndex: number) => {
        if (trackIndex < 0 || trackIndex >= get().pattern.tracks.length) return;
        const track = get().pattern.tracks[trackIndex];
        if (!track || stepIndex < 0 || stepIndex >= track.steps.length) return;

        const { engine, pattern } = get();
        if (engine) {
          engine.toggleStep(trackIndex, stepIndex);
        }

        // Update local pattern state
        const newPattern = clonePattern(pattern);
        const newTrack = newPattern.tracks[trackIndex];
        if (newTrack && newTrack.steps[stepIndex]) {
          newTrack.steps[stepIndex].active = !newTrack.steps[stepIndex].active;
        }
        set({ pattern: newPattern });
      },

      // Set step velocity
      setStepVelocity: (trackIndex: number, stepIndex: number, velocity: number) => {
        if (trackIndex < 0 || trackIndex >= get().pattern.tracks.length) return;
        const track = get().pattern.tracks[trackIndex];
        if (!track || stepIndex < 0 || stepIndex >= track.steps.length) return;

        const { engine, pattern } = get();
        if (engine) {
          engine.setStepVelocity(trackIndex, stepIndex, velocity);
        }

        // Update local pattern state
        const newPattern = clonePattern(pattern);
        const newTrack = newPattern.tracks[trackIndex];
        if (newTrack && newTrack.steps[stepIndex]) {
          newTrack.steps[stepIndex].velocity = velocity;
        }
        set({ pattern: newPattern });
      },

      // Clear a track
      clearTrack: (trackIndex: number) => {
        const { engine, pattern } = get();
        if (engine) {
          engine.clearTrack(trackIndex);
        }

        // Update local pattern state
        const newPattern = clonePattern(pattern);
        const track = newPattern.tracks[trackIndex];
        if (track) {
          track.steps.forEach((step) => {
            step.active = false;
          });
        }
        set({ pattern: newPattern });
      },

      // Clear all tracks
      clearAll: () => {
        const { engine, pattern } = get();
        if (engine) {
          engine.clearAll();
        }

        // Update local pattern state
        const newPattern = clonePattern(pattern);
        newPattern.tracks.forEach((track) => {
          track.steps.forEach((step) => {
            step.active = false;
          });
        });
        set({ pattern: newPattern });
      },

      // Load a new pattern
      loadPattern: async (pattern: DrumPattern) => {
        const { engine, isInitialized } = get();

        // Stop playback
        if (engine && get().isPlaying) {
          engine.stop();
        }

        // Clone the pattern to avoid mutations
        const newPattern = clonePattern(pattern);

        // If engine is initialized, load pattern into it
        if (engine && isInitialized) {
          set({ isLoading: true });
          try {
            await engine.setPattern(newPattern);
            set({
              pattern: newPattern,
              isPlaying: false,
              currentStep: 0,
              isLoading: false,
            });
          } catch (error) {
            console.error('Failed to load pattern:', error);
            set({ isLoading: false });
          }
        } else {
          // Just update local state if engine not ready
          set({
            pattern: newPattern,
            isPlaying: false,
            currentStep: 0,
          });
        }
      },

      // Set selected track
      setSelectedTrack: (trackIndex: number) => {
        const { engine, pattern } = get();
        if (trackIndex >= 0 && trackIndex < pattern.tracks.length) {
          if (engine) {
            engine.setSelectedTrack(trackIndex);
          }
          set({ selectedTrack: trackIndex });
        }
      },

      // Set master volume
      setVolume: (db: number) => {
        const { engine } = get();
        if (engine) {
          engine.setVolume(db);
        }
        set({ volume: db });
      },

      // Load a drum sequencing challenge
      loadChallenge: (challenge: DrumSequencingChallenge) => {
        // Clone the starting pattern from the challenge
        const startingPattern = clonePattern(challenge.startingPattern);

        set({
          currentChallenge: challenge,
          currentAttempt: 1,
          hintsRevealed: 0,
          isScoring: false,
          lastResult: null,
          pattern: startingPattern,
          isPlaying: false,
          currentStep: 0,
        });

        // If engine is initialized, load the starting pattern
        const { engine, isInitialized } = get();
        if (engine && isInitialized) {
          set({ isLoading: true });
          engine.setPattern(startingPattern)
            .then(() => set({ isLoading: false }))
            .catch((error) => {
              console.error('Failed to load challenge pattern:', error);
              set({ isLoading: false });
            });
        }
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
      submitResult: (result: DrumSequencingScoreResult) => {
        set((state) => ({
          lastResult: result,
          isScoring: false,
          currentAttempt: state.currentAttempt + 1,
        }));
      },

      // Save progress for a challenge
      saveProgress: (challengeId: string, score: number, stars: 0 | 1 | 2 | 3) => {
        set((state) => {
          const existing = state.progress[challengeId];
          const isNewBest = !existing || score > existing.bestScore;

          return {
            progress: {
              ...state.progress,
              [challengeId]: {
                challengeId,
                bestScore: isNewBest ? score : existing.bestScore,
                stars: isNewBest ? stars : Math.max(existing.stars, stars) as 0 | 1 | 2 | 3,
                completed: true,
                attempts: (existing?.attempts ?? 0) + 1,
              },
            },
          } as Partial<DrumSequencerStore>;
        });
      },

      // Retry current challenge
      retry: () => {
        const { currentChallenge, currentAttempt } = get();
        if (!currentChallenge) return;

        // Reset to starting pattern
        const startingPattern = clonePattern(currentChallenge.startingPattern);

        set({
          lastResult: null,
          currentAttempt: currentAttempt + 1,
          pattern: startingPattern,
          isPlaying: false,
          currentStep: 0,
        });

        // Reload pattern into engine
        const { engine, isInitialized } = get();
        if (engine && isInitialized) {
          set({ isLoading: true });
          engine.setPattern(startingPattern)
            .then(() => set({ isLoading: false }))
            .catch((error) => {
              console.error('Failed to reset challenge pattern:', error);
              set({ isLoading: false });
            });
        }
      },

      // Get progress for a specific challenge
      getChallengeProgress: (challengeId: string) => {
        return get().progress[challengeId];
      },

      // Get progress for a module
      getModuleProgress: (moduleId: string, allChallenges: DrumSequencingChallenge[]) => {
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
          set({
            engine: null,
            isInitialized: false,
            isPlaying: false,
            currentStep: 0,
          });
        }
      },
    }),
    {
      name: 'mixcraft-drum-sequencing-progress',
      partialize: (state) => ({ progress: state.progress }),
    }
  )
);
