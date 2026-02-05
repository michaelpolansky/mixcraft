/**
 * F4-01: Gentle Squeeze
 * Introduction to light compression
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'f4-01-gentle-squeeze',
  title: 'Gentle Squeeze',
  description: 'Apply gentle compression to this drum loop. Set a moderate threshold and light compression amount to even out the dynamics without squashing the sound.',
  difficulty: 1,
  module: 'F4',
  sourceConfig: {
    type: 'drum',
  },
  target: {
    type: 'compressor',
    threshold: -18,
    amount: 30,
  },
  controls: {
    eq: false,
    compressor: 'simple',
  },
  hints: [
    'Threshold controls when compression starts (lower = more signal compressed)',
    'Amount controls how much compression is applied',
    'Try threshold around -18 dB and amount around 30%',
  ],
};
