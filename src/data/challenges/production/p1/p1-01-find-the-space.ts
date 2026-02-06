/**
 * P1-01: Find the Space
 * Learn to balance kick, bass, and pad in their frequency ranges
 */

import type { ProductionChallenge } from '../../../../core/types.ts';

export const challenge: ProductionChallenge = {
  id: 'p1-01-find-the-space',
  title: 'Find the Space',
  description: 'Balance a kick, bass, and pad so each sound has its own space. The kick provides the punch, bass provides the low end, and pad fills the highs.',
  difficulty: 1,
  module: 'P1',
  layers: [
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      initialVolume: -6,
    },
    {
      id: 'bass',
      name: 'Bass',
      sourceConfig: { type: 'bass', frequency: 60 },
      initialVolume: -6,
    },
    {
      id: 'pad',
      name: 'Pad',
      sourceConfig: { type: 'pad', frequency: 220 },
      initialVolume: -6,
    },
  ],
  target: {
    type: 'reference',
    layers: [
      { volume: -3, muted: false },
      { volume: -6, muted: false },
      { volume: -9, muted: false },
    ],
  },
  availableControls: {
    volume: true,
    mute: true,
    pan: false,
    eq: false,
  },
  hints: [
    'The kick should be the loudest element',
    'The pad sits behind the rhythm section',
    'Try soloing each element to hear it clearly',
  ],
};
