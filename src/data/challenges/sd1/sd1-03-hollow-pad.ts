import type { Challenge } from '../../../core/types.ts';

export const challenge: Challenge = {
  id: 'sd1-03-hollow-pad',
  title: 'Hollow Pad',
  description: 'Create a soft, hollow pad sound that swells in slowly. It should feel mellow and sustained.',
  difficulty: 2,
  module: 'SD1',
  testNote: 'C4',
  hints: [
    'Pads typically have slow attacks - they fade in rather than hit hard.',
    'Triangle waves have a hollow, flute-like quality.',
    'High sustain keeps the sound going while you hold the note.',
  ],
  targetParams: {
    oscillator: {
      type: 'triangle',
      octave: 0,
      detune: 0,
      pulseWidth: 0.5
    },
    filter: {
      type: 'lowpass',
      cutoff: 3000,
      resonance: 1,
      keyTracking: 0
    },

    filterEnvelope: {
      attack: 0.3,
      decay: 0.2,
      sustain: 0.7,
      release: 0.5,
      amount: 1,
    },
    amplitudeEnvelope: {
      attack: 0.4,
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
    effects: {
      distortion: { amount: 0, mix: 0 },
      delay: { time: 0.25, feedback: 0.3, mix: 0 },
      reverb: { decay: 1.5, mix: 0 },
      chorus: { rate: 1.5, depth: 0.5, mix: 0 },
    },
    volume: -12,
  },
};
