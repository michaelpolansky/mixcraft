import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

/**
 * SD13-02: Sub Foundation
 * Build a bass sound with strong sub foundation
 */
export const challenge: Challenge = {
  id: 'sd13-02-sub-foundation',
  title: 'Sub Foundation',
  description: 'Create a bass with solid sub foundation. The sine sub provides the weight while the main oscillator adds character.',
  difficulty: 1,
  module: 'SD13',
  testNote: 'C2',
  hints: [
    'Higher sub level for more low-end presence.',
    'Use a lower filter cutoff to focus on bass frequencies.',
    'The main oscillator adds harmonics above the sub.',
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
      cutoff: 1500,
      resonance: 2,
      keyTracking: 0,
    },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.3,
      sustain: 0.4,
      release: 0.2,
      amount: 1.5,
    },
    amplitudeEnvelope: {
      attack: 0.005,
      decay: 0.15,
      sustain: 0.8,
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
    unison: { enabled: false, voices: 4, detune: 20, spread: 0.5 },
    noise: {
      type: 'white',
      level: 0,
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
      enabled: true,
      type: 'sine',
      octave: -1,
      level: 0.7,
    },
    oscillator2: {
      enabled: false,
      type: 'sawtooth',
      octave: 0,
      detune: 7,
      pulseWidth: 0.5,
      level: 0.5,
    },
    effects: {
      distortion: { amount: 0, mix: 0 },
      delay: { time: 0.25, feedback: 0.3, mix: 0 },
      reverb: { decay: 1.5, mix: 0 },
      chorus: { rate: 1.5, depth: 0.5, mix: 0 },
    },
    volume: -12,
    lfo2: DEFAULT_LFO2,
    modMatrix: DEFAULT_MOD_MATRIX,
    pan: 0,
  },
};
