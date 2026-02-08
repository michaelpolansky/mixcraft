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
  id: 'sd9-04-hollow-square',
  title: 'Hollow Square',
  description: 'Create the hollow sound of a square wave using only odd harmonics.',
  difficulty: 2,
  synthesisType: 'additive',
  module: 'SD9',
  testNote: 'C4',
  hints: [
    'A square wave only has odd harmonics - 1, 3, 5, 7, 9...',
    'No even harmonics! That\'s what gives it the "hollow" quality.',
    'The amplitude of odd harmonic n is 1/n. Even harmonics are zero.',
  ],
  targetParams: {
    harmonics: [...ADDITIVE_PRESETS.square],
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
