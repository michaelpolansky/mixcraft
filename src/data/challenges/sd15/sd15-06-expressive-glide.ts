import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

/**
 * SD15-06: Expressive Glide
 * Combining glide with other expressive features
 */
export const challenge: Challenge = {
  id: 'sd15-06-expressive-glide',
  title: 'Expressive Glide',
  description: 'Create a fully expressive sound combining glide with vibrato, filter movement, and effects. This is the ultimate expressive synth voice.',
  difficulty: 3,
  module: 'SD15',
  testNote: 'C4',
  hints: [
    'Combine glide with LFO vibrato for expression.',
    'Filter envelope adds tonal movement.',
    'Delay and reverb extend the expressiveness.',
  ],
  targetParams: {
    oscillator: {
      type: 'sawtooth',
      octave: 0,
      detune: 0,
      pulseWidth: 0.5,
      level: 1,
    },
    filter: {
      type: 'lowpass',
      cutoff: 2500,
      resonance: 5,
      keyTracking: 0.5,
    },
    filterEnvelope: {
      attack: 0.02,
      decay: 0.4,
      sustain: 0.4,
      release: 0.5,
      amount: 2.5,
    },
    amplitudeEnvelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.85,
      release: 0.5,
    },
    lfo: {
      rate: 5,
      depth: 0.12,
      waveform: 'sine',
      sync: false,
      syncDivision: '4n',
    },
    velocity: {
      ampAmount: 0,
      filterAmount: 0,
    },
    unison: { enabled: true, voices: 2, detune: 10, spread: 0.3 },
    noise: {
      type: 'white',
      level: 0,
    },
    glide: {
      enabled: true,
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
      enabled: true,
      type: 'sawtooth',
      octave: 1,
      detune: 5,
      pulseWidth: 0.5,
      level: 0.3,
    },
    effects: {
      distortion: { amount: 0, mix: 0 },
      delay: { time: 0.375, feedback: 0.35, mix: 0.2 },
      reverb: { decay: 2, mix: 0.2 },
      chorus: { rate: 1, depth: 0.3, mix: 0.15 },
    },
    volume: -12,
    lfo2: DEFAULT_LFO2,
    modMatrix: DEFAULT_MOD_MATRIX,
    pan: 0,
  },
};
