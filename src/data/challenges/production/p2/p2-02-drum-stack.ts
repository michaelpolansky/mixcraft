/**
 * P2-02: Drum Stack
 * Layer kick drums for punch and weight
 */

import type { ProductionChallenge } from '../../../../core/types.ts';

export const challenge: ProductionChallenge = {
  id: 'p2-02-drum-stack',
  title: 'Drum Stack',
  description: 'Create a powerful kick by layering an acoustic kick, a sub layer, and a click. Each adds a different character.',
  difficulty: 2,
  module: 'P2',
  layers: [
    {
      id: 'acoustic',
      name: 'Acoustic',
      sourceConfig: { type: 'drum' },
      initialVolume: -6,
    },
    {
      id: 'sub',
      name: 'Sub',
      sourceConfig: { type: 'bass', frequency: 45 },
      initialVolume: -6,
    },
    {
      id: 'click',
      name: 'Click',
      sourceConfig: { type: 'tone', frequency: 3000 },
      initialVolume: -6,
    },
  ],
  target: {
    type: 'reference',
    layers: [
      { volume: -3, muted: false },
      { volume: -9, muted: false },
      { volume: -18, muted: false },
    ],
  },
  availableControls: {
    volume: true,
    mute: true,
    pan: false,
    eq: false,
  },
  hints: [
    'The acoustic kick is the main body',
    'The sub adds low-end weight without being too loud',
    'The click adds definition but stays subtle',
  ],
};
