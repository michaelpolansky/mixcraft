/**
 * I5-04: Drum Room
 * Add cohesive room reverb to drums
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i5-04-drum-room',
  title: 'Drum Room',
  description:
    'Drums sound more realistic when they share the same "room." Add subtle reverb to create cohesion, but keep the kick and snare punchy by not overdoing it.',
  difficulty: 2,
  module: 'I5',
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
    description: 'Add subtle room reverb to create drum cohesion',
    conditions: [
      { type: 'reverb_amount', track: 'kick', minMix: 5, maxMix: 25 },
      { type: 'reverb_amount', track: 'snare', minMix: 10, maxMix: 35 },
      { type: 'reverb_amount', track: 'hihat', minMix: 15, maxMix: 40 },
    ],
  },
  controls: {
    eq: false,
    compressor: false,
    volume: true,
    pan: false,
    reverb: true,
  },
  hints: [
    'Keep kick reverb subtle - too much makes it muddy',
    'Snare can have a bit more reverb for body',
    'Hi-hat can handle the most reverb without losing punch',
  ],
};
