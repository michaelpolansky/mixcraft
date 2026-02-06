/**
 * P4-03: Percussion Spread
 * Distribute percussion across stereo
 */

import type { ProductionChallenge } from '../../../../core/types.ts';

export const challenge: ProductionChallenge = {
  id: 'p4-03-percussion-spread',
  title: 'Percussion Spread',
  description: 'Spread four percussion elements across the stereo field. Create width and movement without losing the center focus.',
  difficulty: 2,
  module: 'P4',
  layers: [
    {
      id: 'shaker-l',
      name: 'Shaker L',
      sourceConfig: { type: 'noise' },
      initialVolume: -12,
      initialPan: 0,
    },
    {
      id: 'shaker-r',
      name: 'Shaker R',
      sourceConfig: { type: 'noise' },
      initialVolume: -12,
      initialPan: 0,
    },
    {
      id: 'clave',
      name: 'Clave',
      sourceConfig: { type: 'tone', frequency: 1200 },
      initialVolume: -12,
      initialPan: 0,
    },
    {
      id: 'rim',
      name: 'Rim',
      sourceConfig: { type: 'tone', frequency: 800 },
      initialVolume: -12,
      initialPan: 0,
    },
  ],
  target: {
    type: 'goal',
    description: 'Create wide stereo image with shakers on sides, clave and rim slightly off-center',
    conditions: [
      { type: 'pan_position', layerId: 'shaker-l', position: [-1, -0.5] },
      { type: 'pan_position', layerId: 'shaker-r', position: [0.5, 1] },
      { type: 'pan_position', layerId: 'clave', position: [-0.4, 0.1] },
      { type: 'pan_position', layerId: 'rim', position: [-0.1, 0.4] },
      { type: 'pan_spread', minWidth: 1.2 },
    ],
  },
  availableControls: {
    volume: true,
    mute: true,
    pan: true,
    eq: false,
  },
  hints: [
    'Shakers work great as a wide stereo pair',
    'Clave and rim can be slightly off-center',
    'Aim for a full stereo spread',
  ],
};
