import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

/**
 * SD6-05: Wobble Bass
 * Combines: LFO + low octave + filter + resonance
 *
 * The classic dubstep wobble bass that combines aggressive
 * LFO modulation with a resonant lowpass filter.
 */
export const challenge: Challenge = {
  id: 'sd6-05-wobble-bass',
  title: 'Wobble Bass',
  description: 'Create that iconic dubstep wobble bass. It should pulse and throb rhythmically, with the filter opening and closing dramatically.',
  difficulty: 3,
  module: 'SD6',
  testNote: 'C2',
  hints: [
    'Start with a sawtooth in a low octave for maximum bass weight.',
    'The LFO rate controls how fast the wobble cycles.',
    'High resonance makes the filter sweep more dramatic and vocal.',
  ],
  targetParams: {
    oscillator: {
      type: 'sawtooth',
      octave: -1,
      detune: 0,
      pulseWidth: 0.5,
      level: 1,
    },
    filter: {
      type: 'lowpass',
      cutoff: 800,
      resonance: 10,
      keyTracking: 0
    },

    filterEnvelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.8,
      release: 0.2,
      amount: 0,
    },
    amplitudeEnvelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.9,
      release: 0.2,
    },
    lfo: {
      rate: 4,
      depth: 0.8,
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
      distortion: { amount: 0.3, mix: 0.4 },
      delay: { time: 0.25, feedback: 0.3, mix: 0 },
      reverb: { decay: 1.5, mix: 0 },
      chorus: { rate: 1.5, depth: 0.5, mix: 0 },
    },
    volume: -12,
    lfo2: DEFAULT_LFO2,
    modMatrix: DEFAULT_MOD_MATRIX,
    pan: 0,
  },
};
