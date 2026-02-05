/**
 * F7-03: Unbury the Attack
 * Restore attack that's been lost
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'f7-03-unbury-the-attack',
  title: 'Unbury the Attack',
  description: 'This drum sounds mushy and has no punch. The attack is buried. Use your tools to bring back the snap and definition.',
  difficulty: 3,
  module: 'F7',
  sourceConfig: {
    type: 'drum',
  },
  target: {
    type: 'problem',
    description: 'Drum lacks attack and punch',
    solution: {
      eq: {
        mid: [-6, 0],     // Cut mud
        high: [2, 8],     // Boost for attack
      },
      compressor: {
        threshold: [-25, -10],
        amount: [20, 50],
      },
    },
  },
  controls: {
    eq: true,
    compressor: 'simple',
  },
  hints: [
    'Attack lives in the upper frequencies',
    'Cutting mids can reduce mushiness',
    'Boosting highs brings out the snap',
  ],
};
