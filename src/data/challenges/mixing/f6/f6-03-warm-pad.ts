/**
 * F6-03: Warm Pad
 * Create a warm, sustained pad sound
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'f6-03-warm-pad',
  title: 'Warm Pad',
  description: 'Transform this pad into a warm, lush cushion. Add warmth with EQ and use gentle compression for a smooth, sustained character.',
  difficulty: 2,
  module: 'F6',
  sourceConfig: {
    type: 'pad',
    frequency: 220,
  },
  target: {
    type: 'problem',
    description: 'Warm, sustained pad with EQ and compression',
    solution: {
      eq: {
        low: [2, 8],      // Boost for warmth
        high: [-8, -2],   // Cut for smoothness
      },
      compressor: {
        threshold: [-20, -10],
        amount: [20, 45],
      },
    },
  },
  controls: {
    eq: true,
    compressor: 'simple',
  },
  hints: [
    'Boost lows and cut highs for warmth',
    'Gentle compression smooths out the dynamics',
    'The result should feel like a warm blanket of sound',
  ],
};
