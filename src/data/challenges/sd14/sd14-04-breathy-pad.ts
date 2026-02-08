import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

/**
 * SD14-04: Breathy Pad
 * Sustained noise for airy, breathy pads
 */
export const challenge: Challenge = {
  id: 'sd14-04-breathy-pad',
  title: 'Breathy Pad',
  description: 'Create an airy, breathy pad by blending noise with a soft oscillator. The noise adds organic breathiness to the sustained tone.',
  difficulty: 2,
  module: 'SD14',
  testNote: 'C4',
  hints: [
    'Triangle waves are soft and blend well with noise.',
    'Pink noise is warmer for pad sounds.',
    'Slow attack and release for pad-like behavior.',
  ],
  targetParams: {
    oscillator: {
      type: 'triangle',
      octave: 0,
      detune: 0,
      pulseWidth: 0.5,
      level: 0.8,
    },
    filter: {
      type: 'lowpass',
      cutoff: 3000,
      resonance: 1,
      keyTracking: 0,
    },
    filterEnvelope: {
      attack: 0.2,
      decay: 0.4,
      sustain: 0.6,
      release: 0.6,
      amount: 0.5,
    },
    amplitudeEnvelope: {
      attack: 0.15,
      decay: 0.3,
      sustain: 0.7,
      release: 0.6,
    },
    lfo: {
      rate: 0.5,
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
      type: 'pink',
      level: 0.25,
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
      reverb: { decay: 2.5, mix: 0.35 },
      chorus: { rate: 0.8, depth: 0.4, mix: 0.2 },
    },
    volume: -12,
    lfo2: DEFAULT_LFO2,
    modMatrix: DEFAULT_MOD_MATRIX,
    pan: 0,
  },
};
