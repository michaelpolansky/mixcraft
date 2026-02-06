/**
 * I5-05: Front and Back
 * Create clear separation between front and back elements
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i5-05-front-and-back',
  title: 'Front and Back',
  description:
    'The vocal and kick need to be upfront and punchy. The pad and guitar can sit further back to create a sense of space. Create maximum front-to-back separation.',
  difficulty: 2,
  module: 'I5',
  tracks: [
    {
      id: 'vocal',
      name: 'Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      color: '#a855f7',
    },
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      color: '#ef4444',
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
    description: 'Create clear front-to-back separation',
    conditions: [
      { type: 'depth_placement', track: 'vocal', depth: 'front' },
      { type: 'depth_placement', track: 'kick', depth: 'front' },
      { type: 'depth_placement', track: 'pad', depth: 'back' },
      { type: 'reverb_contrast', dryTrack: 'vocal', wetTrack: 'pad', minDifference: 40 },
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
    'Vocal and kick are the anchors - keep them dry and upfront',
    'Push the pad way back with heavy reverb',
    'Guitar can go anywhere, but don\'t compete with the vocal',
  ],
};
