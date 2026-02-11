/**
 * I7-02: Drum Control
 * Compress drums for punch and balance kick/snare levels
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i7-02-drum-control',
  title: 'Drum Control',
  description:
    'Drums benefit from compression to add punch and consistency. Compress the snare to bring out its body, and balance the kick and snare levels.',
  difficulty: 1,
  module: 'I7',
  tracks: [
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum', frequency: 60 },
      initialVolume: -3,
      color: '#ef4444',
    },
    {
      id: 'snare',
      name: 'Snare',
      sourceConfig: { type: 'snare', frequency: 200 },
      initialVolume: -5,
      color: '#eab308',
    },
    {
      id: 'hihat',
      name: 'Hi-hat',
      sourceConfig: { type: 'hihat', frequency: 8000 },
      initialVolume: -8,
      color: '#22d3ee',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Compress the snare for punch and balance with the kick',
    conditions: [
      { type: 'track_compression', track: 'snare', minAmount: 30, maxAmount: 70 },
      { type: 'volume_balanced', track1: 'kick', track2: 'snare', tolerance: 3 },
    ],
  },
  controls: {
    eq: 'parametric',
    compressor: false,
    trackCompressor: true,
    volume: true,
  },
  hints: [
    'The snare is inconsistent — some hits are much louder than others',
    'Compress the snare around 40-50% to even out the hits while keeping punch',
    'Use volume to balance the kick and snare within 3 dB of each other',
  ],
};
