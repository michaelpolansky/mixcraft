import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_EFFECTS, ADDITIVE_PRESETS } from '../../../core/types.ts';

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
  },
};
