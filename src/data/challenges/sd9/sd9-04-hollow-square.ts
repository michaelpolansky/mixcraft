import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_EFFECTS, ADDITIVE_PRESETS } from '../../../core/types.ts';

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
  },
};
