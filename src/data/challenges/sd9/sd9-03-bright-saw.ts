import type { Challenge } from '../../../core/types.ts';
import {
  DEFAULT_EFFECTS,
  ADDITIVE_PRESETS,
  DEFAULT_ADDITIVE_LFO,
  DEFAULT_NOISE,
  DEFAULT_GLIDE,
  DEFAULT_ARPEGGIATOR,
  DEFAULT_ADDITIVE_MOD_MATRIX,
} from '../../../core/types.ts';

export const challenge: Challenge = {
  id: 'sd9-03-bright-saw',
  title: 'Bright Saw',
  description: 'Recreate a sawtooth wave by adding all harmonics with decreasing amplitude (1/n).',
  difficulty: 2,
  synthesisType: 'additive',
  module: 'SD9',
  testNote: 'A3',
  hints: [
    'A sawtooth wave contains all harmonics - both odd and even.',
    'Each harmonic is quieter than the previous: 1, 1/2, 1/3, 1/4...',
    'The amplitude of harmonic n is 1/n.',
  ],
  targetParams: {
    harmonics: [...ADDITIVE_PRESETS.saw],
    amplitudeEnvelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.7,
      release: 0.3,
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
