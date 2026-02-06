/**
 * A5-07: Metal Wall
 * Create an aggressive metal wall of sound
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a5-07-metal-wall',
  title: 'Metal Wall',
  description:
    'Metal mixes are aggressive, heavy, and dense. Double-tracked guitars create a wall of sound, drums hit hard, and the bass fills the gaps. Create crushing heaviness.',
  difficulty: 3,
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
      id: 'guitarL',
      name: 'Guitar L',
      sourceConfig: { type: 'guitar', frequency: 220 },
      initialVolume: -4,
      initialPan: -0.5,
      color: '#22c55e',
    },
    {
      id: 'guitarR',
      name: 'Guitar R',
      sourceConfig: { type: 'guitar', frequency: 220 },
      initialVolume: -4,
      initialPan: 0.5,
      color: '#10b981',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Create an aggressive metal wall of sound',
    conditions: [
      { type: 'pan_opposite', track1: 'guitarL', track2: 'guitarR' },
      { type: 'pan_spread', track1: 'guitarL', track2: 'guitarR', minSpread: 100 },
      { type: 'volume_balanced', track1: 'guitarL', track2: 'guitarR', tolerance: 2 },
      { type: 'eq_boost', track: 'kick', band: 'mid', minBoost: 1 },
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
    'Pan guitars hard left and right',
    'Boost kick mids for click and attack',
    'Keep low end centered and tight',
  ],
};
