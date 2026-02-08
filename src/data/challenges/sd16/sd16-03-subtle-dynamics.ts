import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

/**
 * SD16-03: Subtle Dynamics
 * Gentle velocity response for nuanced playing
 */
export const challenge: Challenge = {
  id: 'sd16-03-subtle-dynamics',
  title: 'Subtle Dynamics',
  description: 'Create subtle velocity response for nuanced expression. Small amounts of velocity sensitivity add life without extreme dynamics.',
  difficulty: 2,
  module: 'SD16',
  testNote: 'C4',
  hints: [
    'Low velocity amounts (0.2-0.3) for subtle response.',
    'Both amp and filter can respond subtly.',
    'Subtle dynamics feel more natural and musical.',
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
      cutoff: 3000,
      resonance: 1,
      keyTracking: 0,
    },
    filterEnvelope: {
      attack: 0.05,
      decay: 0.3,
      sustain: 0.6,
      release: 0.4,
      amount: 0.5,
    },
    amplitudeEnvelope: {
      attack: 0.02,
      decay: 0.2,
      sustain: 0.8,
      release: 0.4,
    },
    lfo: {
      rate: 1,
      depth: 0,
      waveform: 'sine',
      sync: false,
      syncDivision: '4n',
    },
    velocity: {
      ampAmount: 0.25,
      filterAmount: 0.2,
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
      delay: { time: 0.25, feedback: 0.3, mix: 0.1 },
      reverb: { decay: 2, mix: 0.2 },
      chorus: { rate: 1.5, depth: 0.5, mix: 0 },
    },
    volume: -12,
    lfo2: DEFAULT_LFO2,
    modMatrix: DEFAULT_MOD_MATRIX,
    pan: 0,
  },
};
