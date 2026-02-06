/**
 * A5-01: Rock Punch
 * Create a punchy rock mix
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a5-01-rock-punch',
  title: 'Rock Punch',
  description:
    'Rock mixes need punch and energy. The drums hit hard, the bass is tight, and guitars fill the space. Create an aggressive, punchy rock sound.',
  difficulty: 2,
  module: 'A5',
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
      initialPan: 0.5,
      color: '#22c55e',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Create a punchy rock mix',
    conditions: [
      { type: 'volume_balanced', track1: 'kick', track2: 'snare', tolerance: 3 },
      { type: 'volume_balanced', track1: 'kick', track2: 'bass', tolerance: 3 },
      { type: 'eq_boost', track: 'kick', band: 'low', minBoost: 1 },
      { type: 'eq_boost', track: 'snare', band: 'mid', minBoost: 1 },
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
    'Boost kick lows for weight',
    'Boost snare mids for crack',
    'Keep the low end centered and tight',
  ],
};
