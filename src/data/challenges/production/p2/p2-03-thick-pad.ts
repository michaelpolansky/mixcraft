/**
 * P2-03: Thick Pad
 * Combine pad layers for rich texture
 */

import type { ProductionChallenge } from '../../../../core/types.ts';

export const challenge: ProductionChallenge = {
  id: 'p2-03-thick-pad',
  title: 'Thick Pad',
  description: 'Create a rich, full pad sound by combining thin, warm, and bright layers. Each adds a different dimension.',
  difficulty: 2,
  module: 'P2',
  layers: [
    {
      id: 'thin',
      name: 'Thin',
      sourceConfig: { type: 'tone', frequency: 440 },
      initialVolume: -12,
    },
    {
      id: 'warm',
      name: 'Warm',
      sourceConfig: { type: 'pad', frequency: 220 },
      initialVolume: -6,
    },
    {
      id: 'bright',
      name: 'Bright',
      sourceConfig: { type: 'pad', frequency: 880 },
      initialVolume: -6,
    },
  ],
  target: {
    type: 'reference',
    layers: [
      { volume: -12, muted: false },
      { volume: -3, muted: false },
      { volume: -9, muted: false },
    ],
  },
  availableControls: {
    volume: true,
    mute: true,
    pan: false,
    eq: false,
  },
  hints: [
    'The warm layer is the foundation',
    'Bright adds shimmer without overwhelming',
    'Thin adds a subtle edge or definition',
  ],
};
