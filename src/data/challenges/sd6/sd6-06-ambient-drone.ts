import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

/**
 * SD6-06: Ambient Drone
 * Combines: Long envelopes + reverb + chorus + subtle LFO
 *
 * A slowly evolving ambient texture that demonstrates
 * how all elements work together to create atmosphere.
 */
export const challenge: Challenge = {
  id: 'sd6-06-ambient-drone',
  title: 'Ambient Drone',
  description: 'Create a slowly evolving ambient drone. It should breathe and shimmer, feeling infinite and atmospheric - like floating in space.',
  difficulty: 3,
  module: 'SD6',
  testNote: 'C3',
  hints: [
    'Very slow attack and long release create that evolving, breathing quality.',
    'Combine reverb AND chorus for maximum atmosphere.',
    'A subtle, slow LFO adds gentle movement without being obvious.',
  ],
  targetParams: {
    oscillator: {
      type: 'sine',
      octave: 0,
      detune: 0,
      pulseWidth: 0.5,
      level: 1,
    },
    filter: {
      type: 'lowpass',
      cutoff: 1500,
      resonance: 2,
      keyTracking: 0
    },

    filterEnvelope: {
      attack: 1.0,
      decay: 0.5,
      sustain: 0.6,
      release: 2.0,
      amount: 1,
    },
    amplitudeEnvelope: {
      attack: 1.2,
      decay: 0.5,
      sustain: 0.7,
      release: 2.5,
    },
    lfo: {
      rate: 0.3,
      depth: 0.2,
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
    arpeggiator: {
      enabled: false,
      pattern: 'up',
      division: '8n',
      octaves: 1,
      gate: 0.5,
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
      delay: { time: 0.5, feedback: 0.4, mix: 0.3 },
      reverb: { decay: 6.0, mix: 0.6 },
      chorus: { rate: 0.8, depth: 0.5, mix: 0.4 },
    },
    volume: -12,
    lfo2: DEFAULT_LFO2,
    modMatrix: DEFAULT_MOD_MATRIX,
    pan: 0,
  },
};
