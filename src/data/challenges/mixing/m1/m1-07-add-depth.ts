/**
 * M1-07: Add Depth
 * Create front-to-back dimension
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'm1-07-add-depth',
  title: 'Add Depth',
  description:
    'Width is left-right, depth is front-back. Use reverb to push elements back, keeping lead elements dry and upfront for a three-dimensional mix.',
  difficulty: 3,
  module: 'M1',
  tracks: [
    {
      id: 'vocal',
      name: 'Lead Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      initialVolume: -2,
      color: '#a855f7',
    },
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      initialVolume: 0,
      color: '#ef4444',
    },
    {
      id: 'guitar',
      name: 'Guitar',
      sourceConfig: { type: 'guitar', frequency: 330 },
      initialVolume: -4,
      color: '#22c55e',
    },
    {
      id: 'pad',
      name: 'Pad',
      sourceConfig: { type: 'pad', frequency: 220 },
      initialVolume: -8,
      color: '#3b82f6',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Create depth with reverb placement',
    conditions: [
      { type: 'depth_placement', track: 'vocal', depth: 'front' },
      { type: 'depth_placement', track: 'kick', depth: 'front' },
      { type: 'depth_placement', track: 'pad', depth: 'back' },
      { type: 'reverb_contrast', dryTrack: 'vocal', wetTrack: 'pad', minDifference: 25 },
      { type: 'volume_louder', track1: 'vocal', track2: 'pad' },
    ],
  },
  controls: {
    eq: true,
    compressor: false,
    volume: true,
    pan: true,
    reverb: true,
  },
  hints: [
    'Keep vocal and kick dry',
    'Push the pad back with reverb',
    'Contrast creates depth',
  ],
};
