/**
 * I2-02: Warm Vocals
 * Adding body without muddiness
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i2-02-warm-vocals',
  title: 'Warm Vocals',
  description:
    'This vocal sounds thin and cold. Add warmth by boosting the low-mids, but be careful not to make it muddy. The sweet spot is around 200-400Hz. Too much and it becomes boomy.',
  difficulty: 2,
  module: 'I2',
  tracks: [
    {
      id: 'vocal',
      name: 'Vocal',
      sourceConfig: { type: 'vocal', frequency: 200 },
      color: '#f59e0b',
    },
    {
      id: 'guitar',
      name: 'Guitar',
      sourceConfig: { type: 'guitar', frequency: 330 },
      color: '#10b981', // emerald
    },
  ],
  target: {
    type: 'multitrack-eq',
    tracks: {
      vocal: { low: 3, mid: 0, high: 0 },
      guitar: { low: -2, mid: 0, high: 2 },
    },
  },
  controls: {
    eq: true,
    compressor: false,
    volume: true,
  },
  hints: [
    'Vocal warmth comes from the low band (200-400Hz)',
    'A small boost of 2-4dB adds body without mud',
    'Cut the guitar lows slightly to prevent frequency buildup',
  ],
};
