/**
 * P5-01: Front and Back
 * Use EQ and level to create depth
 */

import type { ProductionChallenge } from '../../../../core/types.ts';

export const challenge: ProductionChallenge = {
  id: 'p5-01-front-and-back',
  title: 'Front and Back',
  description: 'Create depth by placing elements at different distances. Use EQ: brighter and louder = closer, darker and quieter = farther.',
  difficulty: 2,
  module: 'P5',
  layers: [
    {
      id: 'lead',
      name: 'Lead',
      sourceConfig: { type: 'tone', frequency: 440 },
      initialVolume: -9,
      initialPan: 0,
    },
    {
      id: 'pad',
      name: 'Pad',
      sourceConfig: { type: 'pad', frequency: 220 },
      initialVolume: -9,
      initialPan: 0,
    },
    {
      id: 'ambient',
      name: 'Ambient',
      sourceConfig: { type: 'pad', frequency: 880 },
      initialVolume: -9,
      initialPan: 0,
    },
  ],
  target: {
    type: 'goal',
    description: 'Lead up front (bright, loud), pad in middle, ambient in back (dark, quiet)',
    conditions: [
      { type: 'level_order', louder: 'lead', quieter: 'pad' },
      { type: 'level_order', louder: 'pad', quieter: 'ambient' },
      { type: 'relative_level', layer1: 'lead', layer2: 'ambient', difference: [6, 15] },
    ],
  },
  availableControls: {
    volume: true,
    mute: true,
    pan: true,
    eq: true,
  },
  hints: [
    'Louder and brighter elements feel closer',
    'Cut highs on the ambient layer to push it back',
    'Boost highs on the lead to bring it forward',
  ],
};
