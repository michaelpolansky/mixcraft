/**
 * P4-01: Wide Drums
 * Pan drums for stereo width
 */

import type { ProductionChallenge } from '../../../../core/types.ts';

export const challenge: ProductionChallenge = {
  id: 'p4-01-wide-drums',
  title: 'Wide Drums',
  description: 'Create a wide, punchy drum sound. Keep the kick centered for power while spreading hi-hats and percussion across the stereo field.',
  difficulty: 2,
  module: 'P4',
  layers: [
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      initialVolume: -6,
      initialPan: 0,
    },
    {
      id: 'snare',
      name: 'Snare',
      sourceConfig: { type: 'noise' },
      initialVolume: -9,
      initialPan: 0,
    },
    {
      id: 'hat-l',
      name: 'Hat L',
      sourceConfig: { type: 'tone', frequency: 8000 },
      initialVolume: -15,
      initialPan: 0,
    },
    {
      id: 'hat-r',
      name: 'Hat R',
      sourceConfig: { type: 'tone', frequency: 10000 },
      initialVolume: -15,
      initialPan: 0,
    },
  ],
  target: {
    type: 'goal',
    description: 'Kick and snare centered, hats panned wide',
    conditions: [
      { type: 'pan_position', layerId: 'kick', position: [-0.1, 0.1] },
      { type: 'pan_position', layerId: 'snare', position: [-0.2, 0.2] },
      { type: 'pan_position', layerId: 'hat-l', position: [-1, -0.4] },
      { type: 'pan_position', layerId: 'hat-r', position: [0.4, 1] },
      { type: 'level_order', louder: 'kick', quieter: 'hat-l' },
    ],
  },
  availableControls: {
    volume: true,
    mute: true,
    pan: true,
    eq: false,
  },
  hints: [
    'Low frequency elements (kick) stay centered',
    'High hats can go wide without losing focus',
    'Snare usually stays centered or slightly off',
  ],
};
