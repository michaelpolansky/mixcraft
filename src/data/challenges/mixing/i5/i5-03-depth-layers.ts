/**
 * I5-03: Depth Layers
 * Create multiple layers of depth
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i5-03-depth-layers',
  title: 'Depth Layers',
  description:
    'A professional mix has depth - some elements close, some in the middle, some far away. Create three distinct depth layers using different reverb amounts.',
  difficulty: 2,
  module: 'I5',
  tracks: [
    {
      id: 'vocal',
      name: 'Lead Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      color: '#a855f7',
    },
    {
      id: 'guitar',
      name: 'Guitar',
      sourceConfig: { type: 'guitar', frequency: 330 },
      color: '#f97316',
    },
    {
      id: 'pad',
      name: 'Pad',
      sourceConfig: { type: 'pad', frequency: 220 },
      color: '#22c55e',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Create three distinct depth layers',
    conditions: [
      { type: 'depth_placement', track: 'vocal', depth: 'front' },
      { type: 'depth_placement', track: 'guitar', depth: 'middle' },
      { type: 'depth_placement', track: 'pad', depth: 'back' },
    ],
  },
  controls: {
    eq: false,
    compressor: false,
    volume: true,
    pan: false,
    reverb: true,
  },
  hints: [
    'Vocal should be driest - right in front of you',
    'Guitar sits in the middle with moderate reverb',
    'Pad is atmospheric and pushed back with lots of reverb',
  ],
};
