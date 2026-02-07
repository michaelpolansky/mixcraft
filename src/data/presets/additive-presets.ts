/**
 * Additive Synth Presets
 * Musically useful parameter configurations for the additive synthesizer
 */

import type { AdditiveSynthParams } from '../../core/types.ts';
import { DEFAULT_ADDITIVE_SYNTH_PARAMS, DEFAULT_EFFECTS, ADDITIVE_PRESETS as HARMONIC_PRESETS } from '../../core/types.ts';

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
    },
  },
];
