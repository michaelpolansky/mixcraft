/**
 * Subtractive Synth Presets
 * Musically useful parameter configurations for the subtractive synthesizer
 */

import type { SynthParams } from '../../core/types.ts';
import { DEFAULT_SYNTH_PARAMS, DEFAULT_EFFECTS } from '../../core/types.ts';

export interface SubtractivePreset {
  name: string;
  params: SynthParams;
}

export const SUBTRACTIVE_PRESETS: SubtractivePreset[] = [
  {
    name: 'Default',
    params: { ...DEFAULT_SYNTH_PARAMS },
  },
  {
    name: 'Bass (Wow)',
    params: {
      oscillator: {
        type: 'sawtooth',
        octave: -1,
        detune: 0,
        pulseWidth: 0.5
      },
      filter: {
        type: 'lowpass',
        cutoff: 400,
        resonance: 8,
        keyTracking: 0
      },

      filterEnvelope: {
        attack: 0.01,
        decay: 0.4,
        sustain: 0.2,
        release: 0.3,
        amount: 4,
      },
      amplitudeEnvelope: {
        attack: 0.01,
        decay: 0.3,
        sustain: 0.6,
        release: 0.2,
      },
      lfo: {
        rate: 0.1,
        depth: 0,
        waveform: 'sine',
        sync: false,
        syncDivision: '4n',
      },
      velocity: {
        ampAmount: 0,
        filterAmount: 0,
      },
      noise: {
        type: 'white',
        level: 0,
      },
      glide: {
        enabled: false,
        time: 0.1,
      },
      pitchEnvelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 0,
        release: 0.1,
        amount: 0,
      },
      modEnvelope: {
        attack: 0.5,
        decay: 0.5,
        sustain: 0.5,
        release: 0.5,
        amount: 0,
      },
      pwmEnvelope: {
        attack: 0.01,
        decay: 0.3,
        sustain: 0.5,
        release: 0.3,
        amount: 0,
      },
      effects: { ...DEFAULT_EFFECTS },
      volume: -10,
    },
  },
  {
    name: 'Lead (West Coast)',
    params: {
      oscillator: {
        type: 'sawtooth',
        octave: 0,
        detune: 7,
        pulseWidth: 0.5
      },
      filter: {
        type: 'lowpass',
        cutoff: 3500,
        resonance: 4,
        keyTracking: 0
      },

      filterEnvelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.5,
        release: 0.3,
        amount: 2,
      },
      amplitudeEnvelope: {
        attack: 0.01,
        decay: 0.15,
        sustain: 0.7,
        release: 0.4,
      },
      lfo: {
        rate: 5,
        depth: 0.1,
        waveform: 'triangle',
        sync: false,
        syncDivision: '4n',
      },
      velocity: {
        ampAmount: 0,
        filterAmount: 0,
      },
      noise: {
        type: 'white',
        level: 0,
      },
      glide: {
        enabled: false,
        time: 0.1,
      },
      pitchEnvelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 0,
        release: 0.1,
        amount: 0,
      },
      modEnvelope: {
        attack: 0.5,
        decay: 0.5,
        sustain: 0.5,
        release: 0.5,
        amount: 0,
      },
      pwmEnvelope: {
        attack: 0.01,
        decay: 0.3,
        sustain: 0.5,
        release: 0.3,
        amount: 0,
      },
      effects: {
        ...DEFAULT_EFFECTS,
        delay: { time: 0.35, feedback: 0.4, mix: 0.25 },
      },
      volume: -12,
    },
  },
  {
    name: 'Pad (Strings)',
    params: {
      oscillator: {
        type: 'sawtooth',
        octave: 0,
        detune: 15,
        pulseWidth: 0.5
      },
      filter: {
        type: 'lowpass',
        cutoff: 2000,
        resonance: 1,
        keyTracking: 0
      },

      filterEnvelope: {
        attack: 0.5,
        decay: 0.3,
        sustain: 0.7,
        release: 1.5,
        amount: 1,
      },
      amplitudeEnvelope: {
        attack: 0.6,
        decay: 0.5,
        sustain: 0.8,
        release: 2,
      },
      lfo: {
        rate: 0.5,
        depth: 0.05,
        waveform: 'sine',
        sync: false,
        syncDivision: '4n',
      },
      velocity: {
        ampAmount: 0,
        filterAmount: 0,
      },
      noise: {
        type: 'white',
        level: 0,
      },
      glide: {
        enabled: false,
        time: 0.1,
      },
      pitchEnvelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 0,
        release: 0.1,
        amount: 0,
      },
      modEnvelope: {
        attack: 0.5,
        decay: 0.5,
        sustain: 0.5,
        release: 0.5,
        amount: 0,
      },
      pwmEnvelope: {
        attack: 0.01,
        decay: 0.3,
        sustain: 0.5,
        release: 0.3,
        amount: 0,
      },
      effects: {
        ...DEFAULT_EFFECTS,
        reverb: { decay: 4, mix: 0.5 },
        chorus: { rate: 1, depth: 0.6, mix: 0.4 },
      },
      volume: -14,
    },
  },
  {
    name: 'Pluck',
    params: {
      oscillator: {
        type: 'triangle',
        octave: 0,
        detune: 0,
        pulseWidth: 0.5
      },
      filter: {
        type: 'lowpass',
        cutoff: 800,
        resonance: 2,
        keyTracking: 0
      },

      filterEnvelope: {
        attack: 0.001,
        decay: 0.15,
        sustain: 0,
        release: 0.1,
        amount: 4,
      },
      amplitudeEnvelope: {
        attack: 0.001,
        decay: 0.3,
        sustain: 0,
        release: 0.2,
      },
      lfo: {
        rate: 1,
        depth: 0,
        waveform: 'sine',
        sync: false,
        syncDivision: '4n',
      },
      velocity: {
        ampAmount: 0,
        filterAmount: 0,
      },
      noise: {
        type: 'white',
        level: 0,
      },
      glide: {
        enabled: false,
        time: 0.1,
      },
      pitchEnvelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 0,
        release: 0.1,
        amount: 0,
      },
      modEnvelope: {
        attack: 0.5,
        decay: 0.5,
        sustain: 0.5,
        release: 0.5,
        amount: 0,
      },
      pwmEnvelope: {
        attack: 0.01,
        decay: 0.3,
        sustain: 0.5,
        release: 0.3,
        amount: 0,
      },
      effects: {
        ...DEFAULT_EFFECTS,
        reverb: { decay: 2, mix: 0.3 },
      },
      volume: -12,
    },
  },
  {
    name: 'Brass',
    params: {
      oscillator: {
        type: 'sawtooth',
        octave: 0,
        detune: 5,
        pulseWidth: 0.5
      },
      filter: {
        type: 'lowpass',
        cutoff: 1200,
        resonance: 3,
        keyTracking: 0
      },

      filterEnvelope: {
        attack: 0.08,
        decay: 0.2,
        sustain: 0.6,
        release: 0.3,
        amount: 3,
      },
      amplitudeEnvelope: {
        attack: 0.05,
        decay: 0.1,
        sustain: 0.8,
        release: 0.3,
      },
      lfo: {
        rate: 5,
        depth: 0.02,
        waveform: 'triangle',
        sync: false,
        syncDivision: '4n',
      },
      velocity: {
        ampAmount: 0,
        filterAmount: 0,
      },
      noise: {
        type: 'white',
        level: 0,
      },
      glide: {
        enabled: false,
        time: 0.1,
      },
      pitchEnvelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 0,
        release: 0.1,
        amount: 0,
      },
      modEnvelope: {
        attack: 0.5,
        decay: 0.5,
        sustain: 0.5,
        release: 0.5,
        amount: 0,
      },
      pwmEnvelope: {
        attack: 0.01,
        decay: 0.3,
        sustain: 0.5,
        release: 0.3,
        amount: 0,
      },
      effects: { ...DEFAULT_EFFECTS },
      volume: -12,
    },
  },
  {
    name: 'Organ',
    params: {
      oscillator: {
        type: 'square',
        octave: 0,
        detune: 0,
        pulseWidth: 0.5
      },
      filter: {
        type: 'lowpass',
        cutoff: 4000,
        resonance: 0.5,
        keyTracking: 0
      },

      filterEnvelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.9,
        release: 0.1,
        amount: 0,
      },
      amplitudeEnvelope: {
        attack: 0.01,
        decay: 0.05,
        sustain: 1,
        release: 0.1,
      },
      lfo: {
        rate: 6,
        depth: 0.03,
        waveform: 'sine',
        sync: false,
        syncDivision: '4n',
      },
      velocity: {
        ampAmount: 0,
        filterAmount: 0,
      },
      noise: {
        type: 'white',
        level: 0,
      },
      glide: {
        enabled: false,
        time: 0.1,
      },
      pitchEnvelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 0,
        release: 0.1,
        amount: 0,
      },
      modEnvelope: {
        attack: 0.5,
        decay: 0.5,
        sustain: 0.5,
        release: 0.5,
        amount: 0,
      },
      pwmEnvelope: {
        attack: 0.01,
        decay: 0.3,
        sustain: 0.5,
        release: 0.3,
        amount: 0,
      },
      effects: {
        ...DEFAULT_EFFECTS,
        reverb: { decay: 1.5, mix: 0.2 },
        chorus: { rate: 2, depth: 0.4, mix: 0.3 },
      },
      volume: -14,
    },
  },
  {
    name: 'Siren',
    params: {
      oscillator: {
        type: 'sine',
        octave: 1,
        detune: 0,
        pulseWidth: 0.5
      },
      filter: {
        type: 'lowpass',
        cutoff: 8000,
        resonance: 1,
        keyTracking: 0
      },

      filterEnvelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 1,
        release: 0.1,
        amount: 0,
      },
      amplitudeEnvelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 1,
        release: 0.3,
      },
      lfo: {
        rate: 3,
        depth: 0.8,
        waveform: 'sine',
        sync: false,
        syncDivision: '4n',
      },
      velocity: {
        ampAmount: 0,
        filterAmount: 0,
      },
      noise: {
        type: 'white',
        level: 0,
      },
      glide: {
        enabled: false,
        time: 0.1,
      },
      pitchEnvelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 0,
        release: 0.1,
        amount: 0,
      },
      modEnvelope: {
        attack: 0.5,
        decay: 0.5,
        sustain: 0.5,
        release: 0.5,
        amount: 0,
      },
      pwmEnvelope: {
        attack: 0.01,
        decay: 0.3,
        sustain: 0.5,
        release: 0.3,
        amount: 0,
      },
      effects: { ...DEFAULT_EFFECTS },
      volume: -15,
    },
  },
  {
    name: 'Synth Kick',
    params: {
      oscillator: {
        type: 'sine',
        octave: -2,
        detune: 0,
        pulseWidth: 0.5
      },
      filter: {
        type: 'lowpass',
        cutoff: 200,
        resonance: 1,
        keyTracking: 0
      },

      filterEnvelope: {
        attack: 0.001,
        decay: 0.08,
        sustain: 0,
        release: 0.05,
        amount: 4,
      },
      amplitudeEnvelope: {
        attack: 0.001,
        decay: 0.15,
        sustain: 0,
        release: 0.1,
      },
      lfo: {
        rate: 1,
        depth: 0,
        waveform: 'sine',
        sync: false,
        syncDivision: '4n',
      },
      velocity: {
        ampAmount: 0,
        filterAmount: 0,
      },
      noise: {
        type: 'white',
        level: 0,
      },
      glide: {
        enabled: false,
        time: 0.1,
      },
      pitchEnvelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 0,
        release: 0.1,
        amount: 0,
      },
      modEnvelope: {
        attack: 0.5,
        decay: 0.5,
        sustain: 0.5,
        release: 0.5,
        amount: 0,
      },
      pwmEnvelope: {
        attack: 0.01,
        decay: 0.3,
        sustain: 0.5,
        release: 0.3,
        amount: 0,
      },
      effects: {
        ...DEFAULT_EFFECTS,
        distortion: { amount: 0.3, mix: 0.2 },
      },
      volume: -8,
    },
  },
  {
    name: 'Hi-hat',
    params: {
      oscillator: {
        type: 'square',
        octave: 2,
        detune: 50,
        pulseWidth: 0.5
      },
      filter: {
        type: 'highpass',
        cutoff: 8000,
        resonance: 2,
        keyTracking: 0
      },

      filterEnvelope: {
        attack: 0.001,
        decay: 0.05,
        sustain: 0,
        release: 0.05,
        amount: 2,
      },
      amplitudeEnvelope: {
        attack: 0.001,
        decay: 0.08,
        sustain: 0,
        release: 0.05,
      },
      lfo: {
        rate: 1,
        depth: 0,
        waveform: 'sine',
        sync: false,
        syncDivision: '4n',
      },
      velocity: {
        ampAmount: 0,
        filterAmount: 0,
      },
      noise: {
        type: 'white',
        level: 0,
      },
      glide: {
        enabled: false,
        time: 0.1,
      },
      pitchEnvelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 0,
        release: 0.1,
        amount: 0,
      },
      modEnvelope: {
        attack: 0.5,
        decay: 0.5,
        sustain: 0.5,
        release: 0.5,
        amount: 0,
      },
      pwmEnvelope: {
        attack: 0.01,
        decay: 0.3,
        sustain: 0.5,
        release: 0.3,
        amount: 0,
      },
      effects: { ...DEFAULT_EFFECTS },
      volume: -18,
    },
  },
];
