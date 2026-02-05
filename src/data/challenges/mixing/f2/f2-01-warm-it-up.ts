/**
 * F2-01: Warm It Up
 * Combining low boost with high cut for warmth
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'f2-01-warm-it-up',
  title: 'Warm It Up',
  description: 'Create a warm, cozy tone by boosting the lows and gently cutting the highs. Think vintage, analog warmth.',
  difficulty: 2,
  module: 'F2',
  sourceConfig: {
    type: 'tone',
    frequency: 440,
  },
  target: {
    type: 'eq',
    low: 4,
    mid: 0,
    high: -4,
  },
  controls: {
    eq: true,
    compressor: false,
  },
  hints: [
    'Warmth comes from emphasizing bass and reducing brightness',
    'Boost the lows and cut the highs by similar amounts',
    'Try +4 dB low and -4 dB high',
  ],
};
