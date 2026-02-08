import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

/**
 * SD17-02: Massive Bass
 * Full-featured bass using all available tools
 */
export const challenge: Challenge = {
  id: 'sd17-02-massive-bass',
  title: 'Massive Bass',
  description: 'Build a massive bass sound using all available features. Sub oscillator, dual oscillators, glide, and saturation for maximum impact.',
  difficulty: 3,
  module: 'SD17',
  testNote: 'C2',
  hints: [
    'Sub oscillator provides the foundation.',
    'Main and OSC2 add harmonics and character.',
    'Glide creates smooth bass lines.',
    'Light distortion adds presence.',
  ],
  targetParams: {
    oscillator: {
      type: 'sawtooth',
      octave: 0,
      detune: 0,
      pulseWidth: 0.5,
      level: 0.8,
    },
    filter: {
      type: 'lowpass',
      cutoff: 1800,
      resonance: 4,
      keyTracking: 0,
    },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.3,
      sustain: 0.35,
      release: 0.2,
      amount: 2.5,
    },
    amplitudeEnvelope: {
      attack: 0.005,
      decay: 0.2,
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
      ampAmount: 0.3,
      filterAmount: 0.4,
    },
    unison: { enabled: false, voices: 4, detune: 20, spread: 0.5 },
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
      decay: 0.08,
      sustain: 0,
      release: 0.1,
      amount: 1.5,
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
      level: 0.7,
    },
    oscillator2: {
      enabled: true,
      type: 'square',
      octave: 1,
      detune: 0,
      pulseWidth: 0.5,
      level: 0.2,
    },
    effects: {
      distortion: { amount: 0.2, mix: 0.2 },
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
