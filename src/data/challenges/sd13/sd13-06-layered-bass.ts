import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

/**
 * SD13-06: Layered Bass
 * Full range bass using sub, main, and osc2
 */
export const challenge: Challenge = {
  id: 'sd13-06-layered-bass',
  title: 'Layered Bass',
  description: 'Create a full-range bass using all three oscillator sources. Sub for weight, main for body, and osc2 for harmonics.',
  difficulty: 3,
  module: 'SD13',
  testNote: 'C2',
  hints: [
    'Sub provides the fundamental low end.',
    'Main oscillator adds mid-range body.',
    'OSC2 an octave up adds brightness and cut.',
    'Balance all three for a complete bass sound.',
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
      cutoff: 2000,
      resonance: 3,
      keyTracking: 0,
    },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.3,
      sustain: 0.4,
      release: 0.25,
      amount: 2,
    },
    amplitudeEnvelope: {
      attack: 0.005,
      decay: 0.2,
      sustain: 0.75,
      release: 0.25,
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
      enabled: true,
      type: 'sine',
      octave: -1,
      level: 0.7,
    },
    oscillator2: {
      enabled: true,
      type: 'sawtooth',
      octave: 1,
      detune: 5,
      pulseWidth: 0.5,
      level: 0.25,
    },
    effects: {
      distortion: { amount: 0.15, mix: 0.15 },
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
