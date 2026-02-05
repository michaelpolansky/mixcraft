/**
 * F6-04: Radio Ready
 * Create a polished, broadcast-ready sound
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'f6-04-radio-ready',
  title: 'Radio Ready',
  description: 'Polish this sound for broadcast. Use the classic smiley EQ curve for excitement, and heavy compression for that loud, in-your-face radio sound.',
  difficulty: 3,
  module: 'F6',
  sourceConfig: {
    type: 'noise',
  },
  target: {
    type: 'problem',
    description: 'Polished, loud broadcast sound',
    solution: {
      eq: {
        low: [3, 8],      // Boost bass
        mid: [-6, -2],    // Scoop mids
        high: [3, 8],     // Boost treble
      },
      compressor: {
        threshold: [-30, -18],
        amount: [50, 80],
      },
    },
  },
  controls: {
    eq: true,
    compressor: 'simple',
  },
  hints: [
    'The "smiley curve" boosts lows and highs, cuts mids',
    'Heavy compression makes everything loud and consistent',
    'This aggressive style is common in broadcast audio',
  ],
};
