/**
 * I3-05: Drum Balance
 * Balancing kick, snare, and hi-hat
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i3-05-drum-balance',
  title: 'Drum Balance',
  description:
    'Balance the full drum kit. The kick should provide the foundation, the snare should cut through on beats 2 and 4, and the hi-hats should add sparkle without dominating. Each element needs its own frequency space.',
  difficulty: 2,
  module: 'I3',
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
    description: 'Create a balanced drum mix with clear separation',
    conditions: [
      { type: 'relative_level', louder: 'kick', quieter: 'hihat', band: 'low' },
      { type: 'relative_level', louder: 'snare', quieter: 'hihat', band: 'mid' },
      { type: 'eq_cut', track: 'hihat', band: 'low', minCut: 4 },
    ],
  },
  controls: {
    eq: 'parametric',
    compressor: false,
    volume: true,
  },
  hints: [
    'Kick owns the lows, snare owns the mids, hi-hat owns the highs',
    'Cut the hi-hat lows completely - it has no business there',
    'Make sure kick and snare don\'t fight in the low-mids',
  ],
};
