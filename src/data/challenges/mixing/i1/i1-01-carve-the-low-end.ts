/**
 * I1-01: Carve the Low End
 * Introduction to kick and bass frequency separation
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i1-01-carve-the-low-end',
  title: 'Carve the Low End',
  description:
    'The kick and bass are fighting for the same frequencies. Use EQ to give each its own space in the low end. The kick needs punch around 60-80Hz, while the bass needs body around 100-200Hz.',
  difficulty: 2,
  module: 'I1',
  tracks: [
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      color: '#ef4444', // red
    },
    {
      id: 'bass',
      name: 'Bass',
      sourceConfig: { type: 'bass', frequency: 55 },
      color: '#3b82f6', // blue
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Separate kick and bass frequencies so both are clear',
    conditions: [
      { type: 'frequency_separation', track1: 'kick', track2: 'bass', band: 'low' },
      { type: 'eq_cut', track: 'bass', band: 'low', minCut: 2 },
    ],
  },
  controls: {
    eq: 'parametric',
    compressor: false,
    volume: true,
  },
  hints: [
    'The kick lives around 60-80Hz - that\'s the punch you feel',
    'Cut the bass at its lowest frequencies to make room for the kick',
    'Try cutting the bass low band by 3-6 dB',
  ],
};
