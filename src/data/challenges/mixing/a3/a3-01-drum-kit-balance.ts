/**
 * A3-01: Drum Kit Balance
 * Balance the elements of a drum kit
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a3-01-drum-kit-balance',
  title: 'Drum Kit Balance',
  description:
    'A balanced drum kit is the foundation of any mix. The kick provides punch, snare provides backbeat, and hi-hat adds rhythm. Balance these three elements so they work as one.',
  difficulty: 2,
  module: 'A3',
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
      initialVolume: -6,
      color: '#f97316',
    },
    {
      id: 'hihat',
      name: 'Hi-Hat',
      sourceConfig: { type: 'hihat' },
      initialVolume: -3,
      color: '#eab308',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Balance the drum kit elements',
    conditions: [
      { type: 'volume_balanced', track1: 'kick', track2: 'snare', tolerance: 3 },
      { type: 'volume_louder', track1: 'kick', track2: 'hihat' },
      { type: 'pan_position', track: 'kick', position: 'center' },
      { type: 'pan_position', track: 'snare', position: 'center' },
    ],
  },
  controls: {
    eq: false,
    compressor: false,
    volume: true,
    pan: true,
    reverb: false,
  },
  hints: [
    'Kick and snare should be similar in level',
    'Hi-hat sits below the kick',
    'Keep kick and snare centered',
  ],
};
