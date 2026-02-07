import type { Challenge } from '../../../core/types.ts';

/**
 * SD3-04: Fading Echo
 * Teaches: Long release time
 *
 * Players learn that release controls how long the sound takes
 * to fade out after the key is released.
 */
export const challenge: Challenge = {
  id: 'sd3-04-fading-echo',
  title: 'Fading Echo',
  description: 'Create a sound that lingers and fades slowly after you release the key, like a piano with the sustain pedal held down.',
  difficulty: 2,
  module: 'SD3',
  testNote: 'C4',
  hints: [
    'Release controls how long the sound takes to fade after you let go.',
    'A long release (1-2 seconds) creates that lingering, ambient tail.',
    'The sound should decay naturally, not cut off abruptly.',
  ],
  targetParams: {
    oscillator: {
      type: 'triangle',
      octave: 0,
      detune: 0,
    },
    filter: {
      type: 'lowpass',
      cutoff: 2500,
      resonance: 1,
    },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.3,
      sustain: 0.7,
      release: 1.5,
      amount: 0.5,
    },
    amplitudeEnvelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.7,
      release: 1.5,
    },
    lfo: {
      rate: 1,
      depth: 0,
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
      distortion: { amount: 0, mix: 0 },
      delay: { time: 0.25, feedback: 0.3, mix: 0 },
      reverb: { decay: 1.5, mix: 0 },
      chorus: { rate: 1.5, depth: 0.5, mix: 0 },
    },
    volume: -12,
  },
};
