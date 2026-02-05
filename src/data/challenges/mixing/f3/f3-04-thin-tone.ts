/**
 * F3-04: Thin Tone
 * Fix a sound lacking body and warmth
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'f3-04-thin-tone',
  title: 'Thin Tone',
  description: 'This tone sounds thin and weak. Give it some body and weight without making it boomy or muddy.',
  difficulty: 2,
  module: 'F3',
  sourceConfig: {
    type: 'tone',
    frequency: 440,
  },
  target: {
    type: 'problem',
    description: 'Sound is thin and lacks body in the low frequencies',
    solution: {
      eq: {
        low: [4, 10],    // Boost for body
        high: [-6, 0],   // Optionally reduce highs
      },
    },
  },
  controls: {
    eq: true,
    compressor: false,
  },
  hints: [
    'Thin sounds need more low frequency content',
    'Boost the lows to add body and warmth',
    'Be careful not to add too much - it can get boomy',
  ],
};
