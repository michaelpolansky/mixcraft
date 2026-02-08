import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

/**
 * SD12-06: Dual Oscillator Lead
 * Full dual oscillator lead sound with effects
 */
export const challenge: Challenge = {
  id: 'sd12-06-dual-osc-lead',
  title: 'Dual Osc Lead',
  description: 'Create a complete dual oscillator lead. Combine octave layering, detuning, filter movement, and effects for a polished sound.',
  difficulty: 3,
  module: 'SD12',
  testNote: 'C4',
  hints: [
    'Layer OSC2 an octave up for brightness.',
    'Add slight detune for movement and thickness.',
    'Use filter envelope and reverb to complete the sound.',
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
      resonance: 4,
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
      depth: 0.1,
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
      detune: 7,
      pulseWidth: 0.5,
      level: 0.35,
    },
    effects: {
      distortion: { amount: 0, mix: 0 },
      delay: { time: 0.375, feedback: 0.3, mix: 0.2 },
      reverb: { decay: 2, mix: 0.2 },
      chorus: { rate: 1.5, depth: 0.5, mix: 0 },
    },
    volume: -12,
    lfo2: DEFAULT_LFO2,
    modMatrix: DEFAULT_MOD_MATRIX,
    pan: 0,
  },
};
