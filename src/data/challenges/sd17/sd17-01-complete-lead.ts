import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

/**
 * SD17-01: Complete Lead
 * Combining all lead sound techniques
 */
export const challenge: Challenge = {
  id: 'sd17-01-complete-lead',
  title: 'Complete Lead',
  description: 'Create a complete lead sound using multiple techniques. Combine oscillators, glide, velocity, unison, and effects for a professional lead.',
  difficulty: 3,
  module: 'SD17',
  testNote: 'C4',
  hints: [
    'Use dual oscillators with slight detune.',
    'Add glide for expression and unison for thickness.',
    'Velocity sensitivity makes it playable.',
    'Effects polish the final sound.',
  ],
  targetParams: {
    oscillator: {
      type: 'sawtooth',
      octave: 0,
      detune: 0,
      pulseWidth: 0.5,
      level: 1,
    },
    filter: {
      type: 'lowpass',
      cutoff: 2500,
      resonance: 4,
      keyTracking: 0.5,
    },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.35,
      sustain: 0.4,
      release: 0.4,
      amount: 2.5,
    },
    amplitudeEnvelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.85,
      release: 0.4,
    },
    lfo: {
      rate: 5.5,
      depth: 0.1,
      waveform: 'sine',
      sync: false,
      syncDivision: '4n',
    },
    velocity: {
      ampAmount: 0.4,
      filterAmount: 0.5,
    },
    unison: { enabled: true, voices: 4, detune: 15, spread: 0.4 },
    noise: {
      type: 'white',
      level: 0,
    },
    glide: {
      enabled: true,
      time: 0.08,
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
      type: 'sawtooth',
      octave: 1,
      detune: 7,
      pulseWidth: 0.5,
      level: 0.3,
    },
    effects: {
      distortion: { amount: 0, mix: 0 },
      delay: { time: 0.375, feedback: 0.3, mix: 0.2 },
      reverb: { decay: 2, mix: 0.2 },
      chorus: { rate: 1.5, depth: 0.5, mix: 0 },
    },
    volume: -12,
    lfo2: DEFAULT_LFO2,
    modMatrix: DEFAULT_MOD_MATRIX,
    pan: 0,
  },
};
