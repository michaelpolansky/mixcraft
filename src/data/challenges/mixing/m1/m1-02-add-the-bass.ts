/**
 * M1-02: Add the Bass
 * Integrate bass with the drum foundation
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'm1-02-add-the-bass',
  title: 'Add the Bass',
  description:
    'With drums established, bring in the bass. The kick and bass must work together - use EQ to carve space so they complement rather than fight.',
  difficulty: 2,
  module: 'M1',
  tracks: [
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      initialVolume: 0,
      color: '#ef4444',
    },
    {
      id: 'snare',
      name: 'Snare',
      sourceConfig: { type: 'snare' },
      initialVolume: -2,
      color: '#f97316',
    },
    {
      id: 'bass',
      name: 'Bass',
      sourceConfig: { type: 'bass', frequency: 55 },
      initialVolume: -4,
      color: '#3b82f6',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Integrate bass with drums',
    conditions: [
      { type: 'frequency_separation', track1: 'kick', track2: 'bass', band: 'low' },
      { type: 'volume_balanced', track1: 'kick', track2: 'bass', tolerance: 3 },
      { type: 'pan_position', track: 'kick', position: 'center' },
      { type: 'pan_position', track: 'bass', position: 'center' },
    ],
  },
  controls: {
    eq: true,
    compressor: 'simple',
    volume: true,
    pan: true,
    reverb: false,
  },
  hints: [
    'Use EQ to separate kick and bass',
    'Keep both centered',
    'Balance levels carefully',
  ],
};
