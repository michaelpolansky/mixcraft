/**
 * F2-04: Telephone Effect
 * Extreme EQ to simulate telephone/radio sound
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'f2-04-telephone-effect',
  title: 'Telephone Effect',
  description: 'Create a "telephone" or old radio effect by heavily cutting the lows and highs, leaving only the midrange. This mimics bandwidth-limited audio.',
  difficulty: 2,
  module: 'F2',
  sourceConfig: {
    type: 'pad',
    frequency: 330,
  },
  target: {
    type: 'eq',
    low: -10,
    mid: 4,
    high: -10,
  },
  controls: {
    eq: true,
    compressor: false,
  },
  hints: [
    'Telephones only transmit midrange frequencies',
    'Cut both extremes heavily and boost the mids slightly',
    'Try -10 dB on lows and highs, +4 dB on mids',
  ],
};
