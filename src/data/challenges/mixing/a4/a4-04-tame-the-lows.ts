/**
 * A4-04: Tame the Lows
 * Control low-end buildup on the mix bus
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a4-04-tame-the-lows',
  title: 'Tame the Lows',
  description:
    'When multiple low-frequency elements combine, the low end can get muddy and overwhelming. Use bus EQ to clean up the lows and restore clarity.',
  difficulty: 2,
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
      id: 'bass',
      name: 'Bass',
      sourceConfig: { type: 'bass', frequency: 55 },
      initialVolume: 0,
      color: '#3b82f6',
    },
    {
      id: 'synth',
      name: 'Synth',
      sourceConfig: { type: 'pad', frequency: 110 },
      initialVolume: -2,
      color: '#a855f7',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Clean up the low end on the mix bus',
    conditions: [
      { type: 'bus_eq_cut', band: 'low', minCut: 2 },
      { type: 'volume_balanced', track1: 'kick', track2: 'bass', tolerance: 3 },
      { type: 'pan_position', track: 'kick', position: 'center' },
      { type: 'pan_position', track: 'bass', position: 'center' },
    ],
  },
  controls: {
    eq: false,
    compressor: false,
    volume: true,
    pan: true,
    reverb: false,
    busEQ: true,
  },
  hints: [
    'Cut the lows to reduce mud',
    'The low end should be tight, not boomy',
    'Keep low-frequency elements centered',
  ],
};
