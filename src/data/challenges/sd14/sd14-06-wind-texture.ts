import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

/**
 * SD14-06: Wind Texture
 * Creating atmospheric wind using filtered noise
 */
export const challenge: Challenge = {
  id: 'sd14-06-wind-texture',
  title: 'Wind Texture',
  description: 'Create an atmospheric wind effect using noise as the primary sound source. Filter modulation creates the movement of wind.',
  difficulty: 3,
  module: 'SD14',
  testNote: 'C4',
  hints: [
    'Noise is the main sound - oscillator just for body.',
    'Brown noise is even darker than pink for wind.',
    'LFO on filter creates the breathing wind motion.',
    'Reverb adds space and atmosphere.',
  ],
  targetParams: {
    oscillator: {
      type: 'sine',
      octave: 0,
      detune: 0,
      pulseWidth: 0.5,
      level: 0.2,
    },
    filter: {
      type: 'bandpass',
      cutoff: 1500,
      resonance: 4,
      keyTracking: 0,
    },
    filterEnvelope: {
      attack: 0.3,
      decay: 0.5,
      sustain: 0.5,
      release: 0.8,
      amount: 0.5,
    },
    amplitudeEnvelope: {
      attack: 0.3,
      decay: 0.4,
      sustain: 0.7,
      release: 1,
    },
    lfo: {
      rate: 0.3,
      depth: 0.4,
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
      type: 'brown',
      level: 0.6,
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
      delay: { time: 0.5, feedback: 0.4, mix: 0.2 },
      reverb: { decay: 3, mix: 0.4 },
      chorus: { rate: 0.5, depth: 0.3, mix: 0.15 },
    },
    volume: -12,
    lfo2: DEFAULT_LFO2,
    modMatrix: DEFAULT_MOD_MATRIX,
    pan: 0,
  },
};
