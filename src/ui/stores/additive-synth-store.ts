/**
 * Zustand store for Additive synth state management
 * Bridges React UI with the AdditiveSynthEngine
 */

import { create } from 'zustand';
import { AdditiveSynthEngine, createAdditiveSynthEngine } from '../../core/additive-synth-engine.ts';
import type { AdditiveSynthParams, AdditivePreset } from '../../core/types.ts';
import { DEFAULT_ADDITIVE_SYNTH_PARAMS } from '../../core/types.ts';
import { ADDITIVE_PRESETS } from '../../data/presets/additive-presets.ts';

interface AdditiveSynthStore {
  // State
  params: AdditiveSynthParams;
  engine: AdditiveSynthEngine | null;
  isPlaying: boolean;
  currentNote: string;
  isInitialized: boolean;
  currentPreset: string;

  // Initialization
  initEngine: () => void;
  startAudio: () => Promise<void>;

  // Note control
  playNote: (note?: string) => void;
  stopNote: () => void;
  setCurrentNote: (note: string) => void;

  // Harmonic actions
  setHarmonic: (index: number, amplitude: number) => void;
  setHarmonics: (amplitudes: number[]) => void;
  applyPreset: (preset: AdditivePreset) => void;

  // Amplitude envelope actions
  setAmplitudeAttack: (time: number) => void;
  setAmplitudeDecay: (time: number) => void;
  setAmplitudeSustain: (level: number) => void;
  setAmplitudeRelease: (time: number) => void;

  // Effects actions
  setDistortionAmount: (amount: number) => void;
  setDistortionMix: (mix: number) => void;
  setDelayTime: (time: number) => void;
  setDelayFeedback: (feedback: number) => void;
  setDelayMix: (mix: number) => void;
  setReverbDecay: (decay: number) => void;
  setReverbMix: (mix: number) => void;
  setChorusRate: (rate: number) => void;
  setChorusDepth: (depth: number) => void;
  setChorusMix: (mix: number) => void;

  // Volume
  setVolume: (db: number) => void;

  // Reset
  resetToDefaults: () => void;

  // Presets
  loadPreset: (name: string) => void;

  // Cleanup
  dispose: () => void;
}

export const useAdditiveSynthStore = create<AdditiveSynthStore>((set, get) => ({
  // Initial state
  params: { ...DEFAULT_ADDITIVE_SYNTH_PARAMS },
  engine: null,
  isPlaying: false,
  currentNote: 'C4',
  isInitialized: false,
  currentPreset: 'Default',

  // Initialize the Additive synth engine
  initEngine: () => {
    const existingEngine = get().engine;
    if (existingEngine) {
      existingEngine.dispose();
    }
    const engine = createAdditiveSynthEngine(get().params);
    set({ engine });
  },

  // Start the audio context (requires user gesture)
  startAudio: async () => {
    const { engine } = get();
    if (engine && !get().isInitialized) {
      await engine.start();
      set({ isInitialized: true });
    }
  },

  // Play a note
  playNote: (note?: string) => {
    const { engine, currentNote, isInitialized } = get();
    if (!engine || !isInitialized) return;

    const noteToPlay = note ?? currentNote;
    engine.triggerAttack(noteToPlay);
    set({ isPlaying: true });
  },

  // Stop the current note
  stopNote: () => {
    const { engine } = get();
    if (!engine) return;

    engine.triggerRelease();
    set({ isPlaying: false });
  },

  // Set current note for keyboard
  setCurrentNote: (note: string) => {
    set({ currentNote: note });
  },

  // Harmonic actions
  setHarmonic: (index: number, amplitude: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setHarmonic(index, amplitude);
    set({ params: engine.getParams() });
  },

  setHarmonics: (amplitudes: number[]) => {
    const { engine } = get();
    if (!engine) return;

    engine.setHarmonics(amplitudes);
    set({ params: engine.getParams() });
  },

  applyPreset: (preset: AdditivePreset) => {
    const { engine } = get();
    if (!engine) return;

    engine.applyPreset(preset);
    set({ params: engine.getParams() });
  },

  // Amplitude envelope actions
  setAmplitudeAttack: (time: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setAmplitudeEnvelope({ attack: time });
    set({ params: engine.getParams() });
  },

  setAmplitudeDecay: (time: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setAmplitudeEnvelope({ decay: time });
    set({ params: engine.getParams() });
  },

  setAmplitudeSustain: (level: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setAmplitudeEnvelope({ sustain: level });
    set({ params: engine.getParams() });
  },

  setAmplitudeRelease: (time: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setAmplitudeEnvelope({ release: time });
    set({ params: engine.getParams() });
  },

  // Effects actions
  setDistortionAmount: (amount: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setDistortion({ amount });
    set({ params: engine.getParams() });
  },

  setDistortionMix: (mix: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setDistortion({ mix });
    set({ params: engine.getParams() });
  },

  setDelayTime: (time: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setDelay({ time });
    set({ params: engine.getParams() });
  },

  setDelayFeedback: (feedback: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setDelay({ feedback });
    set({ params: engine.getParams() });
  },

  setDelayMix: (mix: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setDelay({ mix });
    set({ params: engine.getParams() });
  },

  setReverbDecay: (decay: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setReverb({ decay });
    set({ params: engine.getParams() });
  },

  setReverbMix: (mix: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setReverb({ mix });
    set({ params: engine.getParams() });
  },

  setChorusRate: (rate: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setChorus({ rate });
    set({ params: engine.getParams() });
  },

  setChorusDepth: (depth: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setChorus({ depth });
    set({ params: engine.getParams() });
  },

  setChorusMix: (mix: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setChorus({ mix });
    set({ params: engine.getParams() });
  },

  // Volume
  setVolume: (db: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setVolume(db);
    set({ params: engine.getParams() });
  },

  // Reset
  resetToDefaults: () => {
    const { engine } = get();
    if (!engine) return;

    engine.setParams(DEFAULT_ADDITIVE_SYNTH_PARAMS);
    set({ params: engine.getParams(), currentPreset: 'Default' });
  },

  // Load preset
  loadPreset: (name: string) => {
    const { engine } = get();
    if (!engine) return;

    const preset = ADDITIVE_PRESETS.find((p) => p.name === name);
    if (preset) {
      engine.setParams(preset.params);
      set({ params: engine.getParams(), currentPreset: name });
    }
  },

  // Cleanup
  dispose: () => {
    const { engine } = get();
    if (engine) {
      engine.dispose();
      set({ engine: null, isInitialized: false });
    }
  },
}));
