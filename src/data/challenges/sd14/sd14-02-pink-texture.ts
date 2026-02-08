import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

/**
 * SD14-02: Pink Noise Texture
 * Using pink noise for a warmer texture
 */
export const challenge: Challenge = {
  id: 'sd14-02-pink-texture',
  title: 'Pink Texture',
  description: 'Use pink noise instead of white for a warmer texture. Pink noise has less high-frequency energy, making it less harsh.',
  difficulty: 1,
  module: 'SD14',
  testNote: 'C4',
  hints: [
    'Pink noise rolls off at high frequencies.',
    'It sounds more natural and less harsh than white.',
    'Pink noise is often used for pads and ambient sounds.',
  ],
  targetParams: {
    oscillator: {
      type: 'triangle',
      octave: 0,
      detune: 0,
      pulseWidth: 0.5,
      level: 1,
    },
    filter: {
      type: 'lowpass',
      cutoff: 4000,
      resonance: 1,
      keyTracking: 0,
    },
    filterEnvelope: {
      attack: 0.1,
      decay: 0.3,
      sustain: 0.6,
      release: 0.5,
      amount: 0.5,
    },
    amplitudeEnvelope: {
      attack: 0.1,
      decay: 0.2,
      sustain: 0.8,
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
    unison: { enabled: false, voices: 4, detune: 20, spread: 0.5 },
    noise: {
      type: 'pink',
      level: 0.2,
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
