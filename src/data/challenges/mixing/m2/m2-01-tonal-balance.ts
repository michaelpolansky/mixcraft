/**
 * M2-01: Tonal Balance
 * Achieve balanced frequency response across the mix
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'm2-01-tonal-balance',
  title: 'Tonal Balance',
  description:
    'Mastering starts with tonal balance. The mix should have solid lows, clear mids, and crisp highs. Use broad EQ moves to shape the overall tone.',
  difficulty: 2,
  module: 'M2',
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
      id: 'vocal',
      name: 'Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      initialVolume: -2,
      color: '#a855f7',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Achieve tonal balance with bus EQ',
    conditions: [
      { type: 'bus_eq_boost', band: 'low', minBoost: 1 },
      { type: 'bus_eq_boost', band: 'high', minBoost: 1 },
      { type: 'volume_balanced', track1: 'kick', track2: 'bass', tolerance: 3 },
      { type: 'volume_louder', track1: 'vocal', track2: 'snare' },
    ],
  },
  controls: {
    eq: false,
    compressor: false,
    volume: true,
    pan: false,
    reverb: false,
    busEQ: true,
  },
  hints: [
    'Boost lows for weight and foundation',
    'Boost highs for air and sparkle',
    'Mastering EQ moves are subtle - 1-2dB',
  ],
};
