/**
 * F8-04: Polish and Glue
 * Final polish treatment for a cohesive sound
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'f8-04-polish-and-glue',
  title: 'Polish and Glue',
  description: 'Apply the finishing touches. Use subtle EQ for tonal balance and gentle compression to "glue" everything together into a polished whole.',
  difficulty: 3,
  module: 'F8',
  sourceConfig: {
    type: 'pad',
    frequency: 440,
  },
  target: {
    type: 'problem',
    description: 'Create a polished, cohesive sound',
    solution: {
      eq: {
        low: [-2, 4],     // Subtle low adjustment
        mid: [-3, 3],     // Subtle mid adjustment
        high: [-2, 4],    // Subtle high adjustment
      },
      compressor: {
        threshold: [-20, -8],
        amount: [15, 40],
      },
    },
  },
  controls: {
    eq: true,
    compressor: 'simple',
  },
  hints: [
    'Polish is about subtle, tasteful moves',
    '"Glue" compression is gentle - you feel it more than hear it',
    'The goal is cohesion, not obvious processing',
  ],
};
