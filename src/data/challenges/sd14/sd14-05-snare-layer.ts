import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

/**
 * SD14-05: Snare Layer
 * Heavy noise for snare-like characteristics
 */
export const challenge: Challenge = {
  id: 'sd14-05-snare-layer',
  title: 'Snare Layer',
  description: 'Create a snare-like transient using mostly noise. High noise level with fast decay simulates the snare wire rattle.',
  difficulty: 2,
  module: 'SD14',
  testNote: 'C4',
  hints: [
    'Noise is the main component of snare character.',
    'Very fast decay makes it percussive.',
    'Add a touch of oscillator for body/tone.',
  ],
  targetParams: {
    oscillator: {
      type: 'triangle',
      octave: 0,
      detune: 0,
      pulseWidth: 0.5,
      level: 0.4,
    },
    filter: {
      type: 'highpass',
      cutoff: 200,
      resonance: 1,
      keyTracking: 0,
    },
    filterEnvelope: {
      attack: 0.001,
      decay: 0.1,
      sustain: 0.2,
      release: 0.1,
      amount: 1,
    },
    amplitudeEnvelope: {
      attack: 0.001,
      decay: 0.15,
      sustain: 0.1,
      release: 0.1,
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
      level: 0.7,
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
      amount: 3,
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
      reverb: { decay: 0.8, mix: 0.15 },
      chorus: { rate: 1.5, depth: 0.5, mix: 0 },
    },
    volume: -12,
    lfo2: DEFAULT_LFO2,
    modMatrix: DEFAULT_MOD_MATRIX,
    pan: 0,
  },
};
