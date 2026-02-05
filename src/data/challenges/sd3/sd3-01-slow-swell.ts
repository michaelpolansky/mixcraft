import type { Challenge } from '../../../core/types.ts';

/**
 * SD3-01: Slow Swell
 * Teaches: Long attack time
 *
 * Players learn that attack controls how quickly a sound reaches
 * full volume - a long attack creates a gradual fade-in effect.
 */
export const challenge: Challenge = {
  id: 'sd3-01-slow-swell',
  title: 'Slow Swell',
  description: 'Create a pad sound that fades in slowly, like a string section swelling up. No sudden start - it should bloom gradually.',
  difficulty: 1,
  module: 'SD3',
  testNote: 'C4',
  hints: [
    'Attack controls how long it takes for the sound to reach full volume.',
    'A long attack time (over 0.5 seconds) creates that gradual fade-in.',
    'Pads often use triangle or sine waves for a smooth character.',
  ],
  targetParams: {
    oscillator: {
      type: 'triangle',
      octave: 0,
      detune: 0,
    },
    filter: {
      type: 'lowpass',
      cutoff: 2000,
      resonance: 0,
    },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 1,
      release: 0.5,
      amount: 0,
    },
    amplitudeEnvelope: {
      attack: 0.8,
      decay: 0.1,
      sustain: 0.9,
      release: 0.5,
    },
    lfo: {
      rate: 1,
      depth: 0,
      waveform: 'sine',
    },
    effects: {
      distortion: { amount: 0, mix: 0 },
      delay: { time: 0.25, feedback: 0.3, mix: 0 },
      reverb: { decay: 1.5, mix: 0 },
      chorus: { rate: 1.5, depth: 0.5, mix: 0 },
    },
    volume: -12,
  },
};
