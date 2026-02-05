/**
 * F6-02: Bright Drums
 * EQ for brightness + compression for punch
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'f6-02-bright-drums',
  title: 'Bright Drums',
  description: 'Make these drums cut through with added brightness and controlled dynamics. Boost highs for presence, compress for punch.',
  difficulty: 2,
  module: 'F6',
  sourceConfig: {
    type: 'drum',
  },
  target: {
    type: 'problem',
    description: 'Bright, punchy drums with EQ and compression',
    solution: {
      eq: {
        high: [3, 10],    // Boost highs
      },
      compressor: {
        threshold: [-25, -12],
        amount: [25, 55],
      },
    },
  },
  controls: {
    eq: true,
    compressor: 'simple',
  },
  hints: [
    'Boost the highs for attack and presence',
    'Compression adds punch and consistency',
    'Watch the gain reduction meter for visual feedback',
  ],
};
