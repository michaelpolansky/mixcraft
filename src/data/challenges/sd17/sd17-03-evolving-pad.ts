import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

/**
 * SD17-03: Evolving Pad
 * Complex pad using modulation and layering
 */
export const challenge: Challenge = {
  id: 'sd17-03-evolving-pad',
  title: 'Evolving Pad',
  description: 'Create an evolving pad that changes over time. Use LFO modulation, slow envelopes, and effects for cinematic atmosphere.',
  difficulty: 3,
  module: 'SD17',
  testNote: 'C4',
  hints: [
    'Slow LFO creates evolving movement.',
    'Long envelopes for pad-like behavior.',
    'Unison and chorus add width.',
    'Heavy reverb for atmosphere.',
  ],
  targetParams: {
    oscillator: {
      type: 'sawtooth',
      octave: 0,
      detune: 0,
      pulseWidth: 0.5,
      level: 0.7,
    },
    filter: {
      type: 'lowpass',
      cutoff: 2000,
      resonance: 3,
      keyTracking: 0,
    },
    filterEnvelope: {
      attack: 0.5,
      decay: 1,
      sustain: 0.5,
      release: 1,
      amount: 1.5,
    },
    amplitudeEnvelope: {
      attack: 0.4,
      decay: 0.5,
      sustain: 0.8,
      release: 1,
    },
    lfo: {
      rate: 0.3,
      depth: 0.25,
      waveform: 'sine',
      sync: false,
      syncDivision: '4n',
    },
    velocity: {
      ampAmount: 0.2,
      filterAmount: 0.3,
    },
    unison: { enabled: true, voices: 4, detune: 20, spread: 0.6 },
    noise: {
      type: 'pink',
      level: 0.1,
    },
    glide: {
      enabled: false,
      time: 0.1,
    },
    arpeggiator: {
      enabled: false,
      pattern: 'up',
      division: '8n',
      octaves: 1,
      gate: 0.5,
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
    subOsc: {
      enabled: false,
      type: 'sine',
      octave: -1,
      level: 0.5,
    },
    oscillator2: {
      enabled: true,
      type: 'triangle',
      octave: 1,
      detune: 5,
      pulseWidth: 0.5,
      level: 0.3,
    },
    effects: {
      distortion: { amount: 0, mix: 0 },
      delay: { time: 0.5, feedback: 0.4, mix: 0.25 },
      reverb: { decay: 3, mix: 0.4 },
      chorus: { rate: 0.8, depth: 0.5, mix: 0.25 },
    },
    volume: -12,
    lfo2: DEFAULT_LFO2,
    modMatrix: DEFAULT_MOD_MATRIX,
    pan: 0,
  },
};
