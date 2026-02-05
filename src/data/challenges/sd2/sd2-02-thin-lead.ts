import type { Challenge } from '../../../core/types.ts';

/**
 * SD2-02: Thin Lead
 * Teaches: Highpass filter basics
 *
 * Players learn that highpass filters remove low frequencies,
 * making sounds thin and cutting through a mix.
 */
export const challenge: Challenge = {
  id: 'sd2-02-thin-lead',
  title: 'Thin Lead',
  description: 'Create a thin, cutting lead sound with no bass weight. It should slice through like a laser.',
  difficulty: 1,
  module: 'SD2',
  testNote: 'C5',
  hints: [
    'A square wave has a hollow, cutting quality.',
    'Highpass filters remove the low frequencies, leaving only the highs.',
    'Set the highpass cutoff high enough to remove all the bass weight.',
  ],
  targetParams: {
    oscillator: {
      type: 'square',
      octave: 0,
      detune: 0,
    },
    filter: {
      type: 'highpass',
      cutoff: 800,
      resonance: 1,
    },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 1,
      release: 0.2,
      amount: 0,
    },
    amplitudeEnvelope: {
      attack: 0.01,
      decay: 0.05,
      sustain: 0.9,
      release: 0.2,
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
