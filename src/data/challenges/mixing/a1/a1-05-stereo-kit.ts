/**
 * A1-05: Stereo Kit
 * Create a realistic stereo drum image
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a1-05-stereo-kit',
  title: 'Stereo Kit',
  description:
    'Pan the drum kit for a realistic stereo image. Kick and snare stay centered for power, hi-hat goes to one side. This creates width while maintaining the punch.',
  difficulty: 2,
  module: 'A1',
  tracks: [
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      color: '#ef4444',
    },
    {
      id: 'snare',
      name: 'Snare',
      sourceConfig: { type: 'snare' },
      color: '#f97316',
    },
    {
      id: 'hihat',
      name: 'Hi-Hat',
      sourceConfig: { type: 'hihat' },
      color: '#eab308',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Create a realistic stereo drum image',
    conditions: [
      { type: 'pan_position', track: 'kick', position: 'center' },
      { type: 'pan_position', track: 'snare', position: 'center' },
      { type: 'pan_position', track: 'hihat', position: 'left' },
    ],
  },
  controls: {
    eq: false,
    compressor: false,
    volume: true,
    pan: true,
    reverb: false,
  },
  hints: [
    'Kick is always center - it\'s the foundation',
    'Snare stays center for maximum impact',
    'Hi-hat goes left (drummer\'s perspective) for realism',
  ],
};
