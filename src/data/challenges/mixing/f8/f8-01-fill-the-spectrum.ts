/**
 * F8-01: Fill the Spectrum
 * Create a full, balanced frequency spectrum
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'f8-01-fill-the-spectrum',
  title: 'Fill the Spectrum',
  description: 'This sound is thin and lacks body. Use EQ to create a full, balanced frequency spectrum that fills the sonic space.',
  difficulty: 3,
  module: 'F8',
  sourceConfig: {
    type: 'tone',
    frequency: 220,
  },
  target: {
    type: 'problem',
    description: 'Create a full, balanced frequency spectrum',
    solution: {
      eq: {
        low: [4, 10],     // Add body
        mid: [-2, 4],     // Balance mids
        high: [2, 8],     // Add presence
      },
    },
  },
  controls: {
    eq: true,
    compressor: false,
  },
  hints: [
    'A full sound has energy across the spectrum',
    'Boost lows for body, highs for presence',
    'The mids can be left flat or slightly adjusted',
  ],
};
