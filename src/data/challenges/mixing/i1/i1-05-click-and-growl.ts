/**
 * I1-05: Click and Growl
 * Using high frequencies to separate kick attack from bass tone
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i1-05-click-and-growl',
  title: 'Click and Growl',
  description:
    'Separation isn\'t just about the lows. The kick\'s beater click (2-5kHz) helps it cut through, while the bass\'s growl (800-1500Hz) gives it presence. Shape both for maximum clarity.',
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
      sourceConfig: { type: 'bass', frequency: 55 },
      color: '#3b82f6',
    },
  ],
  target: {
    type: 'multitrack-eq',
    tracks: {
      kick: { low: 0, mid: -2, high: 4 },
      bass: { low: -2, mid: 3, high: -2 },
    },
  },
  controls: {
    eq: true,
    compressor: false,
    volume: true,
  },
  hints: [
    'The kick\'s "click" lives in the high frequencies - boost for attack',
    'The bass\'s character comes from the mids - that\'s the "growl"',
    'Cut the kick mids slightly to avoid masking the bass',
  ],
};
