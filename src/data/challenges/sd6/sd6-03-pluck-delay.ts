import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

/**
 * SD6-03: Pluck Delay
 * Combines: Fast envelope + delay
 *
 * A rhythmic pluck sound where the delay creates
 * an echo pattern that adds movement and interest.
 */
export const challenge: Challenge = {
  id: 'sd6-03-pluck-delay',
  title: 'Pluck Delay',
  description: 'Create a plucky sound with rhythmic echoes. The initial pluck should be sharp, and the delay should create a bouncing pattern.',
  difficulty: 2,
  module: 'SD6',
  testNote: 'C4',
  hints: [
    'Start with a fast attack and short decay for the pluck character.',
    'The filter envelope adds brightness to the initial pluck.',
    'Delay with moderate feedback creates rhythmic echoes.',
  ],
  targetParams: {
    oscillator: {
      type: 'triangle',
      octave: 0,
      detune: 0,
      pulseWidth: 0.5,
      level: 1,
    },
    filter: {
      type: 'lowpass',
      cutoff: 2000,
      resonance: 3,
      keyTracking: 0
    },

    filterEnvelope: {
      attack: 0.001,
      decay: 0.2,
      sustain: 0.2,
      release: 0.3,
      amount: 2,
    },
    amplitudeEnvelope: {
      attack: 0.005,
      decay: 0.25,
      sustain: 0.1,
      release: 0.3,
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
    subOsc: {
      enabled: false,
      type: 'sine',
      octave: -1,
      level: 0.5,
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
      delay: { time: 0.3, feedback: 0.5, mix: 0.4 },
      reverb: { decay: 1.5, mix: 0.2 },
      chorus: { rate: 1.5, depth: 0.5, mix: 0 },
    },
    volume: -12,
    lfo2: DEFAULT_LFO2,
    modMatrix: DEFAULT_MOD_MATRIX,
    pan: 0,
  },
};
