/**
 * A4-05: Punch and Glue
 * Combine bus compression with EQ for impact
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a4-05-punch-and-glue',
  title: 'Punch and Glue',
  description:
    'Combine bus compression for cohesion with EQ for tonal balance. This one-two punch is the foundation of professional mix bus processing.',
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
    description: 'Add punch with compression and shape with EQ',
    conditions: [
      { type: 'bus_compression', minAmount: 15, maxAmount: 50 },
      { type: 'bus_eq_boost', band: 'low', minBoost: 1 },
      { type: 'bus_eq_boost', band: 'high', minBoost: 1 },
      { type: 'volume_balanced', track1: 'kick', track2: 'bass', tolerance: 3 },
    ],
  },
  controls: {
    eq: false,
    compressor: false,
    volume: true,
    pan: false,
    reverb: false,
    busCompressor: true,
    busEQ: true,
  },
  hints: [
    'Compress first, then EQ',
    'Boost lows for weight, highs for air',
    'Keep the rhythm section balanced',
  ],
};
