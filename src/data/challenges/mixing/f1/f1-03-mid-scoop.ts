/**
 * F1-03: Mid Scoop
 * Introduction to cutting midrange frequencies
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'f1-03-mid-scoop',
  title: 'Mid Scoop',
  description: 'Create a "scooped" sound by cutting the mids. This creates space between the bass and treble - a classic metal guitar tone technique.',
  difficulty: 1,
  module: 'F1',
  sourceConfig: {
    type: 'bass',
    frequency: 80,
  },
  target: {
    type: 'eq',
    low: 0,
    mid: -6,
    high: 0,
  },
  controls: {
    eq: true,
    compressor: false,
  },
  hints: [
    'The mid band is centered around 1kHz',
    'Scooping the mids creates a "hollow" sound',
    'Cut the mids by about 6 dB',
  ],
};
