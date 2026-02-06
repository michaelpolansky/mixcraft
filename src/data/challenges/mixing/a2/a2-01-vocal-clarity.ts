/**
 * A2-01: Vocal Clarity
 * Cut the mud and add presence to vocals
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a2-01-vocal-clarity',
  title: 'Vocal Clarity',
  description:
    'Vocals often have muddy low-mids that mask clarity. Cut the mud around 200-400Hz and boost presence in the upper-mids to help the vocal cut through.',
  difficulty: 1,
  module: 'A2',
  tracks: [
    {
      id: 'vocal',
      name: 'Lead Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      color: '#a855f7',
    },
    {
      id: 'pad',
      name: 'Backing Pad',
      sourceConfig: { type: 'pad', frequency: 220 },
      initialVolume: -6,
      color: '#22c55e',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Create vocal clarity by cutting mud and boosting presence',
    conditions: [
      { type: 'eq_cut', track: 'vocal', band: 'low', minCut: 2 },
      { type: 'eq_boost', track: 'vocal', band: 'mid', minBoost: 2 },
    ],
  },
  controls: {
    eq: true,
    compressor: false,
    volume: true,
    pan: false,
    reverb: false,
  },
  hints: [
    'Cut the low frequencies to remove muddiness',
    'Boost the mids to add presence and clarity',
    'The vocal should cut through the pad clearly',
  ],
};
