import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

/**
 * SD7-06: Cinematic Strings
 * Lush, evolving orchestral-style pad
 *
 * A slowly evolving string-like pad that could score
 * an emotional film scene. Combines long envelopes
 * with rich effects for a cinematic quality.
 */
export const challenge: Challenge = {
  id: 'sd7-06-cinematic-strings',
  title: 'Cinematic Strings',
  description: 'Create a lush, emotional string pad worthy of a film score. It should swell slowly, shimmer beautifully, and fade like a distant orchestra.',
  difficulty: 3,
  module: 'SD7',
  testNote: 'C4',
  hints: [
    'Sawtooth waves are the foundation of classic string sounds.',
    'Very slow attack mimics the bow drawing across strings.',
    'Layer chorus and reverb heavily for that cinematic width and depth.',
  ],
  targetParams: {
    oscillator: {
      type: 'sawtooth',
      octave: 0,
      detune: 8,
      pulseWidth: 0.5,
      level: 1,
    },
    filter: {
      type: 'lowpass',
      cutoff: 2500,
      resonance: 1,
      keyTracking: 0
    },

    filterEnvelope: {
      attack: 1.0,
      decay: 0.5,
      sustain: 0.7,
      release: 2.0,
      amount: 0.8,
    },
    amplitudeEnvelope: {
      attack: 1.5,
      decay: 0.5,
      sustain: 0.75,
      release: 2.5,
    },
    lfo: {
      rate: 0.2,
      depth: 0.1,
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
      level: 0.5,
    },
    effects: {
      distortion: { amount: 0, mix: 0 },
      delay: { time: 0.4, feedback: 0.35, mix: 0.25 },
      reverb: { decay: 5.0, mix: 0.5 },
      chorus: { rate: 0.6, depth: 0.5, mix: 0.5 },
    },
    volume: -12,
    lfo2: DEFAULT_LFO2,
    modMatrix: DEFAULT_MOD_MATRIX,
    pan: 0,
  },
};
