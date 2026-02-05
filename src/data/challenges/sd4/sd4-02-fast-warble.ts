import type { Challenge } from '../../../core/types.ts';

/**
 * SD4-02: Fast Warble
 * Teaches: Faster LFO rates for warbling/vibrato effects
 *
 * Players learn that increasing LFO rate creates faster modulation,
 * from slow sweeps to rapid warbling.
 */
export const challenge: Challenge = {
  id: 'sd4-02-fast-warble',
  title: 'Fast Warble',
  description: 'Create a warbling, vibrato-like effect. The filter should flutter rapidly, giving the sound an animated, alive quality.',
  difficulty: 1,
  module: 'SD4',
  testNote: 'C4',
  hints: [
    'Faster LFO rates create quicker oscillations - try 4-8 Hz for warbling.',
    'A moderate depth keeps the effect musical without being overwhelming.',
    'Triangle waves can give a smoother warble than sine waves.',
  ],
  targetParams: {
    oscillator: {
      type: 'sawtooth',
      octave: 0,
      detune: 0,
    },
    filter: {
      type: 'lowpass',
      cutoff: 1500,
      resonance: 3,
    },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 1,
      release: 0.3,
      amount: 0,
    },
    amplitudeEnvelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.8,
      release: 0.3,
    },
    lfo: {
      rate: 6,
      depth: 0.4,
      waveform: 'triangle',
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
