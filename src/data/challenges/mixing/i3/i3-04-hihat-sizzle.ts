/**
 * I3-04: Hi-Hat Sizzle
 * Controlling hi-hat brightness
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i3-04-hihat-sizzle',
  title: 'Hi-Hat Sizzle',
  description:
    'The hi-hats are too harsh and brittle. Tame the sizzle by cutting the highest frequencies while keeping them bright enough to cut through. Find the sweet spot between sizzle and smooth.',
  difficulty: 2,
  module: 'I3',
  tracks: [
    {
      id: 'hihat',
      name: 'Hi-Hat',
      sourceConfig: { type: 'hihat' },
      color: '#eab308', // yellow
    },
    {
      id: 'snare',
      name: 'Snare',
      sourceConfig: { type: 'snare' },
      color: '#f97316',
    },
  ],
  target: {
    type: 'multitrack-eq',
    tracks: {
      hihat: { low: -6, mid: 0, high: -3 },
      snare: { low: 0, mid: 2, high: 3 },
    },
  },
  controls: {
    eq: 'parametric',
    compressor: false,
    volume: true,
  },
  hints: [
    'Hi-hats live almost entirely in the highs - cut lows completely',
    'A slight high cut tames harshness without dulling them',
    'Let the snare have more presence in the high-mids',
  ],
};
