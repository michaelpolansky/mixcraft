import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

/**
 * SD6-02: Pad Stack
 * Combines: Slow attack + chorus + reverb
 *
 * A lush, wide pad sound that demonstrates how effects
 * can transform a simple oscillator into something cinematic.
 */
export const challenge: Challenge = {
  id: 'sd6-02-pad-stack',
  title: 'Pad Stack',
  description: 'Create a lush, wide pad that swells in slowly and fills the stereo field. It should feel thick, shimmery, and atmospheric.',
  difficulty: 2,
  module: 'SD6',
  testNote: 'C4',
  hints: [
    'Pads need slow attacks to fade in gracefully.',
    'Chorus adds width and shimmer by creating detuned copies.',
    'Reverb adds space and atmosphere - don\'t be shy with it!',
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
      resonance: 1,
      keyTracking: 0
    },

    filterEnvelope: {
      attack: 0.4,
      decay: 0.3,
      sustain: 0.7,
      release: 1.0,
      amount: 0.5,
    },
    amplitudeEnvelope: {
      attack: 0.6,
      decay: 0.3,
      sustain: 0.8,
      release: 1.2,
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
      reverb: { decay: 3.5, mix: 0.5 },
      chorus: { rate: 1.5, depth: 0.6, mix: 0.5 },
    },
    volume: -12,
    lfo2: DEFAULT_LFO2,
    modMatrix: DEFAULT_MOD_MATRIX,
    pan: 0,
  },
};
