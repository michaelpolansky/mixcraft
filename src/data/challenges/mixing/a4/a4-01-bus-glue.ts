/**
 * A4-01: Bus Glue
 * Use gentle compression to glue the mix together
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a4-01-bus-glue',
  title: 'Bus Glue',
  description:
    'A mix bus compressor gently "glues" all elements together, making them feel like one cohesive piece rather than separate tracks. Use subtle compression to unify the mix.',
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
      color: '#22c55e',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Apply gentle bus compression for cohesion',
    conditions: [
      { type: 'bus_compression', minAmount: 10, maxAmount: 40 },
      { type: 'volume_balanced', track1: 'kick', track2: 'snare', tolerance: 3 },
      { type: 'volume_balanced', track1: 'kick', track2: 'bass', tolerance: 3 },
    ],
  },
  controls: {
    eq: false,
    compressor: 'simple',
    volume: true,
    pan: false,
    reverb: false,
    busCompressor: true,
  },
  hints: [
    'Bus compression should be subtle - 1-3dB of gain reduction',
    'Too much compression squashes the dynamics',
    'Balance the tracks before compressing the bus',
  ],
};
