/**
 * I4-04: Drum Kit Imaging
 * Pan drums like a real kit from drummer's perspective
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i4-04-drum-kit-imaging',
  title: 'Drum Kit Imaging',
  description:
    'Create a realistic drum image by panning elements as they would be in a real kit. Hi-hat typically goes to one side, while kick and snare stay centered. This creates a natural, three-dimensional drum sound.',
  difficulty: 2,
  module: 'I4',
  tracks: [
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      initialPan: 0,
      color: '#ef4444',
    },
    {
      id: 'snare',
      name: 'Snare',
      sourceConfig: { type: 'snare' },
      initialPan: 0,
      color: '#f97316',
    },
    {
      id: 'hihat',
      name: 'Hi-Hat',
      sourceConfig: { type: 'hihat' },
      initialPan: 0, // Needs to be panned
      color: '#eab308',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Create a natural drum image with proper stereo placement',
    conditions: [
      { type: 'pan_position', track: 'kick', position: 'center' },
      { type: 'pan_position', track: 'snare', position: 'center' },
      { type: 'pan_position', track: 'hihat', position: 'left' }, // Drummer's perspective
    ],
  },
  controls: {
    eq: false,
    compressor: false,
    volume: true,
    pan: true,
  },
  hints: [
    'The kick is always centered - it\'s the foundation',
    'Snare typically stays centered or just slightly off',
    'Hi-hat goes to the left from the drummer\'s perspective',
  ],
};
