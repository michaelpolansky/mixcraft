/**
 * I7-04: Dynamic Contrast
 * Use different compression amounts on different tracks
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i7-04-dynamic-contrast',
  title: 'Dynamic Contrast',
  description:
    'Not every track needs the same compression. Drums often need heavy compression for punch, while vocals and pads should stay more dynamic. Create contrast by compressing the drums harder than the vocal.',
  difficulty: 2,
  module: 'I7',
  tracks: [
    {
      id: 'drums',
      name: 'Drums',
      sourceConfig: { type: 'drum', frequency: 100 },
      initialVolume: -3,
      color: '#ef4444',
    },
    {
      id: 'vocal',
      name: 'Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      initialVolume: -4,
      color: '#a855f7',
    },
    {
      id: 'pad',
      name: 'Pad',
      sourceConfig: { type: 'pad', frequency: 440 },
      initialVolume: -6,
      color: '#22d3ee',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Compress drums harder than the vocal for dynamic contrast',
    conditions: [
      { type: 'track_compression', track: 'drums', minAmount: 40 },
      { type: 'compression_contrast', moreCompressed: 'drums', lessCompressed: 'vocal', minDifference: 20 },
    ],
  },
  controls: {
    eq: 'parametric',
    compressor: false,
    trackCompressor: true,
    volume: true,
  },
  hints: [
    'Drums benefit from heavy compression — it adds punch and consistency',
    'The vocal should be compressed more gently to preserve its natural dynamics',
    'Aim for at least 20% more compression on the drums than on the vocal',
  ],
};
