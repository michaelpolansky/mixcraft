import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_EFFECTS } from '../../../core/types.ts';

export const challenge: Challenge = {
  id: 'sd9-12-shimmer',
  title: 'Shimmer',
  description: 'Create a shimmering, bright tone. Emphasize the upper harmonics while keeping a foundation.',
  difficulty: 3,
  synthesisType: 'additive',
  module: 'SD9',
  testNote: 'C4',
  hints: [
    'Shimmer comes from having strong upper harmonics creating brightness.',
    'Keep a moderate fundamental for pitch definition.',
    'Harmonics 8-16 should be more prominent than usual.',
  ],
  targetParams: {
    // Shimmering with emphasized upper harmonics
    harmonics: [0.5, 0.3, 0.25, 0.3, 0.35, 0.4, 0.5, 0.6, 0.7, 0.65, 0.6, 0.5, 0.4, 0.3, 0.2, 0.15],
    amplitudeEnvelope: {
      attack: 0.2,
      decay: 0.4,
      sustain: 0.5,
      release: 1.0,
    },
    effects: DEFAULT_EFFECTS,
    volume: -12,
  },
};
