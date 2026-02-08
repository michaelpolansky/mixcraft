import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

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
      pulseWidth: 0.5,
      level: 1,
    },
    filter: {
      type: 'lowpass',
      cutoff: 4000,
      resonance: 1,
      keyTracking: 0
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
      sync: false,
      syncDivision: '4n',
    },
    velocity: {
      ampAmount: 0,
      filterAmount: 0,
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
      delay: { time: 0.35, feedback: 0.3, mix: 0.25 },
      reverb: { decay: 2.0, mix: 0.3 },
      chorus: { rate: 1.5, depth: 0.8, mix: 0.5 },
    },
    volume: -12,
    lfo2: DEFAULT_LFO2,
    modMatrix: DEFAULT_MOD_MATRIX,
    pan: 0,
  },
};
