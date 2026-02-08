import type { Challenge } from '../../../core/types.ts';
import {
  DEFAULT_EFFECTS,
  DEFAULT_ADDITIVE_LFO,
  DEFAULT_NOISE,
  DEFAULT_GLIDE,
  DEFAULT_ARPEGGIATOR,
  DEFAULT_ADDITIVE_MOD_MATRIX,
} from '../../../core/types.ts';

export const challenge: Challenge = {
  id: 'sd9-10-choir-pad',
  title: 'Choir Pad',
  description: 'Build a choir-like pad sound. Vocals have formants - specific harmonic peaks that give them character.',
  difficulty: 3,
  synthesisType: 'additive',
  module: 'SD9',
  testNote: 'C4',
  hints: [
    'Choir sounds have formant peaks - groups of harmonics that are emphasized.',
    'Try emphasizing harmonics 2-4 and 6-8 for an "ah" vowel sound.',
    'Use a slow attack for a smooth, pad-like quality.',
  ],
  targetParams: {
    // Formant-like structure with peaks at certain harmonics
    harmonics: [0.8, 1, 0.9, 0.7, 0.3, 0.5, 0.6, 0.4, 0.2, 0.15, 0.1, 0.08, 0.05, 0.03, 0.02, 0.01],
    amplitudeEnvelope: {
      attack: 0.5,
      decay: 0.3,
      sustain: 0.7,
      release: 0.8,
    },
    effects: DEFAULT_EFFECTS,
    volume: -12,
    lfo: DEFAULT_ADDITIVE_LFO,
    noise: DEFAULT_NOISE,
    glide: DEFAULT_GLIDE,
    velocity: { ampAmount: 0, brightnessAmount: 0 },
    arpeggiator: DEFAULT_ARPEGGIATOR,
    modMatrix: DEFAULT_ADDITIVE_MOD_MATRIX,
    pan: 0,
  },
};
