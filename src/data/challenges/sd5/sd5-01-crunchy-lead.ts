import type { Challenge } from '../../../core/types.ts';

/**
 * SD5-01: Crunchy Lead
 * Teaches: Distortion basics
 *
 * Players learn that distortion adds harmonics and saturation,
 * making sounds grittier and more aggressive.
 */
export const challenge: Challenge = {
  id: 'sd5-01-crunchy-lead',
  title: 'Crunchy Lead',
  description: 'Create a gritty, distorted lead sound with some real edge. It should bite and snarl, not stay clean.',
  difficulty: 1,
  module: 'SD5',
  testNote: 'C4',
  hints: [
    'Distortion adds harmonics and grit to your sound.',
    'The Mix control blends between clean and distorted signal.',
    'A sawtooth wave through distortion gets really aggressive.',
  ],
  targetParams: {
    oscillator: {
      type: 'sawtooth',
      octave: 0,
      detune: 0,
      pulseWidth: 0.5
    },
    filter: {
      type: 'lowpass',
      cutoff: 3000,
      resonance: 2,
      keyTracking: 0
    },

    filterEnvelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.7,
      release: 0.3,
      amount: 1,
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
      distortion: { amount: 0.5, mix: 0.6 },
      delay: { time: 0.25, feedback: 0.3, mix: 0 },
      reverb: { decay: 1.5, mix: 0 },
      chorus: { rate: 1.5, depth: 0.5, mix: 0 },
    },
    volume: -12,
  },
};
