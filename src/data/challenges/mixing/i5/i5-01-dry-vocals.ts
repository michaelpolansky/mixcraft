/**
 * I5-01: Dry Vocals
 * Keep the lead vocal upfront and dry
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i5-01-dry-vocals',
  title: 'Dry Vocals',
  description:
    'The lead vocal should feel intimate and present - right in front of you. Too much reverb pushes it back in the mix. Learn to keep vocals dry for an upfront, powerful sound.',
  difficulty: 1,
  module: 'I5',
  tracks: [
    {
      id: 'vocal',
      name: 'Lead Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      color: '#a855f7',
    },
    {
      id: 'pad',
      name: 'Pad',
      sourceConfig: { type: 'pad', frequency: 220 },
      color: '#22c55e',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Keep the vocal upfront with minimal reverb',
    conditions: [
      { type: 'depth_placement', track: 'vocal', depth: 'front' },
      { type: 'reverb_amount', track: 'pad', minMix: 30 },
    ],
  },
  controls: {
    eq: false,
    compressor: false,
    volume: true,
    pan: false,
    reverb: true,
  },
  hints: [
    'Lead vocals should be dry (low reverb) to feel present and close',
    'The pad can have more reverb to sit behind the vocal',
    'Front = dry, Back = wet',
  ],
};
