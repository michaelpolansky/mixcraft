/**
 * A3-05: Keys & Pads
 * Balance keyboard and pad layers
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a3-05-keys-and-pads',
  title: 'Keys & Pads',
  description:
    'Keys provide harmonic foundation while pads add atmosphere. These elements should support without overwhelming. Keep them spacious and balanced.',
  difficulty: 2,
  module: 'A3',
  tracks: [
    {
      id: 'keys',
      name: 'Keys',
      sourceConfig: { type: 'keys', frequency: 440 },
      initialVolume: 0,
      color: '#22c55e',
    },
    {
      id: 'pad',
      name: 'Pad',
      sourceConfig: { type: 'pad', frequency: 220 },
      initialVolume: 0,
      color: '#10b981',
    },
    {
      id: 'bass',
      name: 'Bass',
      sourceConfig: { type: 'bass', frequency: 55 },
      initialVolume: -2,
      color: '#3b82f6',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Balance keys and pads with the bass',
    conditions: [
      { type: 'depth_placement', track: 'pad', depth: 'back' },
      { type: 'depth_placement', track: 'keys', depth: 'front' },
      { type: 'volume_louder', track1: 'keys', track2: 'pad' },
      { type: 'frequency_separation', track1: 'keys', track2: 'bass', band: 'low' },
    ],
  },
  controls: {
    eq: true,
    compressor: false,
    volume: true,
    pan: true,
    reverb: true,
  },
  hints: [
    'Push the pad back with reverb',
    'Keep the keys dry and upfront',
    'Cut lows from keys to avoid bass conflict',
  ],
};
