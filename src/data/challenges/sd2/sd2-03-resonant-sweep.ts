import type { Challenge } from '../../../core/types.ts';

/**
 * SD2-03: Resonant Sweep
 * Teaches: Filter resonance
 *
 * Players learn that resonance boosts frequencies around the cutoff,
 * creating that classic "squelchy" synthesizer character.
 */
export const challenge: Challenge = {
  id: 'sd2-03-resonant-sweep',
  title: 'Resonant Sweep',
  description: 'Create that classic "squelchy" synth sound. The filter should have an obvious resonant peak that gives it character.',
  difficulty: 2,
  module: 'SD2',
  testNote: 'C3',
  hints: [
    'Resonance boosts the frequencies right at the filter cutoff.',
    'Higher resonance = more "squelch" and character.',
    'Try a sawtooth through a lowpass with the resonance turned up.',
  ],
  targetParams: {
    oscillator: {
      type: 'sawtooth',
      octave: 0,
      detune: 0,
    },
    filter: {
      type: 'lowpass',
      cutoff: 1200,
      resonance: 12,
    },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.3,
      sustain: 0.3,
      release: 0.3,
      amount: 2,
    },
    amplitudeEnvelope: {
      attack: 0.01,
      decay: 0.3,
      sustain: 0.6,
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
