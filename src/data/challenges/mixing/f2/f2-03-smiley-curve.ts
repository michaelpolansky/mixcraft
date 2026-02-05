/**
 * F2-03: Smiley Curve
 * Classic V-shaped EQ curve boosting lows and highs
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'f2-03-smiley-curve',
  title: 'Smiley Curve',
  description: 'Create the classic "smiley face" EQ curve - boost the lows and highs while cutting the mids. This creates an exciting, hi-fi sound.',
  difficulty: 2,
  module: 'F2',
  sourceConfig: {
    type: 'noise',
  },
  target: {
    type: 'eq',
    low: 6,
    mid: -4,
    high: 6,
  },
  controls: {
    eq: true,
    compressor: false,
  },
  hints: [
    'The "smiley" curve looks like a smile on a graphic EQ',
    'Boost lows and highs equally, cut the mids',
    'Try +6 dB on lows and highs, -4 dB on mids',
  ],
};
