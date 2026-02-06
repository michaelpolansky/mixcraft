/**
 * M2-06: Final Master
 * Complete mastering chain
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'm2-06-final-master',
  title: 'Final Master',
  description:
    'Final challenge: apply a complete mastering chain. Balance the mix, apply EQ for tonal shaping, and use compression for glue. Create a polished, release-ready master.',
  difficulty: 3,
  module: 'M2',
  tracks: [
    {
      id: 'vocal',
      name: 'Lead Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      initialVolume: -4,
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
      initialVolume: -5,
      color: '#22c55e',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Create a polished final master',
    conditions: [
      { type: 'bus_compression', minAmount: 10, maxAmount: 35 },
      { type: 'bus_eq_boost', band: 'low', minBoost: 1 },
      { type: 'bus_eq_boost', band: 'high', minBoost: 1 },
      { type: 'volume_louder', track1: 'vocal', track2: 'guitar' },
      { type: 'volume_balanced', track1: 'kick', track2: 'bass', tolerance: 3 },
      { type: 'pan_position', track: 'vocal', position: 'center' },
    ],
  },
  controls: {
    eq: true,
    compressor: 'simple',
    volume: true,
    pan: true,
    reverb: false,
    busCompressor: true,
    busEQ: true,
  },
  hints: [
    'Balance the mix first',
    'Apply subtle bus compression',
    'EQ for tonal polish - lows for weight, highs for air',
  ],
};
