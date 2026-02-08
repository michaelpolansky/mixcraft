import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

/**
 * SD11-05: Classic Supersaw
 * The full JP-8000 style supersaw with all parameters dialed in
 */
export const challenge: Challenge = {
  id: 'sd11-05-classic-supersaw',
  title: 'Classic Supersaw',
  description: 'Recreate the iconic Roland JP-8000 supersaw. Maximum voices, optimal detune, full stereo spread, with a touch of reverb for depth.',
  difficulty: 3,
  module: 'SD11',
  testNote: 'C4',
  hints: [
    'The classic supersaw uses maximum sawtooth voices.',
    'Detune around 35 cents captures that 90s trance character.',
    'Full spread (0.8-1.0) makes it huge in stereo.',
    'A little reverb adds the characteristic tail.',
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
      cutoff: 8000,
      resonance: 0.5,
      keyTracking: 0.5,
    },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.4,
      sustain: 0.5,
      release: 0.5,
      amount: 1.5,
    },
    amplitudeEnvelope: {
      attack: 0.005,
      decay: 0.15,
      sustain: 0.9,
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
    unison: { enabled: true, voices: 8, detune: 35, spread: 0.8 },
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
      delay: { time: 0.25, feedback: 0.3, mix: 0 },
      reverb: { decay: 2, mix: 0.2 },
      chorus: { rate: 1.5, depth: 0.5, mix: 0 },
    },
    volume: -12,
    lfo2: DEFAULT_LFO2,
    modMatrix: DEFAULT_MOD_MATRIX,
    pan: 0,
  },
};
