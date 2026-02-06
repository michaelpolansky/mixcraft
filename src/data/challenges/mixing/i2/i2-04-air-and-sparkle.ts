/**
 * I2-04: Air and Sparkle
 * Adding high-frequency sheen to vocals
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i2-04-air-and-sparkle',
  title: 'Air and Sparkle',
  description:
    'This vocal needs some "air" - that breathy, open quality in the high frequencies. Boost the highs on the vocal while being careful not to make it harsh. The goal is shimmer, not sizzle.',
  difficulty: 2,
  module: 'I2',
  tracks: [
    {
      id: 'vocal',
      name: 'Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      color: '#f59e0b',
    },
    {
      id: 'keys',
      name: 'Keys',
      sourceConfig: { type: 'keys', frequency: 523 },
      color: '#8b5cf6',
    },
  ],
  target: {
    type: 'multitrack-eq',
    tracks: {
      vocal: { low: -1, mid: 0, high: 4 },
      keys: { low: 0, mid: 0, high: -2 },
    },
  },
  controls: {
    eq: true,
    compressor: false,
    volume: true,
  },
  hints: [
    '"Air" frequencies are above 8kHz - boost the high band',
    'A 3-5dB boost adds sparkle without harshness',
    'Cut the keys highs to prevent competition with the vocal air',
  ],
};
