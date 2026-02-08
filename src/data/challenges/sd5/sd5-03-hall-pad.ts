import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

/**
 * SD5-03: Hall Pad
 * Teaches: Reverb for space and atmosphere
 *
 * Players learn that reverb simulates acoustic spaces,
 * making sounds feel like they're in a room, hall, or cathedral.
 */
export const challenge: Challenge = {
  id: 'sd5-03-hall-pad',
  title: 'Hall Pad',
  description: 'Create a lush, atmospheric pad that sounds like it\'s playing in a concert hall. The reverb should make it swim in space.',
  difficulty: 2,
  module: 'SD5',
  testNote: 'C4',
  hints: [
    'Reverb simulates the reflections in a physical space.',
    'Longer decay times create larger, more atmospheric spaces.',
    'Pads with slow attacks work beautifully with lots of reverb.',
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
      cutoff: 2000,
      resonance: 0,
      keyTracking: 0
    },

    filterEnvelope: {
      attack: 0.3,
      decay: 0.2,
      sustain: 0.8,
      release: 1.0,
      amount: 0.5,
    },
    amplitudeEnvelope: {
      attack: 0.5,
      decay: 0.2,
      sustain: 0.8,
      release: 1.0,
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
      reverb: { decay: 4.0, mix: 0.6 },
      chorus: { rate: 1.5, depth: 0.5, mix: 0 },
    },
    volume: -12,
    lfo2: DEFAULT_LFO2,
    modMatrix: DEFAULT_MOD_MATRIX,
    pan: 0,
  },
};
