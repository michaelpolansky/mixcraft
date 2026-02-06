/**
 * I6-05: Headroom
 * Leave headroom for the mix to breathe
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i6-05-headroom',
  title: 'Headroom',
  description:
    'Good mixes have headroom - they are not too loud. Set levels so each element has room to breathe, without pushing into clipping territory.',
  difficulty: 2,
  module: 'I6',
  tracks: [
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      initialVolume: 3,
      color: '#ef4444',
    },
    {
      id: 'bass',
      name: 'Bass',
      sourceConfig: { type: 'bass', frequency: 55 },
      initialVolume: 3,
      color: '#3b82f6',
    },
    {
      id: 'vocal',
      name: 'Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      initialVolume: 6,
      color: '#a855f7',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Set levels with proper headroom',
    conditions: [
      { type: 'volume_range', track: 'kick', minDb: -12, maxDb: 0 },
      { type: 'volume_range', track: 'bass', minDb: -12, maxDb: 0 },
      { type: 'volume_range', track: 'vocal', minDb: -9, maxDb: 3 },
      { type: 'volume_louder', track1: 'vocal', track2: 'kick' },
    ],
  },
  controls: {
    eq: false,
    compressor: false,
    volume: true,
    pan: false,
    reverb: false,
  },
  hints: [
    'All these tracks are too loud - they are pushing into clipping',
    'Pull everything down to leave headroom',
    'Keep the relative balance while reducing overall level',
  ],
};
