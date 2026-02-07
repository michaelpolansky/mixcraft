import type { Challenge } from '../../../core/types.ts';

/**
 * SD7-02: Reese Bass
 * Classic jungle/drum and bass bass sound
 *
 * The Reese bass gets its characteristic sound from detuned
 * oscillators creating a beating/phasing effect. We simulate
 * this with detune and chorus.
 */
export const challenge: Challenge = {
  id: 'sd7-02-reese-bass',
  title: 'Reese Bass',
  description: 'Create the legendary Reese bass from jungle and drum & bass. It should have that thick, swirling, almost alive quality from detuned oscillators phasing against each other.',
  difficulty: 3,
  module: 'SD7',
  testNote: 'C2',
  hints: [
    'The Reese sound comes from detuned sawtooth waves beating against each other.',
    'Heavy detune (around 20-25 cents) creates the characteristic phasing.',
    'Chorus adds extra movement and thickness to simulate multiple oscillators.',
  ],
  targetParams: {
    oscillator: {
      type: 'sawtooth',
      octave: -1,
      detune: 25,
    },
    filter: {
      type: 'lowpass',
      cutoff: 1000,
      resonance: 3,
    },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.8,
      release: 0.3,
      amount: 0.5,
    },
    amplitudeEnvelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.9,
      release: 0.2,
    },
    lfo: {
      rate: 0.5,
      depth: 0.15,
      waveform: 'sine',
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
      distortion: { amount: 0.2, mix: 0.3 },
      delay: { time: 0.25, feedback: 0.3, mix: 0 },
      reverb: { decay: 1.5, mix: 0 },
      chorus: { rate: 0.8, depth: 0.6, mix: 0.4 },
    },
    volume: -12,
  },
};
