import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

/**
 * SD5-02: Slapback Echo
 * Teaches: Short delay for doubling/thickening
 *
 * Players learn that short delay times (50-150ms) create
 * a "slapback" effect that thickens the sound.
 */
export const challenge: Challenge = {
  id: 'sd5-02-slapback-echo',
  title: 'Slapback Echo',
  description: 'Create a sound with a quick echo, like a 50s rockabilly guitar. The delay should be short enough to feel like a double, not a distinct repeat.',
  difficulty: 1,
  module: 'SD5',
  testNote: 'C4',
  hints: [
    'Delay creates echoes of your sound.',
    'Very short delay times (under 150ms) create a "slapback" doubling effect.',
    'Keep feedback low to avoid multiple repeats - we want just one echo.',
  ],
  targetParams: {
    oscillator: {
      type: 'square',
      octave: 0,
      detune: 0,
      pulseWidth: 0.5,
      level: 1,
    },
    filter: {
      type: 'lowpass',
      cutoff: 2500,
      resonance: 1,
      keyTracking: 0
    },

    filterEnvelope: {
      attack: 0.01,
      decay: 0.15,
      sustain: 0.5,
      release: 0.2,
      amount: 1,
    },
    amplitudeEnvelope: {
      attack: 0.005,
      decay: 0.2,
      sustain: 0.3,
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
      delay: { time: 0.12, feedback: 0.2, mix: 0.5 },
      reverb: { decay: 1.5, mix: 0 },
      chorus: { rate: 1.5, depth: 0.5, mix: 0 },
    },
    volume: -12,
    lfo2: DEFAULT_LFO2,
    modMatrix: DEFAULT_MOD_MATRIX,
    pan: 0,
  },
};
