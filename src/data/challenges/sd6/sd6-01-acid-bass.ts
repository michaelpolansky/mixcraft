import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

/**
 * SD6-01: Acid Bass
 * Combines: Filter resonance + filter envelope + low octave
 *
 * The classic 303-style acid bass sound. Players must combine
 * high resonance with a fast filter envelope decay for that
 * iconic "squelchy" character.
 */
export const challenge: Challenge = {
  id: 'sd6-01-acid-bass',
  title: 'Acid Bass',
  description: 'Create that classic squelchy acid bass sound. It should have a sharp, resonant "blip" at the start of each note that quickly settles down.',
  difficulty: 2,
  module: 'SD6',
  testNote: 'C2',
  hints: [
    'Acid bass uses a sawtooth wave in a low octave.',
    'High filter resonance creates that signature squelch.',
    'A fast filter envelope decay makes the brightness sweep down quickly.',
  ],
  targetParams: {
    oscillator: {
      type: 'sawtooth',
      octave: -1,
      detune: 0,
      pulseWidth: 0.5
    },
    filter: {
      type: 'lowpass',
      cutoff: 400,
      resonance: 15,
      keyTracking: 0
    },

    filterEnvelope: {
      attack: 0.005,
      decay: 0.15,
      sustain: 0.1,
      release: 0.1,
      amount: 3,
    },
    amplitudeEnvelope: {
      attack: 0.005,
      decay: 0.2,
      sustain: 0.6,
      release: 0.1,
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
      mix: 0.5,
    },
    effects: {
      distortion: { amount: 0.2, mix: 0.3 },
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
