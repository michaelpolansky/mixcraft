/**
 * A1-04: Drum Bus Glue
 * Use bus compression to glue the kit together
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a1-04-drum-bus-glue',
  title: 'Drum Bus Glue',
  description:
    'Bus compression makes the drum kit feel like one instrument instead of separate pieces. Apply gentle compression to glue the elements together while keeping the punch.',
  difficulty: 2,
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
    description: 'Apply bus compression to glue the kit',
    conditions: [
      { type: 'volume_balanced', track1: 'kick', track2: 'snare', tolerance: 4 },
      { type: 'volume_louder', track1: 'kick', track2: 'hihat' },
    ],
  },
  controls: {
    eq: false,
    compressor: 'simple',
    volume: true,
    pan: false,
    reverb: false,
  },
  hints: [
    'Set the bus compressor threshold to catch the loudest hits',
    'Use moderate compression amount - too much kills the punch',
    'You should hear the kit "breathe" as one unit',
  ],
};
