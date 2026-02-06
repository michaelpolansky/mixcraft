/**
 * P5-03: Wide and Deep
 * Combine pan width with EQ depth
 */

import type { ProductionChallenge } from '../../../../core/types.ts';

export const challenge: ProductionChallenge = {
  id: 'p5-03-wide-and-deep',
  title: 'Wide and Deep',
  description: 'Create a 3D soundstage using both pan (width) and EQ (depth). Spread elements horizontally and place them at different depths.',
  difficulty: 3,
  module: 'P5',
  layers: [
    {
      id: 'center',
      name: 'Center',
      sourceConfig: { type: 'bass', frequency: 80 },
      initialVolume: -6,
      initialPan: 0,
    },
    {
      id: 'left',
      name: 'Left',
      sourceConfig: { type: 'pad', frequency: 330 },
      initialVolume: -9,
      initialPan: 0,
    },
    {
      id: 'right',
      name: 'Right',
      sourceConfig: { type: 'pad', frequency: 440 },
      initialVolume: -9,
      initialPan: 0,
    },
    {
      id: 'back',
      name: 'Back',
      sourceConfig: { type: 'pad', frequency: 660 },
      initialVolume: -12,
      initialPan: 0,
    },
  ],
  target: {
    type: 'goal',
    description: 'Center element front and focused, sides spread wide, back element pushed back',
    conditions: [
      { type: 'level_order', louder: 'center', quieter: 'left' },
      { type: 'level_order', louder: 'center', quieter: 'right' },
      { type: 'level_order', louder: 'left', quieter: 'back' },
      { type: 'pan_position', layerId: 'center', position: [-0.2, 0.2] },
      { type: 'pan_position', layerId: 'left', position: [-1, -0.4] },
      { type: 'pan_position', layerId: 'right', position: [0.4, 1] },
      { type: 'pan_spread', minWidth: 1.0 },
    ],
  },
  availableControls: {
    volume: true,
    mute: true,
    pan: true,
    eq: true,
  },
  hints: [
    'Center element stays centered and upfront',
    'Left and right elements spread wide',
    'Back element is quiet and dark (cut highs)',
  ],
};
