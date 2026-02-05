/**
 * F7-01: Fix the Boom
 * Diagnose and fix boomy low end
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'f7-01-fix-the-boom',
  title: 'Fix the Boom',
  description: 'This bass is boomy and overwhelming. Diagnose the problem and use your tools to create a tighter, more controlled low end.',
  difficulty: 2,
  module: 'F7',
  sourceConfig: {
    type: 'bass',
    frequency: 45,
  },
  target: {
    type: 'problem',
    description: 'Bass is too boomy - needs tightening',
    solution: {
      eq: {
        low: [-10, -3],   // Cut the boom
      },
      compressor: {
        threshold: [-35, -15],
        amount: [30, 70],
      },
    },
  },
  controls: {
    eq: true,
    compressor: 'simple',
  },
  hints: [
    'Boomy bass has too much sub-low energy',
    'Cut the low band to reduce the boom',
    'Compression can also help control the peaks',
  ],
};
