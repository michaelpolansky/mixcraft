/**
 * A1-01: Kit Foundation
 * Establish basic drum balance and levels
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a1-01-kit-foundation',
  title: 'Kit Foundation',
  description:
    'Before any processing, get the raw balance right. The kick provides the pulse, the snare marks the backbeat, and the hi-hat adds rhythm. Set levels so each element has its place.',
  difficulty: 1,
  module: 'A1',
  tracks: [
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      initialVolume: -3,
      color: '#ef4444',
    },
    {
      id: 'snare',
      name: 'Snare',
      sourceConfig: { type: 'snare' },
      initialVolume: -6,
      color: '#f97316',
    },
    {
      id: 'hihat',
      name: 'Hi-Hat',
      sourceConfig: { type: 'hihat' },
      initialVolume: 0,
      color: '#eab308',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Create a balanced drum foundation',
    conditions: [
      { type: 'volume_balanced', track1: 'kick', track2: 'snare', tolerance: 3 },
      { type: 'volume_louder', track1: 'kick', track2: 'hihat' },
      { type: 'volume_louder', track1: 'snare', track2: 'hihat' },
      { type: 'volume_range', track: 'hihat', minDb: -12, maxDb: -3 },
    ],
  },
  controls: {
    eq: false,
    compressor: false,
    volume: true,
    pan: false,
    reverb: false,
  },
  hints: [
    'Start with the kick and snare at similar levels',
    'Hi-hat should support, not dominate',
    'Pull the hi-hat down until the kick and snare breathe',
  ],
};
