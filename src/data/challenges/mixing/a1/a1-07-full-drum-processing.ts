/**
 * A1-07: Full Drum Processing
 * Combine EQ, compression, pan, and reverb
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a1-07-full-drum-processing',
  title: 'Full Drum Processing',
  description:
    'Put it all together: EQ for tone, compression for glue, panning for width, reverb for space. Create a professional drum sound using all your tools.',
  difficulty: 3,
  module: 'A1',
  tracks: [
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      color: '#ef4444',
    },
    {
      id: 'snare',
      name: 'Snare',
      sourceConfig: { type: 'snare' },
      color: '#f97316',
    },
    {
      id: 'hihat',
      name: 'Hi-Hat',
      sourceConfig: { type: 'hihat' },
      color: '#eab308',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Create a fully processed drum mix',
    conditions: [
      { type: 'eq_boost', track: 'kick', band: 'low', minBoost: 2 },
      { type: 'eq_cut', track: 'hihat', band: 'low', minCut: 4 },
      { type: 'pan_position', track: 'kick', position: 'center' },
      { type: 'pan_position', track: 'hihat', position: 'left' },
      { type: 'depth_placement', track: 'kick', depth: 'front' },
    ],
  },
  controls: {
    eq: true,
    compressor: 'simple',
    volume: true,
    pan: true,
    reverb: true,
  },
  hints: [
    'Start with EQ: kick lows, hihat low cut',
    'Pan: kick center, hihat left',
    'Reverb: keep kick dry, add room to snare and hihat',
  ],
};
