/**
 * A1-03: Tame the Hat
 * Control hi-hat harshness while keeping brightness
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a1-03-tame-the-hat',
  title: 'Tame the Hat',
  description:
    'Hi-hats can be harsh and fatiguing. Cut the low end they don\'t need, tame the harsh highs, and find the sweet spot where they sizzle without hurting.',
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
    description: 'Control hi-hat harshness',
    conditions: [
      { type: 'eq_cut', track: 'hihat', band: 'low', minCut: 6 },
      { type: 'eq_cut', track: 'hihat', band: 'high', minCut: 2 },
      { type: 'volume_louder', track1: 'snare', track2: 'hihat' },
    ],
  },
  controls: {
    eq: true,
    compressor: false,
    volume: true,
    pan: false,
    reverb: false,
  },
  hints: [
    'Hi-hats have no useful low frequency content - cut it all',
    'A slight high cut tames harshness without dulling',
    'The hi-hat should never be louder than the snare',
  ],
};
