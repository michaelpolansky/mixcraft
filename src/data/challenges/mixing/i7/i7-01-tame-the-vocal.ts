/**
 * I7-01: Tame the Vocal
 * Introduction to per-track compression — compress the vocal for consistency
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i7-01-tame-the-vocal',
  title: 'Tame the Vocal',
  description:
    'Vocals often have wide dynamic range — some words loud, others quiet. Use per-track compression to even out the vocal so it sits consistently in the mix.',
  difficulty: 1,
  module: 'I7',
  tracks: [
    {
      id: 'vocal',
      name: 'Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      initialVolume: -3,
      color: '#a855f7',
    },
    {
      id: 'guitar',
      name: 'Guitar',
      sourceConfig: { type: 'guitar', frequency: 330 },
      initialVolume: -4,
      color: '#f97316',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Compress the vocal for a more consistent level',
    conditions: [
      { type: 'track_compression', track: 'vocal', minAmount: 20, maxAmount: 60 },
    ],
  },
  controls: {
    eq: 'parametric',
    compressor: false,
    trackCompressor: true,
    volume: true,
  },
  hints: [
    'The vocal jumps around in level — compression will tame it',
    'Set the threshold until you see 3-6 dB of gain reduction on loud phrases',
    'Start with 30-40% amount. Too much compression sounds flat and lifeless.',
  ],
};
