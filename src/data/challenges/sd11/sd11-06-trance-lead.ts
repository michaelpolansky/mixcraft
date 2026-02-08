import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

/**
 * SD11-06: Trance Lead
 * Combining supersaw with effects for a complete trance lead sound
 */
export const challenge: Challenge = {
  id: 'sd11-06-trance-lead',
  title: 'Trance Lead',
  description: 'Create the ultimate trance lead. Combine supersaw with filter envelope movement, delay for rhythm, and reverb for space.',
  difficulty: 3,
  module: 'SD11',
  testNote: 'C4',
  hints: [
    'Start with the classic supersaw foundation.',
    'Filter envelope attack adds that opening sweep characteristic.',
    'Delay synced to tempo creates rhythmic interest.',
    'Reverb ties it all together in a big space.',
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
      cutoff: 2000,
      resonance: 3,
      keyTracking: 0.5,
    },
    filterEnvelope: {
      attack: 0.05,
      decay: 0.5,
      sustain: 0.4,
      release: 0.5,
      amount: 3,
    },
    amplitudeEnvelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.85,
      release: 0.6,
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
    unison: { enabled: true, voices: 8, detune: 35, spread: 0.9 },
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
      delay: { time: 0.375, feedback: 0.35, mix: 0.25 },
      reverb: { decay: 2.5, mix: 0.25 },
      chorus: { rate: 1.5, depth: 0.5, mix: 0 },
    },
    volume: -12,
    lfo2: DEFAULT_LFO2,
    modMatrix: DEFAULT_MOD_MATRIX,
    pan: 0,
  },
};
