import type { Challenge } from '../../../core/types.ts';

export const challenge: Challenge = {
  id: 'sd1-01-pure-tone',
  title: 'Pure Tone',
  description: 'Create a clean, pure tone with no harmonics. Think of a tuning fork or a whistle.',
  difficulty: 1,
  module: 'SD1',
  testNote: 'C4',
  hints: [
    'A pure tone has only one frequency - no overtones or harmonics.',
    'Which waveform produces only the fundamental frequency?',
    'The sine wave is the simplest waveform - it has no harmonics.',
  ],
  targetParams: {
    oscillator: {
      type: 'sine',
      octave: 0,
      detune: 0,
    },
    filter: {
      type: 'lowpass',
      cutoff: 8000,
      resonance: 1,
    },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.8,
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
