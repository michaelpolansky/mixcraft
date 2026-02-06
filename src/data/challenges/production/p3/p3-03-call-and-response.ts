/**
 * P3-03: Call and Response
 * Balance lead and answer elements
 */

import type { ProductionChallenge } from '../../../../core/types.ts';

export const challenge: ProductionChallenge = {
  id: 'p3-03-call-and-response',
  title: 'Call and Response',
  description: 'Balance a lead, answer, and pad so they have a conversation. Pan the lead and answer apart while keeping the pad as a foundation.',
  difficulty: 2,
  module: 'P3',
  layers: [
    {
      id: 'lead',
      name: 'Lead',
      sourceConfig: { type: 'tone', frequency: 660 },
      initialVolume: -6,
      initialPan: 0,
    },
    {
      id: 'answer',
      name: 'Answer',
      sourceConfig: { type: 'tone', frequency: 880 },
      initialVolume: -6,
      initialPan: 0,
    },
    {
      id: 'pad',
      name: 'Pad',
      sourceConfig: { type: 'pad', frequency: 330 },
      initialVolume: -6,
      initialPan: 0,
    },
  ],
  target: {
    type: 'goal',
    description: 'Lead and answer on opposite sides, pad centered, lead slightly louder than answer',
    conditions: [
      { type: 'level_order', louder: 'lead', quieter: 'answer' },
      { type: 'level_order', louder: 'lead', quieter: 'pad' },
      { type: 'pan_position', layerId: 'lead', position: [-0.8, -0.3] },
      { type: 'pan_position', layerId: 'answer', position: [0.3, 0.8] },
      { type: 'pan_position', layerId: 'pad', position: [-0.3, 0.3] },
    ],
  },
  availableControls: {
    volume: true,
    mute: true,
    pan: true,
    eq: false,
  },
  hints: [
    'The lead is the main melody - pan it left',
    'The answer responds - pan it right',
    'The pad stays centered as the foundation',
  ],
};
