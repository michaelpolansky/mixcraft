import type { Challenge } from '../../../core/types.ts';

/**
 * SD7-04: Trance Supersaw
 * The iconic JP-8000 supersaw lead
 *
 * The supersaw is multiple detuned sawtooth waves stacked.
 * We approximate this with detune + chorus for thickness.
 */
export const challenge: Challenge = {
  id: 'sd7-04-trance-supersaw',
  title: 'Trance Supersaw',
  description: 'Create the massive, soaring supersaw lead that defined trance and EDM. It should be bright, thick, and larger than life.',
  difficulty: 3,
  module: 'SD7',
  testNote: 'C4',
  hints: [
    'Supersaws are multiple detuned sawtooths - we simulate with detune + chorus.',
    'Keep the filter bright to let all those harmonics through.',
    'The thickness comes from the chorus creating phantom oscillators.',
  ],
  targetParams: {
    oscillator: {
      type: 'sawtooth',
      octave: 0,
      detune: 15,
    },
    filter: {
      type: 'lowpass',
      cutoff: 4000,
      resonance: 1,
    },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.3,
      sustain: 0.8,
      release: 0.4,
      amount: 0.5,
    },
    amplitudeEnvelope: {
      attack: 0.02,
      decay: 0.2,
      sustain: 0.85,
      release: 0.5,
    },
    lfo: {
      rate: 0.2,
      depth: 0.05,
      waveform: 'sine',
    },
    effects: {
      distortion: { amount: 0, mix: 0 },
      delay: { time: 0.35, feedback: 0.3, mix: 0.25 },
      reverb: { decay: 2.0, mix: 0.3 },
      chorus: { rate: 1.5, depth: 0.8, mix: 0.5 },
    },
    volume: -12,
  },
};
