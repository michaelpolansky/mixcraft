import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

/**
 * SD6-04: Distorted Lead
 * Combines: Distortion + filter resonance + envelope
 *
 * An aggressive, cutting lead sound that uses distortion
 * for grit and resonance for bite.
 */
export const challenge: Challenge = {
  id: 'sd6-04-distorted-lead',
  title: 'Distorted Lead',
  description: 'Create an aggressive, biting lead that cuts through everything. It should have grit, edge, and attitude.',
  difficulty: 2,
  module: 'SD6',
  testNote: 'C4',
  hints: [
    'Square waves have a hollow character that takes distortion well.',
    'Filter resonance adds a sharp, biting quality.',
    'Distortion adds harmonics and aggression.',
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
      cutoff: 2500,
      resonance: 8,
      keyTracking: 0
    },

    filterEnvelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.6,
      release: 0.2,
      amount: 1.5,
    },
    amplitudeEnvelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.8,
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
      mix: 0.5,
    },
    effects: {
      distortion: { amount: 0.6, mix: 0.5 },
      delay: { time: 0.25, feedback: 0.3, mix: 0.15 },
      reverb: { decay: 1.5, mix: 0.1 },
      chorus: { rate: 1.5, depth: 0.5, mix: 0 },
    },
    volume: -12,
    lfo2: DEFAULT_LFO2,
    modMatrix: DEFAULT_MOD_MATRIX,
    pan: 0,
  },
};
