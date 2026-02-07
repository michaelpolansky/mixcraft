import type { Challenge } from '../../../core/types.ts';

/**
 * SD5-04: Lush Strings
 * Teaches: Chorus for width and thickness
 *
 * Players learn that chorus creates copies of the sound with
 * slight pitch and timing variations, making it wider and richer.
 */
export const challenge: Challenge = {
  id: 'sd5-04-lush-strings',
  title: 'Lush Strings',
  description: 'Create a thick, shimmering string-like sound. It should feel wide and full, like multiple instruments playing together.',
  difficulty: 2,
  module: 'SD5',
  testNote: 'C4',
  hints: [
    'Chorus creates slightly detuned copies of your sound.',
    'This thickens the sound and makes it feel wider in stereo.',
    'A moderate rate (1-3 Hz) creates a lush, musical shimmer.',
  ],
  targetParams: {
    oscillator: {
      type: 'sawtooth',
      octave: 0,
      detune: 0,
    },
    filter: {
      type: 'lowpass',
      cutoff: 3000,
      resonance: 1,
    },
    filterEnvelope: {
      attack: 0.2,
      decay: 0.3,
      sustain: 0.7,
      release: 0.5,
      amount: 0.5,
    },
    amplitudeEnvelope: {
      attack: 0.3,
      decay: 0.2,
      sustain: 0.8,
      release: 0.5,
    },
    lfo: {
      rate: 1,
      depth: 0,
      waveform: 'sine',
      sync: false,
      syncDivision: '4n',
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
      distortion: { amount: 0, mix: 0 },
      delay: { time: 0.25, feedback: 0.3, mix: 0 },
      reverb: { decay: 1.5, mix: 0.2 },
      chorus: { rate: 2.0, depth: 0.7, mix: 0.6 },
    },
    volume: -12,
  },
};
