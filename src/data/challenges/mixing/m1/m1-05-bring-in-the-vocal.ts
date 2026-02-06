/**
 * M1-05: Bring in the Vocal
 * Add the lead vocal as the focal point
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'm1-05-bring-in-the-vocal',
  title: 'Bring in the Vocal',
  description:
    'The vocal is the star. Bring it in loud and clear, sitting on top of the mix. EQ for presence, keep it centered and upfront.',
  difficulty: 2,
  module: 'M1',
  tracks: [
    {
      id: 'vocal',
      name: 'Lead Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      initialVolume: -6,
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
      id: 'bass',
      name: 'Bass',
      sourceConfig: { type: 'bass', frequency: 55 },
      initialVolume: -2,
      color: '#3b82f6',
    },
    {
      id: 'guitar',
      name: 'Guitar',
      sourceConfig: { type: 'guitar', frequency: 330 },
      initialVolume: -4,
      color: '#22c55e',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Make the vocal the focal point',
    conditions: [
      { type: 'volume_louder', track1: 'vocal', track2: 'guitar' },
      { type: 'volume_louder', track1: 'vocal', track2: 'bass' },
      { type: 'eq_boost', track: 'vocal', band: 'mid', minBoost: 1 },
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
    'Vocal must be the loudest element',
    'Boost mids for presence',
    'Keep it dry and upfront',
  ],
};
