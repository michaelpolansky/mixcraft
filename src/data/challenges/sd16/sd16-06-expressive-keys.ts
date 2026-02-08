import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

/**
 * SD16-06: Expressive Keys
 * Full velocity-sensitive keyboard sound
 */
export const challenge: Challenge = {
  id: 'sd16-06-expressive-keys',
  title: 'Expressive Keys',
  description: 'Create a fully expressive keyboard sound. Combine velocity sensitivity with effects for a complete, playable instrument.',
  difficulty: 3,
  module: 'SD16',
  testNote: 'C4',
  hints: [
    'Balanced amp and filter velocity response.',
    'Effects enhance the expressiveness.',
    'This is a complete, playable instrument patch.',
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
      cutoff: 2500,
      resonance: 2,
      keyTracking: 0.5,
    },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.4,
      sustain: 0.4,
      release: 0.4,
      amount: 1.5,
    },
    amplitudeEnvelope: {
      attack: 0.01,
      decay: 0.3,
      sustain: 0.7,
      release: 0.4,
    },
    lfo: {
      rate: 5,
      depth: 0.05,
      waveform: 'sine',
      sync: false,
      syncDivision: '4n',
    },
    velocity: {
      ampAmount: 0.5,
      filterAmount: 0.5,
    },
    unison: { enabled: true, voices: 2, detune: 8, spread: 0.2 },
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
      type: 'triangle',
      octave: 1,
      detune: 0,
      pulseWidth: 0.5,
      level: 0.25,
    },
    effects: {
      distortion: { amount: 0, mix: 0 },
      delay: { time: 0.3, feedback: 0.25, mix: 0.15 },
      reverb: { decay: 2, mix: 0.2 },
      chorus: { rate: 1, depth: 0.3, mix: 0.1 },
    },
    volume: -12,
    lfo2: DEFAULT_LFO2,
    modMatrix: DEFAULT_MOD_MATRIX,
    pan: 0,
  },
};
