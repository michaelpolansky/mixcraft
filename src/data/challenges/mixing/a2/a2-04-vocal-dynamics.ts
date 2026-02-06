/**
 * A2-04: Vocal Dynamics
 * Control vocal dynamics with compression
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a2-04-vocal-dynamics',
  title: 'Vocal Dynamics',
  description:
    'Vocals have wide dynamic range - quiet verses and loud choruses. Compression evens out the dynamics so every word is heard. Find the balance between control and natural feel.',
  difficulty: 2,
  module: 'A2',
  tracks: [
    {
      id: 'vocal',
      name: 'Lead Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      color: '#a855f7',
    },
    {
      id: 'bass',
      name: 'Bass',
      sourceConfig: { type: 'bass', frequency: 55 },
      initialVolume: -3,
      color: '#3b82f6',
    },
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      initialVolume: -3,
      color: '#ef4444',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Control vocal dynamics to sit in the mix',
    conditions: [
      { type: 'volume_louder', track1: 'vocal', track2: 'bass' },
      { type: 'volume_louder', track1: 'vocal', track2: 'kick' },
    ],
  },
  controls: {
    eq: false,
    compressor: 'simple',
    volume: true,
    pan: false,
    reverb: false,
  },
  hints: [
    'Use bus compression to glue the vocal to the track',
    'The vocal should sit on top consistently',
    'Too much compression sounds unnatural',
  ],
};
