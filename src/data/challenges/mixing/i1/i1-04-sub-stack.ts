/**
 * I1-04: Sub Stack
 * Managing sub-bass frequencies between kick and bass
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i1-04-sub-stack',
  title: 'Sub Stack',
  description:
    'Both the kick and bass have strong sub frequencies (below 60Hz) that are causing rumble. Decide which element should own the sub frequencies and cut the other. In most mixes, either the kick or bass dominates the subs - rarely both.',
  difficulty: 2,
  module: 'I1',
  tracks: [
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      color: '#ef4444',
    },
    {
      id: 'bass',
      name: 'Bass',
      sourceConfig: { type: 'bass', frequency: 40 },
      color: '#3b82f6',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'One element owns the subs, the other stays above',
    conditions: [
      { type: 'frequency_separation', track1: 'kick', track2: 'bass', band: 'low' },
      { type: 'relative_level', louder: 'bass', quieter: 'kick', band: 'low' },
    ],
  },
  controls: {
    eq: true,
    compressor: false,
    volume: true,
  },
  hints: [
    'Sub bass (below 60Hz) should usually come from one source only',
    'For this challenge, let the bass own the sub frequencies',
    'Cut the kick\'s low band to remove its sub content',
  ],
};
