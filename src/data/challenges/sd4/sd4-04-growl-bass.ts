import type { Challenge } from '../../../core/types.ts';

/**
 * SD4-04: Growl Bass
 * Teaches: Combining LFO with resonance for aggressive sounds
 *
 * Players learn that combining modulation with high resonance
 * creates that classic aggressive, "growling" bass sound.
 */
export const challenge: Challenge = {
  id: 'sd4-04-growl-bass',
  title: 'Growl Bass',
  description: 'Create an aggressive, growling bass that snarls and bites. Think dubstep or EDM bass that has real attitude.',
  difficulty: 2,
  module: 'SD4',
  testNote: 'C2',
  hints: [
    'High resonance makes the filter "sing" as it sweeps.',
    'A medium-fast LFO rate (4-8 Hz) creates that aggressive growl.',
    'Sawtooth LFO can give a more aggressive, ramp-like modulation.',
  ],
  targetParams: {
    oscillator: {
      type: 'sawtooth',
      octave: -1,
      detune: 0,
    },
    filter: {
      type: 'lowpass',
      cutoff: 600,
      resonance: 12,
    },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.5,
      release: 0.3,
      amount: 1,
    },
    amplitudeEnvelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.8,
      release: 0.3,
    },
    lfo: {
      rate: 5,
      depth: 0.8,
      waveform: 'sawtooth',
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
