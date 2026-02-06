/**
 * A3-02: Bass & Kick Relationship
 * Get the low end working together
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a3-02-bass-kick-relationship',
  title: 'Bass & Kick Relationship',
  description:
    'The kick and bass share the low end and must work together. Use EQ to give each its space - the kick punches through while the bass provides warmth and sustain.',
  difficulty: 2,
  module: 'A3',
  tracks: [
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      initialVolume: 0,
      color: '#ef4444',
    },
    {
      id: 'bass',
      name: 'Bass',
      sourceConfig: { type: 'bass', frequency: 55 },
      initialVolume: 0,
      color: '#3b82f6',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Get kick and bass working together',
    conditions: [
      { type: 'frequency_separation', track1: 'kick', track2: 'bass', band: 'low' },
      { type: 'volume_balanced', track1: 'kick', track2: 'bass', tolerance: 4 },
      { type: 'pan_position', track: 'kick', position: 'center' },
      { type: 'pan_position', track: 'bass', position: 'center' },
    ],
  },
  controls: {
    eq: true,
    compressor: false,
    volume: true,
    pan: true,
    reverb: false,
  },
  hints: [
    'Use EQ to carve space in the lows',
    'Keep both centered for solid low end',
    'Balance levels so neither dominates',
  ],
};
