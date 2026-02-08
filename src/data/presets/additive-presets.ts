/**
 * Additive Synth Presets
 * Musically useful parameter configurations for the additive synthesizer
 */

import type { AdditiveSynthParams } from '../../core/types.ts';
import {
  DEFAULT_ADDITIVE_SYNTH_PARAMS,
  DEFAULT_EFFECTS,
  ADDITIVE_PRESETS as HARMONIC_PRESETS,
  DEFAULT_ADDITIVE_LFO,
  DEFAULT_NOISE,
  DEFAULT_GLIDE,
  DEFAULT_ARPEGGIATOR,
  DEFAULT_ADDITIVE_MOD_MATRIX,
  DEFAULT_ADDITIVE_VELOCITY,
} from '../../core/types.ts';

export interface AdditivePreset {
  name: string;
  params: AdditiveSynthParams;
}

export const ADDITIVE_PRESETS: AdditivePreset[] = [
  {
    name: 'Default',
    params: { ...DEFAULT_ADDITIVE_SYNTH_PARAMS },
  },
  {
    name: 'Sawtooth',
    params: {
      harmonics: [...HARMONIC_PRESETS.saw],
      amplitudeEnvelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.7,
        release: 0.3,
      },
      effects: { ...DEFAULT_EFFECTS },
      volume: -14,
      lfo: { ...DEFAULT_ADDITIVE_LFO },
      noise: { ...DEFAULT_NOISE },
      glide: { ...DEFAULT_GLIDE },
      velocity: { ...DEFAULT_ADDITIVE_VELOCITY },
      arpeggiator: { ...DEFAULT_ARPEGGIATOR },
      modMatrix: { ...DEFAULT_ADDITIVE_MOD_MATRIX },
      pan: 0,
    },
  },
  {
    name: 'Square',
    params: {
      harmonics: [...HARMONIC_PRESETS.square],
      amplitudeEnvelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.7,
        release: 0.3,
      },
      effects: { ...DEFAULT_EFFECTS },
      volume: -14,
      lfo: { ...DEFAULT_ADDITIVE_LFO },
      noise: { ...DEFAULT_NOISE },
      glide: { ...DEFAULT_GLIDE },
      velocity: { ...DEFAULT_ADDITIVE_VELOCITY },
      arpeggiator: { ...DEFAULT_ARPEGGIATOR },
      modMatrix: { ...DEFAULT_ADDITIVE_MOD_MATRIX },
      pan: 0,
    },
  },
  {
    name: 'Triangle',
    params: {
      harmonics: [...HARMONIC_PRESETS.triangle],
      amplitudeEnvelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.7,
        release: 0.3,
      },
      effects: { ...DEFAULT_EFFECTS },
      volume: -12,
      lfo: { ...DEFAULT_ADDITIVE_LFO },
      noise: { ...DEFAULT_NOISE },
      glide: { ...DEFAULT_GLIDE },
      velocity: { ...DEFAULT_ADDITIVE_VELOCITY },
      arpeggiator: { ...DEFAULT_ARPEGGIATOR },
      modMatrix: { ...DEFAULT_ADDITIVE_MOD_MATRIX },
      pan: 0,
    },
  },
  {
    name: 'Organ',
    params: {
      harmonics: [...HARMONIC_PRESETS.organ],
      amplitudeEnvelope: {
        attack: 0.01,
        decay: 0.05,
        sustain: 0.95,
        release: 0.1,
      },
      effects: {
        ...DEFAULT_EFFECTS,
        chorus: { rate: 2, depth: 0.5, mix: 0.3 },
        reverb: { decay: 1.5, mix: 0.2 },
      },
      volume: -14,
      lfo: { ...DEFAULT_ADDITIVE_LFO },
      noise: { ...DEFAULT_NOISE },
      glide: { ...DEFAULT_GLIDE },
      velocity: { ...DEFAULT_ADDITIVE_VELOCITY },
      arpeggiator: { ...DEFAULT_ARPEGGIATOR },
      modMatrix: { ...DEFAULT_ADDITIVE_MOD_MATRIX },
      pan: 0,
    },
  },
  {
    name: 'Flute',
    params: {
      // Flute has a strong fundamental, weak 2nd, moderate 3rd, fading higher harmonics
      harmonics: [1, 0.1, 0.4, 0.15, 0.1, 0.05, 0.02, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      amplitudeEnvelope: {
        attack: 0.08,
        decay: 0.1,
        sustain: 0.8,
        release: 0.3,
      },
      effects: {
        ...DEFAULT_EFFECTS,
        reverb: { decay: 2, mix: 0.3 },
      },
      volume: -12,
      lfo: { ...DEFAULT_ADDITIVE_LFO },
      noise: { ...DEFAULT_NOISE },
      glide: { ...DEFAULT_GLIDE },
      velocity: { ...DEFAULT_ADDITIVE_VELOCITY },
      arpeggiator: { ...DEFAULT_ARPEGGIATOR },
      modMatrix: { ...DEFAULT_ADDITIVE_MOD_MATRIX },
      pan: 0,
    },
  },
  {
    name: 'Clarinet',
    params: {
      // Clarinet has odd harmonics dominant (like square wave but with different ratios)
      harmonics: [1, 0.05, 0.75, 0.04, 0.5, 0.03, 0.3, 0.02, 0.2, 0.01, 0.1, 0, 0.05, 0, 0.02, 0],
      amplitudeEnvelope: {
        attack: 0.05,
        decay: 0.1,
        sustain: 0.85,
        release: 0.2,
      },
      effects: {
        ...DEFAULT_EFFECTS,
        reverb: { decay: 1.5, mix: 0.25 },
      },
      volume: -14,
      lfo: { ...DEFAULT_ADDITIVE_LFO },
      noise: { ...DEFAULT_NOISE },
      glide: { ...DEFAULT_GLIDE },
      velocity: { ...DEFAULT_ADDITIVE_VELOCITY },
      arpeggiator: { ...DEFAULT_ARPEGGIATOR },
      modMatrix: { ...DEFAULT_ADDITIVE_MOD_MATRIX },
      pan: 0,
    },
  },
  {
    name: 'Strings',
    params: {
      // Rich string-like spectrum with all harmonics
      harmonics: [1, 0.7, 0.5, 0.4, 0.35, 0.3, 0.25, 0.2, 0.18, 0.15, 0.12, 0.1, 0.08, 0.06, 0.04, 0.02],
      amplitudeEnvelope: {
        attack: 0.5,
        decay: 0.4,
        sustain: 0.8,
        release: 1.5,
      },
      effects: {
        ...DEFAULT_EFFECTS,
        chorus: { rate: 1, depth: 0.6, mix: 0.4 },
        reverb: { decay: 3, mix: 0.4 },
      },
      volume: -14,
      lfo: { ...DEFAULT_ADDITIVE_LFO },
      noise: { ...DEFAULT_NOISE },
      glide: { ...DEFAULT_GLIDE },
      velocity: { ...DEFAULT_ADDITIVE_VELOCITY },
      arpeggiator: { ...DEFAULT_ARPEGGIATOR },
      modMatrix: { ...DEFAULT_ADDITIVE_MOD_MATRIX },
      pan: 0,
    },
  },
  {
    name: 'Choir',
    params: {
      // Vowel-like formant structure
      harmonics: [1, 0.9, 0.5, 0.7, 0.4, 0.5, 0.3, 0.4, 0.2, 0.3, 0.15, 0.2, 0.1, 0.1, 0.05, 0.05],
      amplitudeEnvelope: {
        attack: 0.6,
        decay: 0.4,
        sustain: 0.7,
        release: 2,
      },
      effects: {
        ...DEFAULT_EFFECTS,
        chorus: { rate: 0.8, depth: 0.7, mix: 0.5 },
        reverb: { decay: 4, mix: 0.5 },
      },
      volume: -14,
      lfo: { ...DEFAULT_ADDITIVE_LFO },
      noise: { ...DEFAULT_NOISE },
      glide: { ...DEFAULT_GLIDE },
      velocity: { ...DEFAULT_ADDITIVE_VELOCITY },
      arpeggiator: { ...DEFAULT_ARPEGGIATOR },
      modMatrix: { ...DEFAULT_ADDITIVE_MOD_MATRIX },
      pan: 0,
    },
  },
  {
    name: 'Shimmer',
    params: {
      // Emphasize high harmonics for a bright, shimmering quality
      harmonics: [0.3, 0.2, 0.3, 0.25, 0.4, 0.35, 0.5, 0.45, 0.6, 0.55, 0.7, 0.6, 0.8, 0.7, 0.9, 1],
      amplitudeEnvelope: {
        attack: 0.3,
        decay: 0.5,
        sustain: 0.6,
        release: 2,
      },
      effects: {
        ...DEFAULT_EFFECTS,
        delay: { time: 0.4, feedback: 0.5, mix: 0.3 },
        reverb: { decay: 5, mix: 0.6 },
      },
      volume: -16,
      lfo: { ...DEFAULT_ADDITIVE_LFO },
      noise: { ...DEFAULT_NOISE },
      glide: { ...DEFAULT_GLIDE },
      velocity: { ...DEFAULT_ADDITIVE_VELOCITY },
      arpeggiator: { ...DEFAULT_ARPEGGIATOR },
      modMatrix: { ...DEFAULT_ADDITIVE_MOD_MATRIX },
      pan: 0,
    },
  },
  // New presets showcasing new features
  {
    name: 'Shimmer Pad',
    params: {
      // Bright harmonics that shimmer with LFO modulation
      harmonics: [0.5, 0.4, 0.6, 0.5, 0.7, 0.6, 0.8, 0.7, 0.9, 0.8, 1, 0.9, 0.95, 0.85, 0.9, 0.8],
      amplitudeEnvelope: {
        attack: 0.5,
        decay: 0.6,
        sustain: 0.7,
        release: 2.5,
      },
      effects: {
        ...DEFAULT_EFFECTS,
        chorus: { rate: 0.6, depth: 0.7, mix: 0.5 },
        delay: { time: 0.5, feedback: 0.45, mix: 0.25 },
        reverb: { decay: 6, mix: 0.6 },
      },
      volume: -16,
      // LFO modulating brightness for shimmer effect
      lfo: {
        rate: 0.5,
        depth: 0.6,
        waveform: 'triangle',
        destination: 'brightness',
      },
      noise: { type: 'white', level: 0.03 },
      glide: { enabled: true, time: 0.3 },
      velocity: { ampAmount: 0.2, brightnessAmount: 0.4 },
      arpeggiator: { ...DEFAULT_ARPEGGIATOR },
      modMatrix: {
        routes: [
          { source: 'lfo', destination: 'brightness', amount: 0.6, enabled: true },
          { source: 'lfo', destination: 'pan', amount: 0.4, enabled: true },
          { source: 'ampEnvelope', destination: 'brightness', amount: 0.3, enabled: true },
          { source: 'velocity', destination: 'amplitude', amount: 0.2, enabled: true },
        ],
      },
      pan: 0,
    },
  },
  {
    name: 'Pluck Arp',
    params: {
      // Bright attack with decaying harmonics
      harmonics: [1, 0.8, 0.65, 0.5, 0.4, 0.32, 0.25, 0.2, 0.15, 0.12, 0.1, 0.08, 0.06, 0.04, 0.03, 0.02],
      amplitudeEnvelope: {
        attack: 0.002,
        decay: 0.25,
        sustain: 0.2,
        release: 0.4,
      },
      effects: {
        ...DEFAULT_EFFECTS,
        delay: { time: 0.25, feedback: 0.4, mix: 0.35 },
        reverb: { decay: 2.5, mix: 0.3 },
      },
      volume: -14,
      lfo: { ...DEFAULT_ADDITIVE_LFO },
      noise: { type: 'white', level: 0.02 },
      glide: { enabled: false, time: 0.1 },
      velocity: { ampAmount: 0.5, brightnessAmount: 0.6 },
      // Arpeggiator enabled
      arpeggiator: {
        enabled: true,
        pattern: 'up',
        division: '16n',
        octaves: 2,
        gate: 0.5,
      },
      modMatrix: {
        routes: [
          { source: 'lfo', destination: 'brightness', amount: 0, enabled: false },
          { source: 'lfo', destination: 'pitch', amount: 0, enabled: false },
          { source: 'ampEnvelope', destination: 'brightness', amount: 0.5, enabled: true },
          { source: 'velocity', destination: 'amplitude', amount: 0.5, enabled: true },
        ],
      },
      pan: 0,
    },
  },
  {
    name: 'Breath Pad',
    params: {
      // Mellow harmonics with breath-like noise
      harmonics: [1, 0.5, 0.3, 0.2, 0.15, 0.1, 0.08, 0.05, 0.03, 0.02, 0.01, 0, 0, 0, 0, 0],
      amplitudeEnvelope: {
        attack: 0.8,
        decay: 0.5,
        sustain: 0.6,
        release: 2,
      },
      effects: {
        ...DEFAULT_EFFECTS,
        chorus: { rate: 0.5, depth: 0.5, mix: 0.3 },
        reverb: { decay: 4, mix: 0.5 },
      },
      volume: -14,
      // Slow LFO for gentle brightness movement
      lfo: {
        rate: 0.2,
        depth: 0.3,
        waveform: 'sine',
        destination: 'brightness',
      },
      // Pink noise for breathy texture
      noise: { type: 'pink', level: 0.15 },
      glide: { enabled: true, time: 0.4 },
      velocity: { ampAmount: 0.3, brightnessAmount: 0.2 },
      arpeggiator: { ...DEFAULT_ARPEGGIATOR },
      modMatrix: {
        routes: [
          { source: 'lfo', destination: 'brightness', amount: 0.3, enabled: true },
          { source: 'lfo', destination: 'pan', amount: 0.2, enabled: true },
          { source: 'ampEnvelope', destination: 'brightness', amount: 0.2, enabled: true },
          { source: 'velocity', destination: 'amplitude', amount: 0.3, enabled: true },
        ],
      },
      pan: 0,
    },
  },
];
