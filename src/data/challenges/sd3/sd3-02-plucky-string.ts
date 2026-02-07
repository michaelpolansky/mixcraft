import type { Challenge } from '../../../core/types.ts';

/**
 * SD3-02: Plucky String
 * Teaches: Fast attack, short decay, low sustain
 *
 * Players learn that decay controls how quickly the sound drops
 * after the initial attack, and sustain sets the held level.
 */
export const challenge: Challenge = {
  id: 'sd3-02-plucky-string',
  title: 'Plucky String',
  description: 'Create a quick plucked sound like a guitar or harp string. It should start instantly and decay away quickly.',
  difficulty: 1,
  module: 'SD3',
  testNote: 'C4',
  hints: [
    'Plucked sounds need an instant attack - as fast as possible.',
    'Decay controls how quickly the sound fades after the initial hit.',
    'A low sustain level means the sound doesn\'t hold - it dies away.',
  ],
  targetParams: {
    oscillator: {
      type: 'sawtooth',
      octave: 0,
      detune: 0,
    },
    filter: {
      type: 'lowpass',
      cutoff: 1500,
      resonance: 2,
    },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.3,
      release: 0.2,
      amount: 1,
    },
    amplitudeEnvelope: {
      attack: 0.005,
      decay: 0.3,
      sustain: 0.1,
      release: 0.2,
    },
    lfo: {
      rate: 1,
      depth: 0,
      waveform: 'sine',
      sync: false,
      syncDivision: '4n',
    },
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
    effects: {
      distortion: { amount: 0, mix: 0 },
      delay: { time: 0.25, feedback: 0.3, mix: 0 },
      reverb: { decay: 1.5, mix: 0 },
      chorus: { rate: 1.5, depth: 0.5, mix: 0 },
    },
    volume: -12,
  },
};
