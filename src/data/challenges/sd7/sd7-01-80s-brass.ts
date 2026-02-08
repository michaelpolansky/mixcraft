import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

/**
 * SD7-01: 80s Brass Stab
 * Classic Oberheim/Prophet-style brass
 *
 * The iconic 80s brass stab: bright sawtooth with a fast
 * filter envelope sweep that gives it that punchy, brassy attack.
 */
export const challenge: Challenge = {
  id: 'sd7-01-80s-brass',
  title: '80s Brass Stab',
  description: 'Recreate that iconic 80s brass stab. It should have a bright, punchy attack that sweeps down quickly - think classic synth-pop and funk.',
  difficulty: 2,
  module: 'SD7',
  testNote: 'C4',
  hints: [
    'Sawtooth waves have the harmonic richness needed for brass sounds.',
    'The filter envelope sweep is what gives brass its characteristic "bwah" attack.',
    'Fast attack, quick decay on the filter envelope creates the punch.',
  ],
  targetParams: {
    oscillator: {
      type: 'sawtooth',
      octave: 0,
      detune: 0,
      pulseWidth: 0.5,
      level: 1,
    },
    filter: {
      type: 'lowpass',
      cutoff: 1200,
      resonance: 4,
      keyTracking: 0
    },

    filterEnvelope: {
      attack: 0.01,
      decay: 0.25,
      sustain: 0.3,
      release: 0.3,
      amount: 3,
    },
    amplitudeEnvelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.7,
      release: 0.3,
    },
    lfo: {
      rate: 1,
      depth: 0,
      waveform: 'sine',
      sync: false,
      syncDivision: '4n',
    },
    velocity: {
      ampAmount: 0,
      filterAmount: 0,
    },
    unison: { enabled: false, voices: 4, detune: 20, spread: 0.5 },
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
      delay: { time: 0.25, feedback: 0.2, mix: 0.15 },
      reverb: { decay: 1.5, mix: 0.2 },
      chorus: { rate: 1.5, depth: 0.5, mix: 0 },
    },
    volume: -12,
    lfo2: DEFAULT_LFO2,
    modMatrix: DEFAULT_MOD_MATRIX,
    pan: 0,
  },
};
