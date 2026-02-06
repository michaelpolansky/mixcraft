/**
 * P2-01: Attack + Body
 * Blend attack and sustain layers
 */

import type { ProductionChallenge } from '../../../../core/types.ts';

export const challenge: ProductionChallenge = {
  id: 'p2-01-attack-plus-body',
  title: 'Attack + Body',
  description: 'Combine a plucky attack layer with a sustained body layer to create a cohesive sound with both punch and warmth.',
  difficulty: 1,
  module: 'P2',
  layers: [
    {
      id: 'attack',
      name: 'Attack',
      sourceConfig: { type: 'drum' },
      initialVolume: -6,
    },
    {
      id: 'body',
      name: 'Body',
      sourceConfig: { type: 'pad', frequency: 150 },
      initialVolume: -6,
    },
  ],
  target: {
    type: 'reference',
    layers: [
      { volume: -6, muted: false },
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
    'The attack provides punch, the body provides sustain',
    'They should sound like one instrument together',
    'The body is usually a bit louder than the attack',
  ],
};
