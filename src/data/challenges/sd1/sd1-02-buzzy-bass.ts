import type { Challenge } from '../../../core/types.ts';

export const challenge: Challenge = {
  id: 'sd1-02-buzzy-bass',
  title: 'Buzzy Bass',
  description: 'Create a thick, buzzy bass sound. It should be rich in harmonics but not too bright.',
  difficulty: 1,
  module: 'SD1',
  testNote: 'C3',
  hints: [
    'Bass sounds live in the lower octaves.',
    'A sawtooth wave is rich in harmonics - perfect for thick sounds.',
    'Use the filter to tame the brightness while keeping the body.',
  ],
  targetParams: {
    oscillator: {
      type: 'sawtooth',
      octave: -1,
      detune: 0,
    },
    filter: {
      type: 'lowpass',
      cutoff: 800,
      resonance: 2,
    },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.4,
      release: 0.2,
      amount: 1,
    },
    amplitudeEnvelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.7,
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
