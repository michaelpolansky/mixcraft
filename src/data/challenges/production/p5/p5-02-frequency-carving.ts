/**
 * P5-02: Frequency Carving
 * Use EQ to separate overlapping elements
 */

import type { ProductionChallenge } from '../../../../core/types.ts';

export const challenge: ProductionChallenge = {
  id: 'p5-02-frequency-carving',
  title: 'Frequency Carving',
  description: 'Three elements compete for the same frequency space. Use EQ to carve out room for each so they don\'t mask each other.',
  difficulty: 3,
  module: 'P5',
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
      sourceConfig: { type: 'bass', frequency: 60 },
      initialVolume: -6,
      initialPan: 0,
    },
    {
      id: 'low-synth',
      name: 'Low Synth',
      sourceConfig: { type: 'bass', frequency: 100 },
      initialVolume: -6,
      initialPan: 0,
    },
  ],
  target: {
    type: 'goal',
    description: 'Each element occupies its own space: kick has punch, bass has body, synth has presence',
    conditions: [
      { type: 'level_order', louder: 'kick', quieter: 'low-synth' },
      { type: 'pan_position', layerId: 'kick', position: [-0.1, 0.1] },
      { type: 'pan_position', layerId: 'bass', position: [-0.1, 0.1] },
    ],
  },
  availableControls: {
    volume: true,
    mute: true,
    pan: true,
    eq: true,
  },
  hints: [
    'Cut lows from the low synth to make room for kick and bass',
    'Boost highs on the kick for attack, cut lows from bass to tighten',
    'Each element should have its own frequency home',
  ],
};
