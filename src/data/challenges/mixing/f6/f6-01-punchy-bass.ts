/**
 * F6-01: Punchy Bass
 * Combine EQ and compression for a tight, punchy bass
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'f6-01-punchy-bass',
  title: 'Punchy Bass',
  description: 'Create a tight, punchy bass sound. Cut some low mud with EQ, then add compression for consistent level and punch.',
  difficulty: 2,
  module: 'F6',
  sourceConfig: {
    type: 'bass',
    frequency: 55,
  },
  target: {
    type: 'problem',
    description: 'Create punchy bass with EQ and compression',
    solution: {
      eq: {
        low: [-4, 2],     // Slight cut or flat
        mid: [-6, 0],     // Cut mud
      },
      compressor: {
        threshold: [-30, -15],
        amount: [30, 60],
      },
    },
  },
  controls: {
    eq: true,
    compressor: 'simple',
  },
  hints: [
    'Cut some low-mids to reduce mud',
    'Add compression to even out the dynamics',
    'The combination creates a tight, controlled bass',
  ],
};
