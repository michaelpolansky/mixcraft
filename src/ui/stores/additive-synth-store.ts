/**
 * Zustand store for Additive synth state management
 * Bridges React UI with the AdditiveSynthEngine
 */

import { create } from 'zustand';
import { AdditiveSynthEngine, createAdditiveSynthEngine } from '../../core/additive-synth-engine.ts';
import type {
  AdditiveSynthParams,
  AdditivePreset,
  LFOWaveform,
  AdditiveLFODestination,
  NoiseType,
  ArpPattern,
  ArpDivision,
} from '../../core/types.ts';
import { DEFAULT_ADDITIVE_SYNTH_PARAMS } from '../../core/types.ts';
import { ADDITIVE_PRESETS } from '../../data/presets/additive-presets.ts';

interface AdditiveSynthStore {
  // State
  params: AdditiveSynthParams;
  engine: AdditiveSynthEngine | null;
  isPlaying: boolean;
  currentNote: string;
  isInitialized: boolean;
  isInitializing: boolean;
  initError: string | null;
  currentPreset: string;

  // Initialization
  initEngine: () => void;
  startAudio: () => Promise<void>;

  // Note control
  playNote: (note?: string) => void;
  stopNote: (note?: string) => void;
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

  // LFO actions
  setLFORate: (rate: number) => void;
  setLFODepth: (depth: number) => void;
  setLFOWaveform: (waveform: LFOWaveform) => void;
  setLFODestination: (destination: AdditiveLFODestination) => void;

  // Noise actions
  setNoiseType: (type: NoiseType) => void;
  setNoiseLevel: (level: number) => void;

  // Glide actions
  setGlideEnabled: (enabled: boolean) => void;
  setGlideTime: (time: number) => void;

  // Pan action
  setPan: (pan: number) => void;

  // Velocity actions
  setVelocityAmpAmount: (amount: number) => void;
  setVelocityBrightnessAmount: (amount: number) => void;

  // Arpeggiator actions
  setArpEnabled: (enabled: boolean) => void;
  setArpPattern: (pattern: ArpPattern) => void;
  setArpDivision: (division: ArpDivision) => void;
  setArpOctaves: (octaves: 1 | 2 | 3 | 4) => void;
  setArpGate: (gate: number) => void;

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
  isInitializing: false,
  initError: null,
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
    if (engine && !get().isInitialized && !get().isInitializing) {
      set({ isInitializing: true, initError: null });
      try {
        await engine.start();
        set({ isInitialized: true, isInitializing: false });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        // Provide user-friendly error messages
        let userMessage = 'Failed to start audio engine. ';
        if (message.includes('NotAllowedError') || message.includes('user gesture')) {
          userMessage += 'Please click the button to enable audio.';
        } else if (message.includes('NotSupportedError')) {
          userMessage += 'Your browser may not support Web Audio.';
        } else {
          userMessage += 'Please try refreshing the page.';
        }
        set({ isInitializing: false, initError: userMessage });
      }
    }
  },

  // Play a note
  playNote: (note?: string) => {
    const { engine, currentNote, isInitialized, params } = get();
    if (!engine || !isInitialized) return;

    const noteToPlay = note ?? currentNote;
    if (params.arpeggiator.enabled) {
      engine.arpAddNote(noteToPlay);
    } else {
      engine.triggerAttack(noteToPlay);
    }
    set({ isPlaying: true, currentNote: noteToPlay });
  },

  // Stop the current note
  stopNote: (note?: string) => {
    const { engine, params, currentNote } = get();
    if (!engine) return;

    if (params.arpeggiator.enabled) {
      const noteToStop = note ?? currentNote;
      engine.arpRemoveNote(noteToStop);
    } else {
      engine.triggerRelease();
    }
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

  // LFO actions
  setLFORate: (rate: number) => {
    const { engine, params } = get();
    engine?.setLFORate(rate);
    set({ params: { ...params, lfo: { ...params.lfo, rate } } });
  },

  setLFODepth: (depth: number) => {
    const { engine, params } = get();
    engine?.setLFODepth(depth);
    set({ params: { ...params, lfo: { ...params.lfo, depth } } });
  },

  setLFOWaveform: (waveform: LFOWaveform) => {
    const { engine, params } = get();
    engine?.setLFOWaveform(waveform);
    set({ params: { ...params, lfo: { ...params.lfo, waveform } } });
  },

  setLFODestination: (destination: AdditiveLFODestination) => {
    const { engine, params } = get();
    engine?.setLFODestination(destination);
    set({ params: { ...params, lfo: { ...params.lfo, destination } } });
  },

  // Noise actions
  setNoiseType: (type: NoiseType) => {
    const { engine, params } = get();
    engine?.setNoiseType(type);
    set({ params: { ...params, noise: { ...params.noise, type } } });
  },

  setNoiseLevel: (level: number) => {
    const { engine, params } = get();
    engine?.setNoiseLevel(level);
    set({ params: { ...params, noise: { ...params.noise, level } } });
  },

  // Glide actions
  setGlideEnabled: (enabled: boolean) => {
    const { engine, params } = get();
    engine?.setGlideEnabled(enabled);
    set({ params: { ...params, glide: { ...params.glide, enabled } } });
  },

  setGlideTime: (time: number) => {
    const { engine, params } = get();
    engine?.setGlideTime(time);
    set({ params: { ...params, glide: { ...params.glide, time } } });
  },

  // Pan action
  setPan: (pan: number) => {
    const { engine, params } = get();
    engine?.setPan(pan);
    set({ params: { ...params, pan } });
  },

  // Velocity actions
  setVelocityAmpAmount: (amount: number) => {
    const { engine, params } = get();
    engine?.setVelocityAmpAmount(amount);
    set({ params: { ...params, velocity: { ...params.velocity, ampAmount: amount } } });
  },

  setVelocityBrightnessAmount: (amount: number) => {
    const { engine, params } = get();
    engine?.setVelocityBrightnessAmount(amount);
    set({ params: { ...params, velocity: { ...params.velocity, brightnessAmount: amount } } });
  },

  // Arpeggiator actions
  setArpEnabled: (enabled: boolean) => {
    const { engine, params } = get();
    engine?.setArpEnabled(enabled);
    set({ params: { ...params, arpeggiator: { ...params.arpeggiator, enabled } } });
  },

  setArpPattern: (pattern: ArpPattern) => {
    const { engine, params } = get();
    engine?.setArpPattern(pattern);
    set({ params: { ...params, arpeggiator: { ...params.arpeggiator, pattern } } });
  },

  setArpDivision: (division: ArpDivision) => {
    const { engine, params } = get();
    engine?.setArpDivision(division);
    set({ params: { ...params, arpeggiator: { ...params.arpeggiator, division } } });
  },

  setArpOctaves: (octaves: 1 | 2 | 3 | 4) => {
    const { engine, params } = get();
    engine?.setArpOctaves(octaves);
    set({ params: { ...params, arpeggiator: { ...params.arpeggiator, octaves } } });
  },

  setArpGate: (gate: number) => {
    const { engine, params } = get();
    engine?.setArpGate(gate);
    set({ params: { ...params, arpeggiator: { ...params.arpeggiator, gate } } });
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
