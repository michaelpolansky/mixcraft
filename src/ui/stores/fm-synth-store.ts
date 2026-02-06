/**
 * Zustand store for FM synth state management
 * Bridges React UI with the FMSynthEngine
 */

import { create } from 'zustand';
import { FMSynthEngine, createFMSynthEngine } from '../../core/fm-synth-engine.ts';
import type { FMSynthParams, OscillatorType, ADSREnvelope } from '../../core/types.ts';
import { DEFAULT_FM_SYNTH_PARAMS, HARMONICITY_PRESETS } from '../../core/types.ts';

interface FMSynthStore {
  // State
  params: FMSynthParams;
  engine: FMSynthEngine | null;
  isPlaying: boolean;
  currentNote: string;
  isInitialized: boolean;

  // Initialization
  initEngine: () => void;
  startAudio: () => Promise<void>;

  // Note control
  playNote: (note?: string) => void;
  stopNote: () => void;
  setCurrentNote: (note: string) => void;

  // FM-specific actions
  setHarmonicity: (ratio: number) => void;
  setHarmonicityPreset: (preset: number) => void;
  setModulationIndex: (index: number) => void;
  setCarrierType: (type: OscillatorType) => void;
  setModulatorType: (type: OscillatorType) => void;
  setModulationEnvelopeAmount: (amount: number) => void;

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

  // Cleanup
  dispose: () => void;
}

export const useFMSynthStore = create<FMSynthStore>((set, get) => ({
  // Initial state
  params: { ...DEFAULT_FM_SYNTH_PARAMS },
  engine: null,
  isPlaying: false,
  currentNote: 'C4',
  isInitialized: false,

  // Initialize the FM synth engine
  initEngine: () => {
    const existingEngine = get().engine;
    if (existingEngine) {
      existingEngine.dispose();
    }
    const engine = createFMSynthEngine(get().params);
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

  // FM-specific actions
  setHarmonicity: (ratio: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setHarmonicity(ratio);
    set({ params: engine.getParams() });
  },

  setHarmonicityPreset: (preset: number) => {
    const { engine } = get();
    if (!engine) return;

    // Find the closest preset value
    const presetValue = HARMONICITY_PRESETS.includes(preset as typeof HARMONICITY_PRESETS[number])
      ? preset
      : HARMONICITY_PRESETS[0];

    engine.setHarmonicity(presetValue);
    set({ params: engine.getParams() });
  },

  setModulationIndex: (index: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setModulationIndex(index);
    set({ params: engine.getParams() });
  },

  setCarrierType: (type: OscillatorType) => {
    const { engine } = get();
    if (!engine) return;

    engine.setCarrierType(type);
    set({ params: engine.getParams() });
  },

  setModulatorType: (type: OscillatorType) => {
    const { engine } = get();
    if (!engine) return;

    engine.setModulatorType(type);
    set({ params: engine.getParams() });
  },

  setModulationEnvelopeAmount: (amount: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.setModulationEnvelopeAmount(amount);
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

    engine.setParams(DEFAULT_FM_SYNTH_PARAMS);
    set({ params: engine.getParams() });
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
