import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

/**
 * SD7-03: Juno Pad
 * The signature Roland Juno-60/106 pad sound
 *
 * The Juno's legendary pad sound comes from its warm
 * oscillators combined with its famous chorus circuit.
 */
export const challenge: Challenge = {
  id: 'sd7-03-juno-pad',
  title: 'Juno Pad',
  description: 'Recreate the lush, warm pad sound of the Roland Juno synthesizers. It should shimmer and breathe with that signature chorus movement.',
  difficulty: 2,
  module: 'SD7',
  testNote: 'C4',
  hints: [
    'The Juno used sawtooth waves with a warm, slightly filtered character.',
    'The famous Juno chorus is what gives it that lush, wide sound.',
    'Slow attack and release create the pad-like, evolving quality.',
  ],
  targetParams: {
    oscillator: {
      type: 'sawtooth',
      octave: 0,
      detune: 5,
      pulseWidth: 0.5,
      level: 1,
    },
    filter: {
      type: 'lowpass',
      cutoff: 2000,
      resonance: 2,
      keyTracking: 0
    },

    filterEnvelope: {
      attack: 0.4,
      decay: 0.3,
      sustain: 0.7,
      release: 1.0,
      amount: 0.5,
    },
    amplitudeEnvelope: {
      attack: 0.5,
      decay: 0.3,
      sustain: 0.8,
      release: 1.2,
    },
    lfo: {
      rate: 0.3,
      depth: 0.1,
      waveform: 'sine',
      sync: false,
      syncDivision: '4n',
    },
    velocity: {
      ampAmount: 0,
      filterAmount: 0,
    },
    unison: { enabled: false, voices: 4, detune: 20, spread: 0.5 },
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
      level: 0.5,
    },
    effects: {
      distortion: { amount: 0, mix: 0 },
      delay: { time: 0.3, feedback: 0.25, mix: 0.2 },
      reverb: { decay: 2.5, mix: 0.35 },
      chorus: { rate: 1.2, depth: 0.7, mix: 0.6 },
    },
    volume: -12,
    lfo2: DEFAULT_LFO2,
    modMatrix: DEFAULT_MOD_MATRIX,
    pan: 0,
  },
};
