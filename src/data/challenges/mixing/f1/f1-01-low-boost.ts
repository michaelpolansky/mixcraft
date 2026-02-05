/**
 * F1-01: Low Boost
 * Introduction to boosting bass frequencies
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'f1-01-low-boost',
  title: 'Low Boost',
  description: 'Add some weight to this thin tone by boosting the low frequencies. Listen for the added warmth and body.',
  difficulty: 1,
  module: 'F1',
  sourceConfig: {
    type: 'tone',
    frequency: 200,
  },
  target: {
    type: 'eq',
    low: 6,
    mid: 0,
    high: 0,
  },
  controls: {
    eq: true,
    compressor: false,
  },
  hints: [
    'The low knob controls bass frequencies below 400Hz',
    'Try boosting the low band by about 6 dB',
    'Listen for the added warmth and fullness',
  ],
};
