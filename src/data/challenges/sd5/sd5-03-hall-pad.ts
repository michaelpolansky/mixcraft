import type { Challenge } from '../../../core/types.ts';

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
    },
    filter: {
      type: 'lowpass',
      cutoff: 2000,
      resonance: 0,
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
    },
    effects: {
      distortion: { amount: 0, mix: 0 },
      delay: { time: 0.25, feedback: 0.3, mix: 0 },
      reverb: { decay: 4.0, mix: 0.6 },
      chorus: { rate: 1.5, depth: 0.5, mix: 0 },
    },
    volume: -12,
  },
};
