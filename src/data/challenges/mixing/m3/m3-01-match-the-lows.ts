/**
 * M3-01: Match the Lows
 * Match the low-frequency balance of a reference
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'm3-01-match-the-lows',
  title: 'Match the Lows',
  description:
    'Professional mixes have a controlled, powerful low end. Match the low-frequency balance - solid kick, tight bass, no mud or boom.',
  difficulty: 2,
  module: 'M3',
  tracks: [
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      initialVolume: -2,
      color: '#ef4444',
    },
    {
      id: 'bass',
      name: 'Bass',
      sourceConfig: { type: 'bass', frequency: 55 },
      initialVolume: -4,
      color: '#3b82f6',
    },
    {
      id: 'snare',
      name: 'Snare',
      sourceConfig: { type: 'snare' },
      initialVolume: -3,
      color: '#f97316',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Match the professional low-end balance',
    conditions: [
      { type: 'volume_balanced', track1: 'kick', track2: 'bass', tolerance: 3 },
      { type: 'frequency_separation', track1: 'kick', track2: 'bass', band: 'low' },
      { type: 'eq_boost', track: 'kick', band: 'low', minBoost: 1 },
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
    'Kick and bass should be balanced',
    'Separate them with EQ',
    'Keep all lows centered',
  ],
};
