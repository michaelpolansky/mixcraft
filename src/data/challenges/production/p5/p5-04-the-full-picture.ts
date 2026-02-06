/**
 * P5-04: The Full Picture
 * Complete 3D soundstage with all controls
 */

import type { ProductionChallenge } from '../../../../core/types.ts';

export const challenge: ProductionChallenge = {
  id: 'p5-04-the-full-picture',
  title: 'The Full Picture',
  description: 'The final challenge: create a complete mix with proper level balance, stereo width, and frequency separation. Every control matters.',
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
      sourceConfig: { type: 'bass', frequency: 55 },
      initialVolume: -6,
      initialPan: 0,
    },
    {
      id: 'lead',
      name: 'Lead',
      sourceConfig: { type: 'tone', frequency: 440 },
      initialVolume: -6,
      initialPan: 0,
    },
    {
      id: 'pad',
      name: 'Pad',
      sourceConfig: { type: 'pad', frequency: 220 },
      initialVolume: -6,
      initialPan: 0,
    },
  ],
  target: {
    type: 'goal',
    description: 'Complete mix: rhythm section centered, lead up front, pad in back, proper frequency balance',
    conditions: [
      // Level hierarchy
      { type: 'level_order', louder: 'kick', quieter: 'pad' },
      { type: 'level_order', louder: 'lead', quieter: 'pad' },
      // Rhythm centered
      { type: 'pan_position', layerId: 'kick', position: [-0.1, 0.1] },
      { type: 'pan_position', layerId: 'bass', position: [-0.1, 0.1] },
      // Stereo width
      { type: 'pan_spread', minWidth: 0.4 },
      // Relative levels
      { type: 'relative_level', layer1: 'kick', layer2: 'bass', difference: [0, 6] },
    ],
  },
  availableControls: {
    volume: true,
    mute: true,
    pan: true,
    eq: true,
  },
  hints: [
    'Kick and bass form the centered foundation',
    'Lead should be prominent but not overwhelming',
    'Use EQ to separate the pad from the bass',
    'Use pan to create width without losing focus',
  ],
};
