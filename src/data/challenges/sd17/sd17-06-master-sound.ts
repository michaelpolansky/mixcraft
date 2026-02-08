import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

/**
 * SD17-06: Master Sound
 * The ultimate challenge: every technique combined
 */
export const challenge: Challenge = {
  id: 'sd17-06-master-sound',
  title: 'Master Sound',
  description: 'The ultimate sound design challenge. Use every technique you\'ve learned: oscillators, sub, noise, envelopes, glide, velocity, unison, and effects.',
  difficulty: 3,
  module: 'SD17',
  testNote: 'C4',
  hints: [
    'This uses nearly every synth feature.',
    'Dual oscillators with sub for full range.',
    'Unison, glide, and velocity for expression.',
    'Full effects chain for polish.',
    'You\'ve mastered subtractive synthesis!',
  ],
  targetParams: {
    oscillator: {
      type: 'sawtooth',
      octave: 0,
      detune: 0,
      pulseWidth: 0.5,
      level: 0.85,
    },
    filter: {
      type: 'lowpass',
      cutoff: 2000,
      resonance: 5,
      keyTracking: 0.5,
    },
    filterEnvelope: {
      attack: 0.02,
      decay: 0.4,
      sustain: 0.35,
      release: 0.5,
      amount: 3,
    },
    amplitudeEnvelope: {
      attack: 0.01,
      decay: 0.25,
      sustain: 0.8,
      release: 0.5,
    },
    lfo: {
      rate: 5,
      depth: 0.08,
      waveform: 'sine',
      sync: false,
      syncDivision: '4n',
    },
    velocity: {
      ampAmount: 0.4,
      filterAmount: 0.5,
    },
    unison: { enabled: true, voices: 4, detune: 20, spread: 0.5 },
    noise: {
      type: 'white',
      level: 0.08,
    },
    glide: {
      enabled: true,
      time: 0.06,
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
      decay: 0.08,
      sustain: 0,
      release: 0.1,
      amount: 0.5,
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
      enabled: true,
      type: 'sine',
      octave: -1,
      level: 0.4,
    },
    oscillator2: {
      enabled: true,
      type: 'sawtooth',
      octave: 1,
      detune: 7,
      pulseWidth: 0.5,
      level: 0.3,
    },
    effects: {
      distortion: { amount: 0.1, mix: 0.1 },
      delay: { time: 0.375, feedback: 0.3, mix: 0.2 },
      reverb: { decay: 2.5, mix: 0.25 },
      chorus: { rate: 1, depth: 0.4, mix: 0.15 },
    },
    volume: -12,
    lfo2: DEFAULT_LFO2,
    modMatrix: DEFAULT_MOD_MATRIX,
    pan: 0,
  },
};
