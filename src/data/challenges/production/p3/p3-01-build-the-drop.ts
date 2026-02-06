/**
 * P3-01: Build the Drop
 * Create rising energy with four elements
 */

import type { ProductionChallenge } from '../../../../core/types.ts';

export const challenge: ProductionChallenge = {
  id: 'p3-01-build-the-drop',
  title: 'Build the Drop',
  description: 'Create a powerful drop by having the kick and bass dominate while pads and leads support. Spread elements across the stereo field.',
  difficulty: 2,
  module: 'P3',
  layers: [
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      initialVolume: -12,
      initialPan: 0,
    },
    {
      id: 'bass',
      name: 'Bass',
      sourceConfig: { type: 'bass', frequency: 55 },
      initialVolume: -12,
      initialPan: 0,
    },
    {
      id: 'pad',
      name: 'Pad',
      sourceConfig: { type: 'pad', frequency: 330 },
      initialVolume: -12,
      initialPan: 0,
    },
    {
      id: 'lead',
      name: 'Lead',
      sourceConfig: { type: 'tone', frequency: 660 },
      initialVolume: -12,
      initialPan: 0,
    },
  ],
  target: {
    type: 'goal',
    description: 'Create maximum impact: kick and bass loud and centered, pad and lead spread wide',
    conditions: [
      { type: 'level_order', louder: 'kick', quieter: 'pad' },
      { type: 'level_order', louder: 'bass', quieter: 'lead' },
      { type: 'pan_spread', minWidth: 0.6 },
      { type: 'pan_position', layerId: 'kick', position: [-0.2, 0.2] },
      { type: 'pan_position', layerId: 'bass', position: [-0.2, 0.2] },
    ],
  },
  availableControls: {
    volume: true,
    mute: true,
    pan: true,
    eq: false,
  },
  hints: [
    'Keep kick and bass centered for power',
    'Spread pad and lead to the sides',
    'Rhythm section should be louder than harmonic elements',
  ],
};
