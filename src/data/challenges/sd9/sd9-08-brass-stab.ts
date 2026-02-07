import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_EFFECTS } from '../../../core/types.ts';

export const challenge: Challenge = {
  id: 'sd9-08-brass-stab',
  title: 'Brass Stab',
  description: 'Build a punchy brass stab sound. Brass instruments have strong lower harmonics that create their powerful tone.',
  difficulty: 2,
  synthesisType: 'additive',
  module: 'SD9',
  testNote: 'C4',
  hints: [
    'Brass instruments have a rich harmonic spectrum with strong lower partials.',
    'Include both odd and even harmonics for the characteristic brass brightness.',
    'Use a fast attack to get that stab quality.',
  ],
  targetParams: {
    // Strong lower harmonics tapering off - brass character
    harmonics: [1, 0.9, 0.7, 0.5, 0.35, 0.25, 0.18, 0.12, 0.08, 0.05, 0.03, 0.02, 0, 0, 0, 0],
    amplitudeEnvelope: {
      attack: 0.01,
      decay: 0.15,
      sustain: 0.6,
      release: 0.25,
    },
    effects: DEFAULT_EFFECTS,
    volume: -12,
  },
};
