/**
 * P4-02: Pocket Balance
 * Balance the rhythm section
 */

import type { ProductionChallenge } from '../../../../core/types.ts';

export const challenge: ProductionChallenge = {
  id: 'p4-02-pocket-balance',
  title: 'Pocket Balance',
  description: 'The pocket is where kick, bass, and percussion work together. Balance them so they groove without fighting.',
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
      id: 'bass',
      name: 'Bass',
      sourceConfig: { type: 'bass', frequency: 55 },
      initialVolume: -6,
      initialPan: 0,
    },
    {
      id: 'perc',
      name: 'Perc',
      sourceConfig: { type: 'noise' },
      initialVolume: -6,
      initialPan: 0,
    },
  ],
  target: {
    type: 'goal',
    description: 'Kick slightly louder than bass, percussion supporting, all three centered',
    conditions: [
      { type: 'level_order', louder: 'kick', quieter: 'bass' },
      { type: 'level_order', louder: 'bass', quieter: 'perc' },
      { type: 'relative_level', layer1: 'kick', layer2: 'bass', difference: [2, 6] },
      { type: 'pan_position', layerId: 'kick', position: [-0.1, 0.1] },
      { type: 'pan_position', layerId: 'bass', position: [-0.1, 0.1] },
    ],
  },
  availableControls: {
    volume: true,
    mute: true,
    pan: true,
    eq: false,
  },
  hints: [
    'The kick is the foundation of the pocket',
    'Bass should sit just under the kick',
    'Percussion adds texture, not volume',
  ],
};
