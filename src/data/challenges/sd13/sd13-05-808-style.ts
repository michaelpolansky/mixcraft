import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

/**
 * SD13-05: 808 Style Bass
 * Classic 808-style bass with dominant sub
 */
export const challenge: Challenge = {
  id: 'sd13-05-808-style',
  title: '808 Style Bass',
  description: 'Create an 808-style bass where the sub is the star. High sub level with pitch envelope drop for that classic hip-hop/trap sound.',
  difficulty: 2,
  module: 'SD13',
  testNote: 'C2',
  hints: [
    '808 bass is mostly sub with minimal harmonics.',
    'Pitch envelope adds the characteristic attack "boing".',
    'Keep the main oscillator low to let sub dominate.',
  ],
  targetParams: {
    oscillator: {
      type: 'sine',
      octave: 0,
      detune: 0,
      pulseWidth: 0.5,
      level: 0.3,
    },
    filter: {
      type: 'lowpass',
      cutoff: 800,
      resonance: 1,
      keyTracking: 0,
    },
    filterEnvelope: {
      attack: 0.001,
      decay: 0.2,
      sustain: 0.5,
      release: 0.3,
      amount: 0.5,
    },
    amplitudeEnvelope: {
      attack: 0.001,
      decay: 0.8,
      sustain: 0.3,
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
      decay: 0.15,
      sustain: 0,
      release: 0.1,
      amount: 2,
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
      level: 0.9,
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
      distortion: { amount: 0.1, mix: 0.1 },
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
