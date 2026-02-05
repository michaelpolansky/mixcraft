/**
 * F8-02: Make It Sit
 * Get the sound to sit well in a mix context
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'f8-02-make-it-sit',
  title: 'Make It Sit',
  description: 'This pad is fighting for space. Use EQ and compression to make it sit back in the mix - present but not dominating.',
  difficulty: 3,
  module: 'F8',
  sourceConfig: {
    type: 'pad',
    frequency: 330,
  },
  target: {
    type: 'problem',
    description: 'Create a sound that sits well in a mix',
    solution: {
      eq: {
        low: [-6, 0],     // Reduce to make room
        mid: [-4, 2],     // Controlled mids
        high: [-4, 2],    // Tamed highs
      },
      compressor: {
        threshold: [-24, -12],
        amount: [25, 50],
      },
    },
  },
  controls: {
    eq: true,
    compressor: 'simple',
  },
  hints: [
    'Sounds that "sit well" don\'t fight for attention',
    'Cutting frequencies makes room for other elements',
    'Compression creates a more consistent presence',
  ],
};
