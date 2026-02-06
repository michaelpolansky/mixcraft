/**
 * P3-02: Strip It Back
 * Create a breakdown by muting elements
 */

import type { ProductionChallenge } from '../../../../core/types.ts';

export const challenge: ProductionChallenge = {
  id: 'p3-02-strip-it-back',
  title: 'Strip It Back',
  description: 'Create a breakdown by removing energy. Mute the heavy elements and let the atmospheric parts breathe.',
  difficulty: 2,
  module: 'P3',
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
      id: 'atmosphere',
      name: 'Atmos',
      sourceConfig: { type: 'pad', frequency: 220 },
      initialVolume: -12,
      initialPan: 0,
    },
    {
      id: 'lead',
      name: 'Lead',
      sourceConfig: { type: 'tone', frequency: 440 },
      initialVolume: -12,
      initialPan: 0,
    },
  ],
  target: {
    type: 'goal',
    description: 'Create space by muting the heavy elements and featuring the atmospheric ones',
    conditions: [
      { type: 'layer_muted', layerId: 'kick', muted: true },
      { type: 'layer_muted', layerId: 'bass', muted: true },
      { type: 'layer_active', layerId: 'atmosphere', active: true },
      { type: 'layer_active', layerId: 'lead', active: true },
    ],
  },
  availableControls: {
    volume: true,
    mute: true,
    pan: true,
    eq: false,
  },
  hints: [
    'Breakdowns remove the rhythm section',
    'Atmospheric elements should be unmuted',
    'This creates contrast before the next section',
  ],
};
