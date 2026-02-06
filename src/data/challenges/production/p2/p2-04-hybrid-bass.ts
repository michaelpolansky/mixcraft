/**
 * P2-04: Hybrid Bass
 * Create a complex bass from multiple layers
 */

import type { ProductionChallenge } from '../../../../core/types.ts';

export const challenge: ProductionChallenge = {
  id: 'p2-04-hybrid-bass',
  title: 'Hybrid Bass',
  description: 'Build a powerful bass sound from three layers: a sub for low end, a mid growl for presence, and a top layer for definition.',
  difficulty: 3,
  module: 'P2',
  layers: [
    {
      id: 'sub',
      name: 'Sub',
      sourceConfig: { type: 'bass', frequency: 40 },
      initialVolume: -6,
    },
    {
      id: 'growl',
      name: 'Growl',
      sourceConfig: { type: 'bass', frequency: 100 },
      initialVolume: -6,
    },
    {
      id: 'top',
      name: 'Top',
      sourceConfig: { type: 'tone', frequency: 800 },
      initialVolume: -6,
    },
  ],
  target: {
    type: 'reference',
    layers: [
      { volume: -6, muted: false },
      { volume: -3, muted: false },
      { volume: -15, muted: false },
    ],
  },
  availableControls: {
    volume: true,
    mute: true,
    pan: false,
    eq: false,
  },
  hints: [
    'The growl carries the main bass character',
    'The sub adds low-end weight beneath it',
    'Top adds bite but should be subtle',
  ],
};
