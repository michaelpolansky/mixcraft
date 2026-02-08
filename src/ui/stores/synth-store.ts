/**
 * Zustand store for synth state management
 * Bridges React UI with the SynthEngine
 */

import { create } from 'zustand';
import { SynthEngine, createSynthEngine } from '../../core/synth-engine.ts';
import type {
  SynthParams,
  OscillatorType,
  FilterType,
  ADSREnvelope,
  FilterEnvelopeParams,
  PitchEnvelopeParams,
  ModEnvelopeParams,
  PWMEnvelopeParams,
  LFOWaveform,
  LFOSyncDivision,
  NoiseType,
  VelocityParams,
  SubOscillatorParams,
  Oscillator2Params,
  LFO2Params,
  ModSource,
  ModDestination,
  ModRoute,
  ModMatrixParams,
  ArpPattern,
  ArpDivision,
} from '../../core/types.ts';
import { DEFAULT_SYNTH_PARAMS, DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../core/types.ts';
import { SUBTRACTIVE_PRESETS } from '../../data/presets/subtractive-presets.ts';

interface SynthStore {
  // State
  params: SynthParams;
  engine: SynthEngine | null;
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
  stopNote: () => void;
  setCurrentNote: (note: string) => void;

  // Oscillator actions
  setOscillatorType: (type: OscillatorType) => void;
  setOctave: (octave: number) => void;
  setDetune: (cents: number) => void;
  setOsc1Level: (level: number) => void;

  // Noise actions
  setNoiseType: (type: NoiseType) => void;
  setNoiseLevel: (level: number) => void;

  // Glide actions
  setGlideEnabled: (enabled: boolean) => void;
  setGlideTime: (time: number) => void;

  // Sub oscillator actions
  setSubOscEnabled: (enabled: boolean) => void;
  setSubOscType: (type: 'sine' | 'square') => void;
  setSubOscOctave: (octave: -1 | -2) => void;
  setSubOscLevel: (level: number) => void;

  // Oscillator 2 actions
  setOsc2Enabled: (enabled: boolean) => void;
  setOsc2Type: (type: OscillatorType) => void;
  setOsc2Octave: (octave: number) => void;
  setOsc2Detune: (cents: number) => void;
  setOsc2PulseWidth: (width: number) => void;
  setOsc2Level: (level: number) => void;

  // Unison actions
  setUnisonEnabled: (enabled: boolean) => void;
  setUnisonVoices: (voices: 2 | 4 | 8) => void;
  setUnisonDetune: (detune: number) => void;
  setUnisonSpread: (spread: number) => void;

  // Arpeggiator actions
  setArpEnabled: (enabled: boolean) => void;
  setArpPattern: (pattern: ArpPattern) => void;
  setArpDivision: (division: ArpDivision) => void;
  setArpOctaves: (octaves: 1 | 2 | 3 | 4) => void;
  setArpGate: (gate: number) => void;
  arpNoteOn: (note: string) => void;
  arpNoteOff: (note: string) => void;

  // Oscillator pulse width
  setPulseWidth: (width: number) => void;

  // Filter actions
  setFilterType: (type: FilterType) => void;
  setFilterCutoff: (frequency: number) => void;
  setFilterResonance: (q: number) => void;
  setFilterKeyTracking: (amount: number) => void;

  // Velocity actions
  setVelocityAmpAmount: (amount: number) => void;
  setVelocityFilterAmount: (amount: number) => void;

  // Amplitude envelope actions
  setAmplitudeAttack: (time: number) => void;
  setAmplitudeDecay: (time: number) => void;
  setAmplitudeSustain: (level: number) => void;
  setAmplitudeRelease: (time: number) => void;

  // Filter envelope actions
  setFilterEnvelopeAttack: (time: number) => void;
  setFilterEnvelopeDecay: (time: number) => void;
  setFilterEnvelopeSustain: (level: number) => void;
  setFilterEnvelopeRelease: (time: number) => void;
  setFilterEnvelopeAmount: (octaves: number) => void;

  // LFO actions
  setLFORate: (rate: number) => void;
  setLFODepth: (depth: number) => void;
  setLFOWaveform: (waveform: LFOWaveform) => void;
  setLFOSync: (sync: boolean) => void;
  setLFOSyncDivision: (division: LFOSyncDivision) => void;

  // LFO2 actions
  setLfo2Rate: (rate: number) => void;
  setLfo2Depth: (depth: number) => void;
  setLfo2Type: (type: LFOWaveform) => void;
  setLfo2Enabled: (enabled: boolean) => void;

  // Pan action
  setPan: (pan: number) => void;

  // Mod Matrix actions
  setModRouteSource: (index: number, source: ModSource) => void;
  setModRouteDestination: (index: number, destination: ModDestination) => void;
  setModRouteAmount: (index: number, amount: number) => void;
  setModRouteEnabled: (index: number, enabled: boolean) => void;
  setMatrixAmount: (source: ModSource, destination: ModDestination, amount: number) => void;

  // Pitch envelope actions
  setPitchEnvelopeAttack: (time: number) => void;
  setPitchEnvelopeDecay: (time: number) => void;
  setPitchEnvelopeSustain: (level: number) => void;
  setPitchEnvelopeRelease: (time: number) => void;
  setPitchEnvelopeAmount: (semitones: number) => void;

  // Mod envelope actions
  setModEnvelopeAttack: (time: number) => void;
  setModEnvelopeDecay: (time: number) => void;
  setModEnvelopeSustain: (level: number) => void;
  setModEnvelopeRelease: (time: number) => void;
  setModEnvelopeAmount: (amount: number) => void;

  // PWM envelope actions
  setPWMEnvelopeAttack: (time: number) => void;
  setPWMEnvelopeDecay: (time: number) => void;
  setPWMEnvelopeSustain: (level: number) => void;
  setPWMEnvelopeRelease: (time: number) => void;
  setPWMEnvelopeAmount: (amount: number) => void;

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

  // Randomize
  randomize: () => void;
}

export const useSynthStore = create<SynthStore>((set, get) => ({
  // Initial state
  params: { ...DEFAULT_SYNTH_PARAMS },
  engine: null,
  isPlaying: false,
  currentNote: 'C4',
  isInitialized: false,
  isInitializing: false,
  initError: null,
  currentPreset: 'Default',

  // Initialize the synth engine
  initEngine: () => {
    const existingEngine = get().engine;
    if (existingEngine) {
      existingEngine.dispose();
    }
    const engine = createSynthEngine(get().params);
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

  // Oscillator actions
  setOscillatorType: (type: OscillatorType) => {
    const { engine, params } = get();
    engine?.setOscillatorType(type);
    set({
      params: {
        ...params,
        oscillator: { ...params.oscillator, type },
      },
    });
  },

  setOctave: (octave: number) => {
    const { engine, params } = get();
    engine?.setOctave(octave);
    set({
      params: {
        ...params,
        oscillator: { ...params.oscillator, octave },
      },
    });
  },

  setDetune: (cents: number) => {
    const { engine, params } = get();
    engine?.setDetune(cents);
    set({
      params: {
        ...params,
        oscillator: { ...params.oscillator, detune: cents },
      },
    });
  },

  setOsc1Level: (level: number) => {
    const { engine, params } = get();
    engine?.setOsc1Level(level);
    set({
      params: {
        ...params,
        oscillator: { ...params.oscillator, level },
      },
    });
  },

  setPulseWidth: (width: number) => {
    const { engine, params } = get();
    engine?.setPulseWidth(width);
    set({
      params: {
        ...params,
        oscillator: { ...params.oscillator, pulseWidth: width },
      },
    });
  },

  // Noise actions
  setNoiseType: (type: NoiseType) => {
    const { engine, params } = get();
    engine?.setNoiseType(type);
    set({
      params: {
        ...params,
        noise: { ...params.noise, type },
      },
    });
  },

  setNoiseLevel: (level: number) => {
    const { engine, params } = get();
    engine?.setNoiseLevel(level);
    set({
      params: {
        ...params,
        noise: { ...params.noise, level },
      },
    });
  },

  // Glide actions
  setGlideEnabled: (enabled: boolean) => {
    const { engine, params } = get();
    engine?.setGlideEnabled(enabled);
    set({
      params: {
        ...params,
        glide: { ...params.glide, enabled },
      },
    });
  },

  setGlideTime: (time: number) => {
    const { engine, params } = get();
    engine?.setGlideTime(time);
    set({
      params: {
        ...params,
        glide: { ...params.glide, time },
      },
    });
  },

  // Sub oscillator actions
  setSubOscEnabled: (enabled: boolean) => {
    const { engine, params } = get();
    engine?.setSubOscEnabled(enabled);
    set({
      params: {
        ...params,
        subOsc: { ...params.subOsc, enabled },
      },
    });
  },

  setSubOscType: (type: 'sine' | 'square') => {
    const { engine, params } = get();
    engine?.setSubOscType(type);
    set({
      params: {
        ...params,
        subOsc: { ...params.subOsc, type },
      },
    });
  },

  setSubOscOctave: (octave: -1 | -2) => {
    const { engine, params } = get();
    engine?.setSubOscOctave(octave);
    set({
      params: {
        ...params,
        subOsc: { ...params.subOsc, octave },
      },
    });
  },

  setSubOscLevel: (level: number) => {
    const { engine, params } = get();
    engine?.setSubOscLevel(level);
    set({
      params: {
        ...params,
        subOsc: { ...params.subOsc, level },
      },
    });
  },

  // Oscillator 2 actions
  setOsc2Enabled: (enabled: boolean) => {
    const { engine, params } = get();
    engine?.setOsc2Enabled(enabled);
    set({
      params: {
        ...params,
        oscillator2: { ...params.oscillator2, enabled },
      },
    });
  },

  setOsc2Type: (type: OscillatorType) => {
    const { engine, params } = get();
    engine?.setOsc2Type(type);
    set({
      params: {
        ...params,
        oscillator2: { ...params.oscillator2, type },
      },
    });
  },

  setOsc2Octave: (octave: number) => {
    const { engine, params } = get();
    engine?.setOsc2Octave(octave);
    set({
      params: {
        ...params,
        oscillator2: { ...params.oscillator2, octave },
      },
    });
  },

  setOsc2Detune: (cents: number) => {
    const { engine, params } = get();
    engine?.setOsc2Detune(cents);
    set({
      params: {
        ...params,
        oscillator2: { ...params.oscillator2, detune: cents },
      },
    });
  },

  setOsc2PulseWidth: (width: number) => {
    const { engine, params } = get();
    engine?.setOsc2PulseWidth(width);
    set({
      params: {
        ...params,
        oscillator2: { ...params.oscillator2, pulseWidth: width },
      },
    });
  },

  setOsc2Level: (level: number) => {
    const { engine, params } = get();
    engine?.setOsc2Level(level);
    set({
      params: {
        ...params,
        oscillator2: { ...params.oscillator2, level },
      },
    });
  },

  // Unison actions
  setUnisonEnabled: (enabled: boolean) => {
    const { engine, params } = get();
    engine?.setUnisonEnabled(enabled);
    set({
      params: {
        ...params,
        unison: { ...params.unison, enabled },
      },
    });
  },

  setUnisonVoices: (voices: 2 | 4 | 8) => {
    const { engine, params } = get();
    engine?.setUnisonVoices(voices);
    set({
      params: {
        ...params,
        unison: { ...params.unison, voices },
      },
    });
  },

  setUnisonDetune: (detune: number) => {
    const { engine, params } = get();
    engine?.setUnisonDetune(detune);
    set({
      params: {
        ...params,
        unison: { ...params.unison, detune },
      },
    });
  },

  setUnisonSpread: (spread: number) => {
    const { engine, params } = get();
    engine?.setUnisonSpread(spread);
    set({
      params: {
        ...params,
        unison: { ...params.unison, spread },
      },
    });
  },

  // Arpeggiator actions
  setArpEnabled: (enabled: boolean) => {
    const { engine, params } = get();
    engine?.setArpEnabled(enabled);
    set({
      params: {
        ...params,
        arpeggiator: { ...params.arpeggiator, enabled },
      },
    });
  },

  setArpPattern: (pattern: ArpPattern) => {
    const { engine, params } = get();
    engine?.setArpPattern(pattern);
    set({
      params: {
        ...params,
        arpeggiator: { ...params.arpeggiator, pattern },
      },
    });
  },

  setArpDivision: (division: ArpDivision) => {
    const { engine, params } = get();
    engine?.setArpDivision(division);
    set({
      params: {
        ...params,
        arpeggiator: { ...params.arpeggiator, division },
      },
    });
  },

  setArpOctaves: (octaves: 1 | 2 | 3 | 4) => {
    const { engine, params } = get();
    engine?.setArpOctaves(octaves);
    set({
      params: {
        ...params,
        arpeggiator: { ...params.arpeggiator, octaves },
      },
    });
  },

  setArpGate: (gate: number) => {
    const { engine, params } = get();
    engine?.setArpGate(gate);
    set({
      params: {
        ...params,
        arpeggiator: { ...params.arpeggiator, gate },
      },
    });
  },

  arpNoteOn: (note: string) => {
    get().engine?.arpAddNote(note);
  },

  arpNoteOff: (note: string) => {
    get().engine?.arpRemoveNote(note);
  },

  // Filter actions
  setFilterType: (type: FilterType) => {
    const { engine, params } = get();
    engine?.setFilterType(type);
    set({
      params: {
        ...params,
        filter: { ...params.filter, type },
      },
    });
  },

  setFilterCutoff: (frequency: number) => {
    const { engine, params } = get();
    engine?.setFilterCutoff(frequency);
    set({
      params: {
        ...params,
        filter: { ...params.filter, cutoff: frequency },
      },
    });
  },

  setFilterResonance: (q: number) => {
    const { engine, params } = get();
    engine?.setFilterResonance(q);
    set({
      params: {
        ...params,
        filter: { ...params.filter, resonance: q },
      },
    });
  },

  setFilterKeyTracking: (amount: number) => {
    const { engine, params } = get();
    engine?.setFilterKeyTracking(amount);
    set({
      params: {
        ...params,
        filter: { ...params.filter, keyTracking: amount },
      },
    });
  },

  // Velocity actions
  setVelocityAmpAmount: (amount: number) => {
    const { engine, params } = get();
    engine?.setVelocityAmpAmount(amount);
    set({
      params: {
        ...params,
        velocity: { ...params.velocity, ampAmount: amount },
      },
    });
  },

  setVelocityFilterAmount: (amount: number) => {
    const { engine, params } = get();
    engine?.setVelocityFilterAmount(amount);
    set({
      params: {
        ...params,
        velocity: { ...params.velocity, filterAmount: amount },
      },
    });
  },

  // Amplitude envelope actions
  setAmplitudeAttack: (time: number) => {
    const { engine, params } = get();
    engine?.setAmplitudeAttack(time);
    set({
      params: {
        ...params,
        amplitudeEnvelope: { ...params.amplitudeEnvelope, attack: time },
      },
    });
  },

  setAmplitudeDecay: (time: number) => {
    const { engine, params } = get();
    engine?.setAmplitudeDecay(time);
    set({
      params: {
        ...params,
        amplitudeEnvelope: { ...params.amplitudeEnvelope, decay: time },
      },
    });
  },

  setAmplitudeSustain: (level: number) => {
    const { engine, params } = get();
    engine?.setAmplitudeSustain(level);
    set({
      params: {
        ...params,
        amplitudeEnvelope: { ...params.amplitudeEnvelope, sustain: level },
      },
    });
  },

  setAmplitudeRelease: (time: number) => {
    const { engine, params } = get();
    engine?.setAmplitudeRelease(time);
    set({
      params: {
        ...params,
        amplitudeEnvelope: { ...params.amplitudeEnvelope, release: time },
      },
    });
  },

  // Filter envelope actions
  setFilterEnvelopeAttack: (time: number) => {
    const { engine, params } = get();
    engine?.setFilterEnvelopeAttack(time);
    set({
      params: {
        ...params,
        filterEnvelope: { ...params.filterEnvelope, attack: time },
      },
    });
  },

  setFilterEnvelopeDecay: (time: number) => {
    const { engine, params } = get();
    engine?.setFilterEnvelopeDecay(time);
    set({
      params: {
        ...params,
        filterEnvelope: { ...params.filterEnvelope, decay: time },
      },
    });
  },

  setFilterEnvelopeSustain: (level: number) => {
    const { engine, params } = get();
    engine?.setFilterEnvelopeSustain(level);
    set({
      params: {
        ...params,
        filterEnvelope: { ...params.filterEnvelope, sustain: level },
      },
    });
  },

  setFilterEnvelopeRelease: (time: number) => {
    const { engine, params } = get();
    engine?.setFilterEnvelopeRelease(time);
    set({
      params: {
        ...params,
        filterEnvelope: { ...params.filterEnvelope, release: time },
      },
    });
  },

  setFilterEnvelopeAmount: (octaves: number) => {
    const { engine, params } = get();
    engine?.setFilterEnvelopeAmount(octaves);
    set({
      params: {
        ...params,
        filterEnvelope: { ...params.filterEnvelope, amount: octaves },
      },
    });
  },

  // LFO actions
  setLFORate: (rate: number) => {
    const { engine, params } = get();
    engine?.setLFORate(rate);
    set({
      params: {
        ...params,
        lfo: { ...params.lfo, rate },
      },
    });
  },

  setLFODepth: (depth: number) => {
    const { engine, params } = get();
    engine?.setLFODepth(depth);
    set({
      params: {
        ...params,
        lfo: { ...params.lfo, depth },
      },
    });
  },

  setLFOWaveform: (waveform: LFOWaveform) => {
    const { engine, params } = get();
    engine?.setLFOWaveform(waveform);
    set({
      params: {
        ...params,
        lfo: { ...params.lfo, waveform },
      },
    });
  },

  setLFOSync: (sync: boolean) => {
    const { engine, params } = get();
    engine?.setLFOSync(sync);
    set({
      params: {
        ...params,
        lfo: { ...params.lfo, sync },
      },
    });
  },

  setLFOSyncDivision: (syncDivision: LFOSyncDivision) => {
    const { engine, params } = get();
    engine?.setLFOSyncDivision(syncDivision);
    set({
      params: {
        ...params,
        lfo: { ...params.lfo, syncDivision },
      },
    });
  },

  // LFO2 actions
  setLfo2Rate: (rate: number) => {
    set((state) => ({
      params: { ...state.params, lfo2: { ...state.params.lfo2, rate } },
    }));
    get().engine?.setLFO2({ rate });
  },

  setLfo2Depth: (depth: number) => {
    set((state) => ({
      params: { ...state.params, lfo2: { ...state.params.lfo2, depth } },
    }));
    get().engine?.setLFO2({ depth });
  },

  setLfo2Type: (type: LFOWaveform) => {
    set((state) => ({
      params: { ...state.params, lfo2: { ...state.params.lfo2, type } },
    }));
    get().engine?.setLFO2({ type });
  },

  setLfo2Enabled: (enabled: boolean) => {
    set((state) => ({
      params: { ...state.params, lfo2: { ...state.params.lfo2, enabled } },
    }));
    get().engine?.setLFO2({ enabled });
  },

  // Pan action
  setPan: (pan: number) => {
    set((state) => ({
      params: { ...state.params, pan },
    }));
    get().engine?.setPan(pan);
  },

  // Mod Matrix actions (legacy route-based)
  setModRouteSource: (index: number, source: ModSource) => {
    set((state) => {
      const routes = [...state.params.modMatrix.routes] as [ModRoute, ModRoute, ModRoute, ModRoute];
      const oldRoute = routes[index]!;
      routes[index] = {
        source,
        destination: oldRoute.destination,
        amount: oldRoute.amount,
        enabled: oldRoute.enabled,
      };
      return {
        params: { ...state.params, modMatrix: { grid: state.params.modMatrix.grid, routes } },
      };
    });
    get().engine?.setModMatrix(get().params.modMatrix);
  },

  setModRouteDestination: (index: number, destination: ModDestination) => {
    set((state) => {
      const routes = [...state.params.modMatrix.routes] as [ModRoute, ModRoute, ModRoute, ModRoute];
      const oldRoute = routes[index]!;
      routes[index] = {
        source: oldRoute.source,
        destination,
        amount: oldRoute.amount,
        enabled: oldRoute.enabled,
      };
      return {
        params: { ...state.params, modMatrix: { grid: state.params.modMatrix.grid, routes } },
      };
    });
    get().engine?.setModMatrix(get().params.modMatrix);
  },

  setModRouteAmount: (index: number, amount: number) => {
    set((state) => {
      const routes = [...state.params.modMatrix.routes] as [ModRoute, ModRoute, ModRoute, ModRoute];
      const oldRoute = routes[index]!;
      routes[index] = {
        source: oldRoute.source,
        destination: oldRoute.destination,
        amount,
        enabled: oldRoute.enabled,
      };
      return {
        params: { ...state.params, modMatrix: { grid: state.params.modMatrix.grid, routes } },
      };
    });
    get().engine?.setModMatrix(get().params.modMatrix);
  },

  setModRouteEnabled: (index: number, enabled: boolean) => {
    set((state) => {
      const routes = [...state.params.modMatrix.routes] as [ModRoute, ModRoute, ModRoute, ModRoute];
      const oldRoute = routes[index]!;
      routes[index] = {
        source: oldRoute.source,
        destination: oldRoute.destination,
        amount: oldRoute.amount,
        enabled,
      };
      return {
        params: { ...state.params, modMatrix: { ...state.params.modMatrix, routes } },
      };
    });
    get().engine?.setModMatrix(get().params.modMatrix);
  },

  setMatrixAmount: (source: ModSource, destination: ModDestination, amount: number) => {
    set((state) => {
      const newGrid = { ...state.params.modMatrix.grid };
      newGrid[source] = { ...newGrid[source], [destination]: amount };
      return {
        params: {
          ...state.params,
          modMatrix: { ...state.params.modMatrix, grid: newGrid },
        },
      };
    });
    get().engine?.setModMatrix(get().params.modMatrix);
  },

  // Pitch envelope actions
  setPitchEnvelopeAttack: (time: number) => {
    const { engine, params } = get();
    engine?.setPitchEnvelopeAttack(time);
    set({
      params: {
        ...params,
        pitchEnvelope: { ...params.pitchEnvelope, attack: time },
      },
    });
  },

  setPitchEnvelopeDecay: (time: number) => {
    const { engine, params } = get();
    engine?.setPitchEnvelopeDecay(time);
    set({
      params: {
        ...params,
        pitchEnvelope: { ...params.pitchEnvelope, decay: time },
      },
    });
  },

  setPitchEnvelopeSustain: (level: number) => {
    const { engine, params } = get();
    engine?.setPitchEnvelopeSustain(level);
    set({
      params: {
        ...params,
        pitchEnvelope: { ...params.pitchEnvelope, sustain: level },
      },
    });
  },

  setPitchEnvelopeRelease: (time: number) => {
    const { engine, params } = get();
    engine?.setPitchEnvelopeRelease(time);
    set({
      params: {
        ...params,
        pitchEnvelope: { ...params.pitchEnvelope, release: time },
      },
    });
  },

  setPitchEnvelopeAmount: (semitones: number) => {
    const { engine, params } = get();
    engine?.setPitchEnvelopeAmount(semitones);
    set({
      params: {
        ...params,
        pitchEnvelope: { ...params.pitchEnvelope, amount: semitones },
      },
    });
  },

  // Mod envelope actions
  setModEnvelopeAttack: (time: number) => {
    const { engine, params } = get();
    engine?.setModEnvelopeAttack(time);
    set({
      params: {
        ...params,
        modEnvelope: { ...params.modEnvelope, attack: time },
      },
    });
  },

  setModEnvelopeDecay: (time: number) => {
    const { engine, params } = get();
    engine?.setModEnvelopeDecay(time);
    set({
      params: {
        ...params,
        modEnvelope: { ...params.modEnvelope, decay: time },
      },
    });
  },

  setModEnvelopeSustain: (level: number) => {
    const { engine, params } = get();
    engine?.setModEnvelopeSustain(level);
    set({
      params: {
        ...params,
        modEnvelope: { ...params.modEnvelope, sustain: level },
      },
    });
  },

  setModEnvelopeRelease: (time: number) => {
    const { engine, params } = get();
    engine?.setModEnvelopeRelease(time);
    set({
      params: {
        ...params,
        modEnvelope: { ...params.modEnvelope, release: time },
      },
    });
  },

  setModEnvelopeAmount: (amount: number) => {
    const { engine, params } = get();
    engine?.setModEnvelopeAmount(amount);
    set({
      params: {
        ...params,
        modEnvelope: { ...params.modEnvelope, amount },
      },
    });
  },

  // PWM envelope actions
  setPWMEnvelopeAttack: (time: number) => {
    const { engine, params } = get();
    engine?.setPWMEnvelopeAttack(time);
    set({
      params: {
        ...params,
        pwmEnvelope: { ...params.pwmEnvelope, attack: time },
      },
    });
  },

  setPWMEnvelopeDecay: (time: number) => {
    const { engine, params } = get();
    engine?.setPWMEnvelopeDecay(time);
    set({
      params: {
        ...params,
        pwmEnvelope: { ...params.pwmEnvelope, decay: time },
      },
    });
  },

  setPWMEnvelopeSustain: (level: number) => {
    const { engine, params } = get();
    engine?.setPWMEnvelopeSustain(level);
    set({
      params: {
        ...params,
        pwmEnvelope: { ...params.pwmEnvelope, sustain: level },
      },
    });
  },

  setPWMEnvelopeRelease: (time: number) => {
    const { engine, params } = get();
    engine?.setPWMEnvelopeRelease(time);
    set({
      params: {
        ...params,
        pwmEnvelope: { ...params.pwmEnvelope, release: time },
      },
    });
  },

  setPWMEnvelopeAmount: (amount: number) => {
    const { engine, params } = get();
    engine?.setPWMEnvelopeAmount(amount);
    set({
      params: {
        ...params,
        pwmEnvelope: { ...params.pwmEnvelope, amount },
      },
    });
  },

  // Effects actions
  setDistortionAmount: (amount: number) => {
    const { engine, params } = get();
    engine?.setDistortionAmount(amount);
    set({
      params: {
        ...params,
        effects: {
          ...params.effects,
          distortion: { ...params.effects.distortion, amount },
        },
      },
    });
  },

  setDistortionMix: (mix: number) => {
    const { engine, params } = get();
    engine?.setDistortionMix(mix);
    set({
      params: {
        ...params,
        effects: {
          ...params.effects,
          distortion: { ...params.effects.distortion, mix },
        },
      },
    });
  },

  setDelayTime: (time: number) => {
    const { engine, params } = get();
    engine?.setDelayTime(time);
    set({
      params: {
        ...params,
        effects: {
          ...params.effects,
          delay: { ...params.effects.delay, time },
        },
      },
    });
  },

  setDelayFeedback: (feedback: number) => {
    const { engine, params } = get();
    engine?.setDelayFeedback(feedback);
    set({
      params: {
        ...params,
        effects: {
          ...params.effects,
          delay: { ...params.effects.delay, feedback },
        },
      },
    });
  },

  setDelayMix: (mix: number) => {
    const { engine, params } = get();
    engine?.setDelayMix(mix);
    set({
      params: {
        ...params,
        effects: {
          ...params.effects,
          delay: { ...params.effects.delay, mix },
        },
      },
    });
  },

  setReverbDecay: (decay: number) => {
    const { engine, params } = get();
    engine?.setReverbDecay(decay);
    set({
      params: {
        ...params,
        effects: {
          ...params.effects,
          reverb: { ...params.effects.reverb, decay },
        },
      },
    });
  },

  setReverbMix: (mix: number) => {
    const { engine, params } = get();
    engine?.setReverbMix(mix);
    set({
      params: {
        ...params,
        effects: {
          ...params.effects,
          reverb: { ...params.effects.reverb, mix },
        },
      },
    });
  },

  setChorusRate: (rate: number) => {
    const { engine, params } = get();
    engine?.setChorusRate(rate);
    set({
      params: {
        ...params,
        effects: {
          ...params.effects,
          chorus: { ...params.effects.chorus, rate },
        },
      },
    });
  },

  setChorusDepth: (depth: number) => {
    const { engine, params } = get();
    engine?.setChorusDepth(depth);
    set({
      params: {
        ...params,
        effects: {
          ...params.effects,
          chorus: { ...params.effects.chorus, depth },
        },
      },
    });
  },

  setChorusMix: (mix: number) => {
    const { engine, params } = get();
    engine?.setChorusMix(mix);
    set({
      params: {
        ...params,
        effects: {
          ...params.effects,
          chorus: { ...params.effects.chorus, mix },
        },
      },
    });
  },

  // Volume
  setVolume: (db: number) => {
    const { engine, params } = get();
    engine?.setVolume(db);
    set({
      params: {
        ...params,
        volume: db,
      },
    });
  },

  // Reset
  resetToDefaults: () => {
    const { engine } = get();
    engine?.setParams(DEFAULT_SYNTH_PARAMS);
    set({ params: { ...DEFAULT_SYNTH_PARAMS }, currentPreset: 'Default' });
  },

  // Load preset
  loadPreset: (name: string) => {
    const { engine } = get();
    const preset = SUBTRACTIVE_PRESETS.find((p) => p.name === name);
    if (preset) {
      engine?.setParams(preset.params);
      set({ params: { ...preset.params }, currentPreset: name });
    }
  },

  // Randomize all parameters
  randomize: () => {
    const { engine } = get();
    const rand = (min: number, max: number) => Math.random() * (max - min) + min;
    const randInt = (min: number, max: number) => Math.floor(rand(min, max + 1));
    const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)] as T;

    const oscTypes: OscillatorType[] = ['sine', 'sawtooth', 'square', 'triangle'];
    const filterTypes: FilterType[] = ['lowpass', 'highpass', 'bandpass'];
    const lfoWaveforms: LFOWaveform[] = ['sine', 'triangle', 'square', 'sawtooth'];

    const randomParams: SynthParams = {
      oscillator: {
        type: pick(oscTypes),
        octave: randInt(-2, 2),
        detune: randInt(-50, 50),
        pulseWidth: rand(0.1, 0.9),
        level: 1,
      },
      noise: {
        type: pick(['white', 'pink', 'brown'] as const),
        level: Math.random() < 0.3 ? rand(0, 0.3) : 0, // 30% chance of noise
      },
      glide: {
        enabled: Math.random() < 0.2, // 20% chance
        time: rand(0.01, 0.3),
      },
      arpeggiator: {
        enabled: false, // Don't randomize arpeggiator - it's a performance feature
        pattern: 'up' as const,
        division: '8n' as const,
        octaves: 1 as const,
        gate: 0.5,
      },
      subOsc: {
        enabled: Math.random() < 0.3, // 30% chance for bass boost
        type: pick(['sine', 'square'] as const),
        octave: pick([-1, -2] as const),
        level: rand(0.3, 0.7),
      },
      oscillator2: {
        enabled: Math.random() < 0.4, // 40% chance for layered sound
        type: pick(oscTypes),
        octave: randInt(-1, 1),
        detune: randInt(-15, 15),
        pulseWidth: rand(0.1, 0.9),
        level: rand(0.3, 0.7),
      },
      unison: {
        enabled: Math.random() < 0.25, // 25% chance for thick sound
        voices: pick([2, 4, 8] as const),
        detune: randInt(10, 40),
        spread: rand(0.3, 0.8),
      },
      filter: {
        type: pick(filterTypes),
        cutoff: rand(200, 8000),
        resonance: rand(0.5, 8),
        keyTracking: Math.random() < 0.3 ? rand(0, 0.5) : 0,
      },
      filterEnvelope: {
        attack: rand(0.001, 0.5),
        decay: rand(0.05, 0.8),
        sustain: rand(0.1, 0.8),
        release: rand(0.1, 1.5),
        amount: rand(-2, 3),
      },
      amplitudeEnvelope: {
        attack: rand(0.001, 0.4),
        decay: rand(0.05, 0.5),
        sustain: rand(0.2, 0.9),
        release: rand(0.1, 1),
      },
      pitchEnvelope: {
        attack: rand(0.001, 0.1),
        decay: rand(0.05, 0.3),
        sustain: 0,
        release: rand(0.05, 0.2),
        amount: Math.random() < 0.2 ? randInt(-12, 12) : 0, // 20% chance
      },
      modEnvelope: {
        attack: rand(0.1, 1),
        decay: rand(0.2, 1),
        sustain: rand(0.2, 0.8),
        release: rand(0.2, 1),
        amount: Math.random() < 0.3 ? rand(0, 0.5) : 0,
      },
      pwmEnvelope: {
        attack: rand(0.01, 0.5),
        decay: rand(0.1, 0.5),
        sustain: rand(0.3, 0.7),
        release: rand(0.1, 0.5),
        amount: 0,
      },
      lfo: {
        rate: rand(0.5, 8),
        depth: Math.random() < 0.5 ? rand(0, 0.4) : 0, // 50% chance of LFO
        waveform: pick(lfoWaveforms),
        sync: false,
        syncDivision: '4n',
      },
      lfo2: {
        rate: rand(0.5, 8),
        depth: Math.random() < 0.3 ? rand(0, 0.4) : 0, // 30% chance of LFO2
        type: pick(lfoWaveforms),
        enabled: Math.random() < 0.3, // 30% chance enabled
      },
      velocity: {
        ampAmount: Math.random() < 0.3 ? rand(0, 0.5) : 0,
        filterAmount: Math.random() < 0.2 ? rand(0, 0.5) : 0,
      },
      effects: {
        distortion: {
          amount: Math.random() < 0.2 ? rand(0, 0.4) : 0,
          mix: rand(0.3, 0.7),
        },
        delay: {
          time: rand(0.1, 0.5),
          feedback: rand(0.2, 0.5),
          mix: Math.random() < 0.3 ? rand(0, 0.4) : 0,
        },
        reverb: {
          decay: rand(0.5, 4),
          mix: Math.random() < 0.4 ? rand(0, 0.5) : 0,
        },
        chorus: {
          rate: rand(0.5, 3),
          depth: rand(0.2, 0.6),
          mix: Math.random() < 0.3 ? rand(0, 0.4) : 0,
        },
      },
      volume: rand(-18, -8),
      pan: rand(-0.5, 0.5), // Subtle pan variation
      modMatrix: { ...DEFAULT_MOD_MATRIX }, // Keep mod matrix at defaults (too complex for random)
    };

    engine?.setParams(randomParams);
    set({ params: randomParams, currentPreset: 'Random' });
  },
}));
