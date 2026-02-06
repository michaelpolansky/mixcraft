/**
 * M3-05: Match the Punch
 * Match the dynamic impact of a reference
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'm3-05-match-the-punch',
  title: 'Match the Punch',
  description:
    'Professional mixes have impact and punch. Match the dynamics - punchy drums, controlled dynamics, cohesive glue.',
  difficulty: 3,
  module: 'M3',
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
      initialVolume: -3,
      color: '#f97316',
    },
    {
      id: 'bass',
      name: 'Bass',
      sourceConfig: { type: 'bass', frequency: 55 },
      initialVolume: -2,
      color: '#3b82f6',
    },
    {
      id: 'guitar',
      name: 'Guitar',
      sourceConfig: { type: 'guitar', frequency: 330 },
      initialVolume: -4,
      color: '#22c55e',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Match the professional punch and dynamics',
    conditions: [
      { type: 'bus_compression', minAmount: 15, maxAmount: 45 },
      { type: 'eq_boost', track: 'kick', band: 'mid', minBoost: 1 },
      { type: 'eq_boost', track: 'snare', band: 'mid', minBoost: 1 },
      { type: 'volume_balanced', track1: 'kick', track2: 'snare', tolerance: 3 },
      { type: 'volume_balanced', track1: 'kick', track2: 'bass', tolerance: 3 },
    ],
  },
  controls: {
    eq: true,
    compressor: 'simple',
    volume: true,
    pan: false,
    reverb: false,
    busCompressor: true,
  },
  hints: [
    'Use bus compression for glue',
    'Boost mids for attack and punch',
    'Balance the rhythm section',
  ],
};
