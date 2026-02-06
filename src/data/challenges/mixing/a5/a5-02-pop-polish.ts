/**
 * A5-02: Pop Polish
 * Create a polished pop mix
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a5-02-pop-polish',
  title: 'Pop Polish',
  description:
    'Pop mixes are bright, polished, and vocal-forward. The lead vocal dominates, everything sparkles, and the mix sounds clean and commercial.',
  difficulty: 2,
  module: 'A5',
  tracks: [
    {
      id: 'vocal',
      name: 'Lead Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      initialVolume: -4,
      color: '#a855f7',
    },
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      initialVolume: 0,
      color: '#ef4444',
    },
    {
      id: 'synth',
      name: 'Synth',
      sourceConfig: { type: 'keys', frequency: 440 },
      initialVolume: -4,
      color: '#22c55e',
    },
    {
      id: 'pad',
      name: 'Pad',
      sourceConfig: { type: 'pad', frequency: 220 },
      initialVolume: -8,
      color: '#3b82f6',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Create a bright, vocal-forward pop mix',
    conditions: [
      { type: 'volume_louder', track1: 'vocal', track2: 'synth' },
      { type: 'volume_louder', track1: 'vocal', track2: 'pad' },
      { type: 'eq_boost', track: 'vocal', band: 'high', minBoost: 2 },
      { type: 'pan_position', track: 'vocal', position: 'center' },
      { type: 'depth_placement', track: 'vocal', depth: 'front' },
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
    'The vocal must be the loudest element',
    'Boost vocal highs for air and presence',
    'Keep the vocal dry and upfront',
  ],
};
