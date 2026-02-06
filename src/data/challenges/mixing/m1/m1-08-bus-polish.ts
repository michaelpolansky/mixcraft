/**
 * M1-08: Bus Polish
 * Apply mix bus processing for cohesion
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'm1-08-bus-polish',
  title: 'Bus Polish',
  description:
    'With all elements in place, apply mix bus processing. Gentle compression glues everything together, bus EQ adds final tonal shaping.',
  difficulty: 3,
  module: 'M1',
  tracks: [
    {
      id: 'vocal',
      name: 'Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      initialVolume: -2,
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
      initialVolume: -2,
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
    description: 'Apply bus processing for polish',
    conditions: [
      { type: 'bus_compression', minAmount: 10, maxAmount: 40 },
      { type: 'bus_eq_boost', band: 'high', minBoost: 1 },
      { type: 'volume_louder', track1: 'vocal', track2: 'guitar' },
      { type: 'volume_balanced', track1: 'kick', track2: 'bass', tolerance: 3 },
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
    'Gentle bus compression for glue',
    'High boost adds polish',
    'Keep the vocal on top',
  ],
};
