import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

export const challenge: Challenge = {
  id: 'sd1-04-punchy-pluck',
  title: 'Punchy Pluck',
  description: 'Create a punchy, plucky sound with a sharp attack that quickly fades. Think of plucking a string.',
  difficulty: 2,
  module: 'SD1',
  testNote: 'C4',
  hints: [
    'Plucky sounds have very fast attacks and short decays.',
    'Square waves have a hollow but full character - good for plucks.',
    'The filter envelope can add a "pluck" to the brightness too.',
  ],
  targetParams: {
    oscillator: {
      type: 'square',
      octave: 0,
      detune: 0,
      pulseWidth: 0.5
    },
    filter: {
      type: 'lowpass',
      cutoff: 1500,
      resonance: 3,
      keyTracking: 0
    },

    filterEnvelope: {
      attack: 0.001,
      decay: 0.15,
      sustain: 0.2,
      release: 0.2,
      amount: 2.5,
    },
    amplitudeEnvelope: {
      attack: 0.005,
      decay: 0.2,
      sustain: 0.1,
      release: 0.15,
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
      mix: 0.5,
    },
    effects: {
      distortion: { amount: 0, mix: 0 },
      delay: { time: 0.25, feedback: 0.3, mix: 0 },
      reverb: { decay: 1.5, mix: 0 },
      chorus: { rate: 1.5, depth: 0.5, mix: 0 },
    },
    volume: -12,
    lfo2: DEFAULT_LFO2,
    modMatrix: DEFAULT_MOD_MATRIX,
    pan: 0,
  },
};
