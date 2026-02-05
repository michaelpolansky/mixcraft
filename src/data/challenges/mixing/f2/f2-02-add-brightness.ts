/**
 * F2-02: Add Brightness
 * Combining high boost with low cut for clarity
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'f2-02-add-brightness',
  title: 'Add Brightness',
  description: 'Make this dull bass cut through by reducing the low end mud and adding high frequency clarity.',
  difficulty: 2,
  module: 'F2',
  sourceConfig: {
    type: 'bass',
    frequency: 60,
  },
  target: {
    type: 'eq',
    low: -3,
    mid: 0,
    high: 6,
  },
  controls: {
    eq: true,
    compressor: false,
  },
  hints: [
    'Sometimes "less is more" with bass frequencies',
    'Cutting lows and boosting highs adds definition',
    'Try -3 dB low and +6 dB high',
  ],
};
