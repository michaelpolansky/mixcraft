/**
 * A2-08: Lead Vocal Master
 * Create the ultimate lead vocal sound
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a2-08-lead-vocal-master',
  title: 'Lead Vocal Master',
  description:
    'Final challenge: create a radio-ready lead vocal that sits perfectly in a full mix. Apply everything you\'ve learned - EQ, dynamics, space, and balance.',
  difficulty: 3,
  module: 'A2',
  tracks: [
    {
      id: 'vocal',
      name: 'Lead Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      initialVolume: -6,
      color: '#a855f7',
    },
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
    {
      id: 'guitar',
      name: 'Guitar',
      sourceConfig: { type: 'guitar', frequency: 330 },
      initialVolume: 0,
      color: '#f97316',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Create the ultimate lead vocal sound',
    conditions: [
      { type: 'eq_cut', track: 'vocal', band: 'low', minCut: 2 },
      { type: 'eq_boost', track: 'vocal', band: 'mid', minBoost: 1 },
      { type: 'eq_boost', track: 'vocal', band: 'high', minBoost: 2 },
      { type: 'pan_position', track: 'vocal', position: 'center' },
      { type: 'depth_placement', track: 'vocal', depth: 'front' },
      { type: 'volume_louder', track1: 'vocal', track2: 'kick' },
      { type: 'volume_louder', track1: 'vocal', track2: 'guitar' },
    ],
  },
  controls: {
    eq: true,
    compressor: 'simple',
    volume: true,
    pan: true,
    reverb: true,
  },
  hints: [
    'EQ: cut lows, boost mids for presence, boost highs for air',
    'Keep the vocal dry and centered',
    'The vocal must be clearly the loudest element',
  ],
};
