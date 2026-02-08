import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

/**
 * SD15-02: Fast Glide
 * Quick pitch slides for articulate playing
 */
export const challenge: Challenge = {
  id: 'sd15-02-fast-glide',
  title: 'Fast Glide',
  description: 'Use a short glide time for quick pitch slides. Fast glide adds expression without slowing down melodic lines.',
  difficulty: 1,
  module: 'SD15',
  testNote: 'C4',
  hints: [
    'Short glide time (0.05s) for quick slides.',
    'Fast glide adds subtle pitch bending between notes.',
    'Great for expressive lead lines.',
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
      cutoff: 5000,
      resonance: 2,
      keyTracking: 0,
    },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.6,
      release: 0.25,
      amount: 1,
    },
    amplitudeEnvelope: {
      attack: 0.005,
      decay: 0.1,
      sustain: 0.8,
      release: 0.25,
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
    unison: { enabled: false, voices: 4, detune: 20, spread: 0.5 },
    noise: {
      type: 'white',
      level: 0,
    },
    glide: {
      enabled: true,
      time: 0.05,
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
      delay: { time: 0.25, feedback: 0.3, mix: 0 },
      reverb: { decay: 1.5, mix: 0.1 },
      chorus: { rate: 1.5, depth: 0.5, mix: 0 },
    },
    volume: -12,
    lfo2: DEFAULT_LFO2,
    modMatrix: DEFAULT_MOD_MATRIX,
    pan: 0,
  },
};
