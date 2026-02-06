/**
 * M2-02: Glue Compression
 * Apply mastering compression for cohesion
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'm2-02-glue-compression',
  title: 'Glue Compression',
  description:
    'Mastering compression glues all elements together, making separate tracks feel like one cohesive piece. Use gentle settings - 1-3dB of gain reduction.',
  difficulty: 2,
  module: 'M2',
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
    description: 'Apply gentle mastering compression',
    conditions: [
      { type: 'bus_compression', minAmount: 15, maxAmount: 40 },
      { type: 'volume_balanced', track1: 'kick', track2: 'snare', tolerance: 3 },
      { type: 'volume_balanced', track1: 'kick', track2: 'bass', tolerance: 3 },
    ],
  },
  controls: {
    eq: false,
    compressor: false,
    volume: true,
    pan: false,
    reverb: false,
    busCompressor: true,
  },
  hints: [
    'Mastering compression is subtle',
    'Too much squashes the dynamics',
    'Balance the mix before compressing',
  ],
};
