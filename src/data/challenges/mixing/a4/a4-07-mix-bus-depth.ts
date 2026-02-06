/**
 * A4-07: Mix Bus Depth
 * Create front-to-back depth in the mix
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a4-07-mix-bus-depth',
  title: 'Mix Bus Depth',
  description:
    'A professional mix has depth - some elements feel close, others feel distant. Use reverb strategically to create a three-dimensional soundstage.',
  difficulty: 3,
  module: 'A4',
  tracks: [
    {
      id: 'vocal',
      name: 'Lead Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      initialVolume: -2,
      color: '#a855f7',
    },
    {
      id: 'guitar',
      name: 'Guitar',
      sourceConfig: { type: 'guitar', frequency: 330 },
      initialVolume: -4,
      color: '#f97316',
    },
    {
      id: 'pad',
      name: 'Pad',
      sourceConfig: { type: 'pad', frequency: 220 },
      initialVolume: -6,
      color: '#22c55e',
    },
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      initialVolume: 0,
      color: '#ef4444',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Create depth with front and back placement',
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
    'Vocals and drums should be dry and upfront',
    'Pads can be pushed back with reverb',
    'Depth is created by reverb contrast',
  ],
};
