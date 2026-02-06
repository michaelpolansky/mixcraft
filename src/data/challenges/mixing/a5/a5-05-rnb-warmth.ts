/**
 * A5-05: R&B Warmth
 * Create a warm, smooth R&B mix
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a5-05-rnb-warmth',
  title: 'R&B Warmth',
  description:
    'R&B mixes are warm, smooth, and intimate. The vocal is upfront and personal, with lush pads and a smooth low end. Create that silky R&B sound.',
  difficulty: 2,
  module: 'A5',
  tracks: [
    {
      id: 'vocal',
      name: 'Lead Vocal',
      sourceConfig: { type: 'vocal', frequency: 200 },
      initialVolume: -2,
      color: '#a855f7',
    },
    {
      id: 'pad',
      name: 'Pad',
      sourceConfig: { type: 'pad', frequency: 220 },
      initialVolume: -6,
      color: '#22c55e',
    },
    {
      id: 'bass',
      name: 'Bass',
      sourceConfig: { type: 'bass', frequency: 55 },
      initialVolume: -4,
      color: '#3b82f6',
    },
    {
      id: 'keys',
      name: 'Keys',
      sourceConfig: { type: 'keys', frequency: 330 },
      initialVolume: -6,
      color: '#f97316',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Create a warm, intimate R&B mix',
    conditions: [
      { type: 'eq_boost', track: 'vocal', band: 'low', minBoost: 1 },
      { type: 'eq_cut', track: 'vocal', band: 'high', minCut: 1 },
      { type: 'volume_louder', track1: 'vocal', track2: 'pad' },
      { type: 'depth_placement', track: 'vocal', depth: 'front' },
      { type: 'depth_placement', track: 'pad', depth: 'back' },
    ],
  },
  controls: {
    eq: true,
    compressor: 'simple',
    volume: true,
    pan: true,
    reverb: true,
  },
  hints: [
    'Boost vocal lows for warmth',
    'Gentle high cut removes harshness',
    'Keep the vocal intimate and upfront',
  ],
};
