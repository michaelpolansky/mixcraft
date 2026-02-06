/**
 * M3-04: Match the Depth
 * Match the front-to-back depth of a reference
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'm3-04-match-the-depth',
  title: 'Match the Depth',
  description:
    'Professional mixes have dimension. Match the depth - vocals and drums upfront, pads and ambience in the back, clear separation.',
  difficulty: 2,
  module: 'M3',
  tracks: [
    {
      id: 'vocal',
      name: 'Vocal',
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
    description: 'Match the professional depth',
    conditions: [
      { type: 'depth_placement', track: 'vocal', depth: 'front' },
      { type: 'depth_placement', track: 'kick', depth: 'front' },
      { type: 'depth_placement', track: 'pad', depth: 'back' },
      { type: 'reverb_contrast', dryTrack: 'vocal', wetTrack: 'pad', minDifference: 25 },
      { type: 'volume_louder', track1: 'vocal', track2: 'pad' },
    ],
  },
  controls: {
    eq: false,
    compressor: false,
    volume: true,
    pan: true,
    reverb: true,
  },
  hints: [
    'Keep vocal and kick dry',
    'Push the pad back with reverb',
    'Create clear front-to-back layers',
  ],
};
