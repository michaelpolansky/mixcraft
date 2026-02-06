import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_EFFECTS, ADDITIVE_PRESETS } from '../../../core/types.ts';

export const challenge: Challenge = {
  id: 'sd9-05-soft-triangle',
  title: 'Soft Triangle',
  description: 'Build a soft triangle wave. Odd harmonics only, but they fall off much faster than square.',
  difficulty: 2,
  synthesisType: 'additive',
  module: 'SD9',
  testNote: 'C4',
  hints: [
    'Like square wave, triangle only uses odd harmonics (1, 3, 5, 7...).',
    'But triangle harmonics fall off as 1/n squared, not just 1/n.',
    'This faster falloff makes triangle waves much softer than square waves.',
  ],
  targetParams: {
    harmonics: [...ADDITIVE_PRESETS.triangle],
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
