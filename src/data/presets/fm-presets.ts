/**
 * FM Synth Presets
 * Musically useful parameter configurations for the FM synthesizer
 */

import type { FMSynthParams } from '../../core/types.ts';
import { DEFAULT_FM_SYNTH_PARAMS, DEFAULT_EFFECTS } from '../../core/types.ts';

export interface FMPreset {
  name: string;
  params: FMSynthParams;
}

export const FM_PRESETS: FMPreset[] = [
  {
    name: 'Default',
    params: { ...DEFAULT_FM_SYNTH_PARAMS },
  },
  {
    name: 'Electric Piano',
    params: {
      harmonicity: 1,
      modulationIndex: 3,
      carrierType: 'sine',
      modulatorType: 'sine',
      amplitudeEnvelope: {
        attack: 0.001,
        decay: 0.8,
        sustain: 0.3,
        release: 1.2,
      },
      modulationEnvelopeAmount: 0.8,
      effects: {
        ...DEFAULT_EFFECTS,
        reverb: { decay: 2, mix: 0.25 },
        chorus: { rate: 1.5, depth: 0.4, mix: 0.2 },
      },
      volume: -12,
    },
  },
  {
    name: 'Bell',
    params: {
      harmonicity: 5.07,
      modulationIndex: 4,
      carrierType: 'sine',
      modulatorType: 'sine',
      amplitudeEnvelope: {
        attack: 0.001,
        decay: 2,
        sustain: 0,
        release: 2.5,
      },
      modulationEnvelopeAmount: 0.2,
      effects: {
        ...DEFAULT_EFFECTS,
        reverb: { decay: 4, mix: 0.4 },
      },
      volume: -14,
    },
  },
  {
    name: 'Bass',
    params: {
      harmonicity: 0.5,
      modulationIndex: 2,
      carrierType: 'sine',
      modulatorType: 'sine',
      amplitudeEnvelope: {
        attack: 0.01,
        decay: 0.3,
        sustain: 0.6,
        release: 0.2,
      },
      modulationEnvelopeAmount: 0.7,
      effects: { ...DEFAULT_EFFECTS },
      volume: -10,
    },
  },
  {
    name: 'Metallic',
    params: {
      harmonicity: 7,
      modulationIndex: 8,
      carrierType: 'sine',
      modulatorType: 'square',
      amplitudeEnvelope: {
        attack: 0.001,
        decay: 0.5,
        sustain: 0.2,
        release: 0.8,
      },
      modulationEnvelopeAmount: 0.3,
      effects: {
        ...DEFAULT_EFFECTS,
        reverb: { decay: 3, mix: 0.3 },
      },
      volume: -16,
    },
  },
  {
    name: 'Brass',
    params: {
      harmonicity: 1,
      modulationIndex: 5,
      carrierType: 'sine',
      modulatorType: 'sine',
      amplitudeEnvelope: {
        attack: 0.08,
        decay: 0.2,
        sustain: 0.7,
        release: 0.3,
      },
      modulationEnvelopeAmount: 0.6,
      effects: { ...DEFAULT_EFFECTS },
      volume: -12,
    },
  },
  {
    name: 'Organ',
    params: {
      harmonicity: 2,
      modulationIndex: 1.5,
      carrierType: 'sine',
      modulatorType: 'sine',
      amplitudeEnvelope: {
        attack: 0.01,
        decay: 0.05,
        sustain: 0.95,
        release: 0.1,
      },
      modulationEnvelopeAmount: 0.5,
      effects: {
        ...DEFAULT_EFFECTS,
        chorus: { rate: 2, depth: 0.5, mix: 0.3 },
        reverb: { decay: 1.5, mix: 0.2 },
      },
      volume: -14,
    },
  },
  {
    name: 'Marimba',
    params: {
      harmonicity: 4,
      modulationIndex: 2.5,
      carrierType: 'sine',
      modulatorType: 'sine',
      amplitudeEnvelope: {
        attack: 0.001,
        decay: 0.4,
        sustain: 0,
        release: 0.5,
      },
      modulationEnvelopeAmount: 0.9,
      effects: {
        ...DEFAULT_EFFECTS,
        reverb: { decay: 2, mix: 0.3 },
      },
      volume: -12,
    },
  },
  {
    name: 'Synth Lead',
    params: {
      harmonicity: 3,
      modulationIndex: 6,
      carrierType: 'sine',
      modulatorType: 'sawtooth',
      amplitudeEnvelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.6,
        release: 0.4,
      },
      modulationEnvelopeAmount: 0.4,
      effects: {
        ...DEFAULT_EFFECTS,
        delay: { time: 0.3, feedback: 0.35, mix: 0.2 },
        reverb: { decay: 2, mix: 0.2 },
      },
      volume: -12,
    },
  },
  {
    name: 'Wobble',
    params: {
      harmonicity: 1,
      modulationIndex: 8,
      carrierType: 'sine',
      modulatorType: 'sine',
      amplitudeEnvelope: {
        attack: 0.01,
        decay: 0.3,
        sustain: 0.5,
        release: 0.3,
      },
      modulationEnvelopeAmount: 1,
      effects: {
        ...DEFAULT_EFFECTS,
        distortion: { amount: 0.3, mix: 0.2 },
      },
      volume: -10,
    },
  },
];
