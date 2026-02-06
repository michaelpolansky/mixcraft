/**
 * P4-04: Groove Foundation
 * Balance drums, bass, and rhythm guitar
 */

import type { ProductionChallenge } from '../../../../core/types.ts';

export const challenge: ProductionChallenge = {
  id: 'p4-04-groove-foundation',
  title: 'Groove Foundation',
  description: 'Build a solid groove foundation with drums, bass, and rhythm element. Each has its place in the mix.',
  difficulty: 3,
  module: 'P4',
  layers: [
    {
      id: 'drums',
      name: 'Drums',
      sourceConfig: { type: 'drum' },
      initialVolume: -6,
      initialPan: 0,
    },
    {
      id: 'bass',
      name: 'Bass',
      sourceConfig: { type: 'bass', frequency: 60 },
      initialVolume: -6,
      initialPan: 0,
    },
    {
      id: 'rhythm-l',
      name: 'Rhythm L',
      sourceConfig: { type: 'pad', frequency: 200 },
      initialVolume: -6,
      initialPan: 0,
    },
    {
      id: 'rhythm-r',
      name: 'Rhythm R',
      sourceConfig: { type: 'pad', frequency: 200 },
      initialVolume: -6,
      initialPan: 0,
    },
  ],
  target: {
    type: 'goal',
    description: 'Drums and bass centered, rhythm panned wide, proper level hierarchy',
    conditions: [
      { type: 'pan_position', layerId: 'drums', position: [-0.1, 0.1] },
      { type: 'pan_position', layerId: 'bass', position: [-0.1, 0.1] },
      { type: 'pan_position', layerId: 'rhythm-l', position: [-1, -0.4] },
      { type: 'pan_position', layerId: 'rhythm-r', position: [0.4, 1] },
      { type: 'level_order', louder: 'drums', quieter: 'rhythm-l' },
      { type: 'level_order', louder: 'bass', quieter: 'rhythm-r' },
    ],
  },
  availableControls: {
    volume: true,
    mute: true,
    pan: true,
    eq: false,
  },
  hints: [
    'Drums and bass are the center of the groove',
    'Double-tracked rhythm elements pan wide',
    'Rhythm supports but doesn\'t compete with bass',
  ],
};
