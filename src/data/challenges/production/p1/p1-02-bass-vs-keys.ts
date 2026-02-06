/**
 * P1-02: Bass vs Keys
 * Choose which bass layer to feature
 */

import type { ProductionChallenge } from '../../../../core/types.ts';

export const challenge: ProductionChallenge = {
  id: 'p1-02-bass-vs-keys',
  title: 'Bass vs Keys',
  description: 'You have three layers competing for the low-mid range. Choose wisely - mute what doesn\'t serve the mix and balance what remains.',
  difficulty: 1,
  module: 'P1',
  layers: [
    {
      id: 'sub',
      name: 'Sub Bass',
      sourceConfig: { type: 'bass', frequency: 40 },
      initialVolume: -6,
    },
    {
      id: 'mid-bass',
      name: 'Mid Bass',
      sourceConfig: { type: 'bass', frequency: 80 },
      initialVolume: -6,
    },
    {
      id: 'keys',
      name: 'Keys',
      sourceConfig: { type: 'pad', frequency: 180 },
      initialVolume: -6,
    },
  ],
  target: {
    type: 'reference',
    layers: [
      { volume: -6, muted: false },
      { volume: -12, muted: true },
      { volume: -3, muted: false },
    ],
  },
  availableControls: {
    volume: true,
    mute: true,
    pan: false,
    eq: false,
  },
  hints: [
    'Two bass layers often fight - pick one',
    'The sub provides foundation, keys provide movement',
    'Sometimes less is more',
  ],
};
