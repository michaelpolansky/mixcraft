/**
 * F1-02: High Cut
 * Introduction to cutting high frequencies
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'f1-02-high-cut',
  title: 'High Cut',
  description: 'This noise has too much brightness. Cut the high frequencies to tame the harshness and create a darker tone.',
  difficulty: 1,
  module: 'F1',
  sourceConfig: {
    type: 'noise',
  },
  target: {
    type: 'eq',
    low: 0,
    mid: 0,
    high: -8,
  },
  controls: {
    eq: true,
    compressor: false,
  },
  hints: [
    'The high knob controls frequencies above 2.5kHz',
    'Cutting (negative values) removes frequencies',
    'Try cutting about 8 dB from the highs',
  ],
};
