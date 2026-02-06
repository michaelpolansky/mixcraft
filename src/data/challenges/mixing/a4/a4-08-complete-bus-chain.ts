/**
 * A4-08: Complete Bus Chain
 * Build a full mix bus processing chain
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a4-08-complete-bus-chain',
  title: 'Complete Bus Chain',
  description:
    'Final challenge: build a complete mix bus chain. Balance the tracks, then apply bus compression for glue and EQ for tonal shaping. Create a polished, professional mix.',
  difficulty: 3,
  module: 'A4',
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
    {
      id: 'vocal',
      name: 'Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      initialVolume: -2,
      color: '#a855f7',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Build a complete mix bus processing chain',
    conditions: [
      { type: 'bus_compression', minAmount: 10, maxAmount: 45 },
      { type: 'bus_eq_boost', band: 'high', minBoost: 1 },
      { type: 'volume_louder', track1: 'vocal', track2: 'guitar' },
      { type: 'volume_balanced', track1: 'kick', track2: 'bass', tolerance: 3 },
      { type: 'pan_position', track: 'vocal', position: 'center' },
      { type: 'pan_position', track: 'kick', position: 'center' },
      { type: 'pan_position', track: 'bass', position: 'center' },
    ],
  },
  controls: {
    eq: true,
    compressor: 'simple',
    volume: true,
    pan: true,
    reverb: true,
    busCompressor: true,
    busEQ: true,
  },
  hints: [
    'Balance tracks first, then process the bus',
    'Gentle bus compression glues it together',
    'High boost on the bus adds polish',
  ],
};
