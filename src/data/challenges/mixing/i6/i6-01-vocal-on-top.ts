/**
 * I6-01: Vocal on Top
 * The lead vocal should be the loudest element
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i6-01-vocal-on-top',
  title: 'Vocal on Top',
  description:
    'In most pop and rock music, the lead vocal should be the loudest element in the mix. Set the levels so the vocal sits clearly above the instruments.',
  difficulty: 1,
  module: 'I6',
  tracks: [
    {
      id: 'vocal',
      name: 'Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      initialVolume: -6,
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
      id: 'bass',
      name: 'Bass',
      sourceConfig: { type: 'bass', frequency: 55 },
      initialVolume: 0,
      color: '#3b82f6',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Make the vocal the loudest element',
    conditions: [
      { type: 'volume_louder', track1: 'vocal', track2: 'guitar' },
      { type: 'volume_louder', track1: 'vocal', track2: 'bass' },
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
    'The vocal should be the star of the show',
    'Turn up the vocal or turn down the instruments',
    'Most pop mixes have the vocal 2-4 dB louder than the next loudest element',
  ],
};
