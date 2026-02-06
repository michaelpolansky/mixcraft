/**
 * I6-04: Lead and Rhythm
 * Balance lead and rhythm elements
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i6-04-lead-and-rhythm',
  title: 'Lead and Rhythm',
  description:
    'Lead elements should be featured, rhythm elements should support. Balance the mix so the vocal leads, with guitar and keys providing harmonic support.',
  difficulty: 2,
  module: 'I6',
  tracks: [
    {
      id: 'vocal',
      name: 'Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      initialVolume: -3,
      color: '#a855f7',
    },
    {
      id: 'guitar',
      name: 'Guitar',
      sourceConfig: { type: 'guitar', frequency: 330 },
      initialVolume: 0,
      color: '#f97316',
    },
    {
      id: 'keys',
      name: 'Keys',
      sourceConfig: { type: 'keys', frequency: 440 },
      initialVolume: 0,
      color: '#22c55e',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Balance lead above rhythm elements',
    conditions: [
      { type: 'volume_louder', track1: 'vocal', track2: 'guitar' },
      { type: 'volume_louder', track1: 'vocal', track2: 'keys' },
      { type: 'volume_balanced', track1: 'guitar', track2: 'keys', tolerance: 4 },
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
    'Vocal is the lead - it should be the loudest',
    'Guitar and keys are rhythm/harmony - they support',
    'Keep the rhythm elements balanced with each other',
  ],
};
