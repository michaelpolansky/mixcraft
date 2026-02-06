/**
 * I3-02: Snare Crack
 * Making the snare snap and crack
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i3-02-snare-crack',
  title: 'Snare Crack',
  description:
    'The snare is getting lost in the mix. Boost the crack (around 2-4kHz) to make it snap through. Be careful not to make it too harsh - you want crack, not pain.',
  difficulty: 2,
  module: 'I3',
  tracks: [
    {
      id: 'snare',
      name: 'Snare',
      sourceConfig: { type: 'snare' },
      color: '#f97316', // orange
    },
    {
      id: 'guitar',
      name: 'Guitar',
      sourceConfig: { type: 'guitar', frequency: 330 },
      color: '#10b981',
    },
  ],
  target: {
    type: 'multitrack-eq',
    tracks: {
      snare: { low: 0, mid: 2, high: 4 },
      guitar: { low: 0, mid: 0, high: -2 },
    },
  },
  controls: {
    eq: true,
    compressor: false,
    volume: true,
  },
  hints: [
    'Snare crack lives in the mid-to-high frequency range',
    'Boost the snare highs for more stick attack and crack',
    'Cut some guitar highs to make room for the snare',
  ],
};
