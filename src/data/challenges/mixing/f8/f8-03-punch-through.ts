/**
 * F8-03: Punch Through
 * Make an element cut through and be heard
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'f8-03-punch-through',
  title: 'Punch Through',
  description: 'This drum needs to punch through and be the focal point. Use aggressive processing to make it impossible to ignore.',
  difficulty: 3,
  module: 'F8',
  sourceConfig: {
    type: 'drum',
  },
  target: {
    type: 'problem',
    description: 'Make the drum punch through prominently',
    solution: {
      eq: {
        low: [0, 6],      // Keep or boost low punch
        mid: [-4, 2],     // Control boxiness
        high: [4, 10],    // Boost attack/presence
      },
      compressor: {
        threshold: [-28, -15],
        amount: [40, 70],
      },
    },
  },
  controls: {
    eq: true,
    compressor: 'simple',
  },
  hints: [
    'Punching through requires presence in the high frequencies',
    'The low end provides the weight and impact',
    'Compression adds consistency and power',
  ],
};
