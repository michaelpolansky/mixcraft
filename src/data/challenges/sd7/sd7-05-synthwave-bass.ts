import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_LFO2, DEFAULT_MOD_MATRIX } from '../../../core/types.ts';

/**
 * SD7-05: Synthwave Bass
 * The punchy, dark 80s retro bass
 *
 * This bass sound defined the synthwave/retrowave genre -
 * punchy, dark, with a characteristic hollow quality.
 */
export const challenge: Challenge = {
  id: 'sd7-05-synthwave-bass',
  title: 'Synthwave Bass',
  description: 'Create the punchy, dark bass that powers synthwave and retrowave. It should have that hollow, driving quality that sits perfectly under arpeggios.',
  difficulty: 2,
  module: 'SD7',
  testNote: 'C2',
  hints: [
    'Square waves have that hollow quality perfect for synthwave bass.',
    'A punchy envelope with quick decay gives it drive.',
    'Keep the filter dark but not too closed - you want some edge.',
  ],
  targetParams: {
    oscillator: {
      type: 'square',
      octave: -1,
      detune: 0,
      pulseWidth: 0.5,
      level: 1,
    },
    filter: {
      type: 'lowpass',
      cutoff: 800,
      resonance: 5,
      keyTracking: 0
    },

    filterEnvelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.5,
      release: 0.2,
      amount: 1.5,
    },
    amplitudeEnvelope: {
      attack: 0.01,
      decay: 0.15,
      sustain: 0.7,
      release: 0.2,
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
      level: 0.5,
    },
    effects: {
      distortion: { amount: 0.15, mix: 0.2 },
      delay: { time: 0.25, feedback: 0.2, mix: 0 },
      reverb: { decay: 1.0, mix: 0.1 },
      chorus: { rate: 1.5, depth: 0.5, mix: 0 },
    },
    volume: -12,
    lfo2: DEFAULT_LFO2,
    modMatrix: DEFAULT_MOD_MATRIX,
    pan: 0,
  },
};
