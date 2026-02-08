import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

/**
 * SD17-04: Punchy Pluck
 * Percussive pluck sound with all the polish
 */
export const challenge: Challenge = {
  id: 'sd17-04-punchy-pluck',
  title: 'Punchy Pluck',
  description: 'Create a punchy, percussive pluck. Combine fast envelopes, noise transient, velocity response, and delay for maximum punch.',
  difficulty: 3,
  module: 'SD17',
  testNote: 'C4',
  hints: [
    'Fast decay envelopes for percussive attack.',
    'Noise adds click and definition.',
    'Velocity makes it expressive.',
    'Delay adds rhythmic interest.',
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
      resonance: 4,
      keyTracking: 0.5,
    },
    filterEnvelope: {
      attack: 0.001,
      decay: 0.15,
      sustain: 0.2,
      release: 0.15,
      amount: 3,
    },
    amplitudeEnvelope: {
      attack: 0.001,
      decay: 0.2,
      sustain: 0.3,
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
      ampAmount: 0.5,
      filterAmount: 0.6,
    },
    unison: { enabled: true, voices: 2, detune: 10, spread: 0.3 },
    noise: {
      type: 'white',
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
      decay: 0.05,
      sustain: 0,
      release: 0.1,
      amount: 1,
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
      type: 'square',
      octave: 0,
      detune: 5,
      pulseWidth: 0.5,
      level: 0.3,
    },
    effects: {
      distortion: { amount: 0, mix: 0 },
      delay: { time: 0.25, feedback: 0.35, mix: 0.25 },
      reverb: { decay: 1.5, mix: 0.15 },
      chorus: { rate: 1.5, depth: 0.5, mix: 0 },
    },
    volume: -12,
    lfo2: DEFAULT_LFO2,
    modMatrix: DEFAULT_MOD_MATRIX,
    pan: 0,
  },
};
