/**
 * F1-04: Presence Boost
 * Introduction to boosting high frequencies for clarity
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'f1-04-presence-boost',
  title: 'Presence Boost',
  description: 'This pad sounds dull. Add some sparkle and presence by boosting the high frequencies to make it cut through.',
  difficulty: 1,
  module: 'F1',
  sourceConfig: {
    type: 'pad',
    frequency: 220,
  },
  target: {
    type: 'eq',
    low: 0,
    mid: 0,
    high: 8,
  },
  controls: {
    eq: true,
    compressor: false,
  },
  hints: [
    'High frequency boosts add "air" and "presence"',
    'This is often called adding "sparkle" to a sound',
    'Boost the highs by about 8 dB',
  ],
};
