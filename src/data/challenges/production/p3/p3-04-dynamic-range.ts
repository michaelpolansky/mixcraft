/**
 * P3-04: Dynamic Range
 * Create contrast between elements
 */

import type { ProductionChallenge } from '../../../../core/types.ts';

export const challenge: ProductionChallenge = {
  id: 'p3-04-dynamic-range',
  title: 'Dynamic Range',
  description: 'Create contrast by having clear level differences between elements. Some should dominate, others support.',
  difficulty: 3,
  module: 'P3',
  layers: [
    {
      id: 'main',
      name: 'Main',
      sourceConfig: { type: 'bass', frequency: 80 },
      initialVolume: -6,
      initialPan: 0,
    },
    {
      id: 'support1',
      name: 'Support 1',
      sourceConfig: { type: 'pad', frequency: 220 },
      initialVolume: -6,
      initialPan: 0,
    },
    {
      id: 'support2',
      name: 'Support 2',
      sourceConfig: { type: 'pad', frequency: 440 },
      initialVolume: -6,
      initialPan: 0,
    },
    {
      id: 'accent',
      name: 'Accent',
      sourceConfig: { type: 'tone', frequency: 880 },
      initialVolume: -6,
      initialPan: 0,
    },
  ],
  target: {
    type: 'goal',
    description: 'Main element loudest, supports in the middle, accent quietest but present',
    conditions: [
      { type: 'level_order', louder: 'main', quieter: 'support1' },
      { type: 'level_order', louder: 'main', quieter: 'support2' },
      { type: 'level_order', louder: 'support1', quieter: 'accent' },
      { type: 'relative_level', layer1: 'main', layer2: 'accent', difference: [6, 18] },
      { type: 'pan_spread', minWidth: 0.5 },
    ],
  },
  availableControls: {
    volume: true,
    mute: true,
    pan: true,
    eq: false,
  },
  hints: [
    'The main element should be clearly the loudest',
    'Create at least 6dB difference between main and accent',
    'Use pan to separate the support elements',
  ],
};
