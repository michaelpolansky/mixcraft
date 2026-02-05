import type { Challenge } from '../../../core/types.ts';

/**
 * SD4-03: Rhythmic Pulse
 * Teaches: Square wave LFO for rhythmic on/off effects
 *
 * Players learn that different LFO waveforms create different
 * modulation shapes - square waves create sharp, rhythmic switching.
 */
export const challenge: Challenge = {
  id: 'sd4-03-rhythmic-pulse',
  title: 'Rhythmic Pulse',
  description: 'Create a rhythmic, pulsing sound that switches between bright and dark. It should feel like a steady beat.',
  difficulty: 2,
  module: 'SD4',
  testNote: 'C3',
  hints: [
    'A square wave LFO jumps instantly between high and low values.',
    'This creates a sharp on/off effect rather than a smooth sweep.',
    'Try a rate around 2-4 Hz for a rhythmic, musical pulse.',
  ],
  targetParams: {
    oscillator: {
      type: 'sawtooth',
      octave: 0,
      detune: 0,
    },
    filter: {
      type: 'lowpass',
      cutoff: 800,
      resonance: 5,
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
      rate: 3,
      depth: 0.7,
      waveform: 'square',
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
