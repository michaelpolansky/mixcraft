import type { Challenge } from '../../../core/types.ts';

/**
 * SD2-01: Muffled Tone
 * Teaches: Lowpass filter cutoff basics
 *
 * Players learn that lowpass filters remove high frequencies,
 * making sounds darker and more "muffled".
 */
export const challenge: Challenge = {
  id: 'sd2-01-muffled-tone',
  title: 'Muffled Tone',
  description: 'Create a dark, muffled sound - like music playing through a wall. Start bright and filter it down.',
  difficulty: 1,
  module: 'SD2',
  testNote: 'C4',
  hints: [
    'A sawtooth wave has lots of high frequencies to work with.',
    'Lowpass filters let low frequencies through and cut the highs.',
    'A very low cutoff frequency will make the sound dark and muffled.',
  ],
  targetParams: {
    oscillator: {
      type: 'sawtooth',
      octave: 0,
      detune: 0,
    },
    filter: {
      type: 'lowpass',
      cutoff: 400,
      resonance: 0,
    },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 1,
      release: 0.3,
      amount: 0,
    },
    amplitudeEnvelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.8,
      release: 0.3,
    },
    lfo: {
      rate: 1,
      depth: 0,
      waveform: 'sine',
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
