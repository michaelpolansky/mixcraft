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
} from '../../core/types.ts';
import { DEFAULT_SYNTH_PARAMS } from '../../core/types.ts';
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

  // Filter actions
  setFilterType: (type: FilterType) => void;
  setFilterCutoff: (frequency: number) => void;
  setFilterResonance: (q: number) => void;

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
}));
