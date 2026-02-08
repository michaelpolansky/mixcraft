import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

/**
 * SD15-04: Mono Lead with Glide
 * Classic monophonic lead sound with portamento
 */
export const challenge: Challenge = {
  id: 'sd15-04-mono-lead',
  title: 'Mono Lead',
  description: 'Create a classic monophonic lead with glide. This is the foundation of expressive synth solos - single notes that slide smoothly.',
  difficulty: 2,
  module: 'SD15',
  testNote: 'C4',
  hints: [
    'Mono leads use glide for expressive pitch bends.',
    'Medium glide time balances speed and expression.',
    'Add vibrato (LFO) for extra expressiveness.',
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
      cutoff: 3500,
      resonance: 4,
      keyTracking: 0.5,
    },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.3,
      sustain: 0.5,
      release: 0.3,
      amount: 2,
    },
    amplitudeEnvelope: {
      attack: 0.01,
      decay: 0.15,
      sustain: 0.85,
      release: 0.3,
    },
    lfo: {
      rate: 5.5,
      depth: 0.08,
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
      enabled: true,
      time: 0.08,
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
      octave: 0,
      detune: 7,
      pulseWidth: 0.5,
      level: 0.4,
    },
    effects: {
      distortion: { amount: 0, mix: 0 },
      delay: { time: 0.375, feedback: 0.3, mix: 0.15 },
      reverb: { decay: 1.5, mix: 0.15 },
      chorus: { rate: 1.5, depth: 0.5, mix: 0 },
    },
    volume: -12,
    lfo2: DEFAULT_LFO2,
    modMatrix: DEFAULT_MOD_MATRIX,
    pan: 0,
  },
};
