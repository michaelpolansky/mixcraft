/**
 * A3-04: Guitar Stacking
 * Balance multiple guitar parts
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a3-04-guitar-stacking',
  title: 'Guitar Stacking',
  description:
    'Multiple guitars can create a huge sound, but they can also turn into mud. Use panning and EQ to give each guitar its own space while maintaining a cohesive wall of sound.',
  difficulty: 2,
  module: 'A3',
  tracks: [
    {
      id: 'guitar1',
      name: 'Guitar L',
      sourceConfig: { type: 'guitar', frequency: 330 },
      initialVolume: 0,
      initialPan: -0.5,
      color: '#f97316',
    },
    {
      id: 'guitar2',
      name: 'Guitar R',
      sourceConfig: { type: 'guitar', frequency: 330 },
      initialVolume: 0,
      initialPan: 0.5,
      color: '#fb923c',
    },
    {
      id: 'guitar3',
      name: 'Lead Guitar',
      sourceConfig: { type: 'guitar', frequency: 440 },
      initialVolume: -3,
      color: '#fdba74',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Create a cohesive multi-guitar arrangement',
    conditions: [
      { type: 'pan_opposite', track1: 'guitar1', track2: 'guitar2' },
      { type: 'pan_position', track: 'guitar3', position: 'center' },
      { type: 'volume_balanced', track1: 'guitar1', track2: 'guitar2', tolerance: 2 },
      { type: 'volume_louder', track1: 'guitar3', track2: 'guitar1' },
    ],
  },
  controls: {
    eq: true,
    compressor: false,
    volume: true,
    pan: true,
    reverb: false,
  },
  hints: [
    'Pan rhythm guitars opposite for width',
    'Keep the lead centered and louder',
    'Balance the rhythm guitars equally',
  ],
};
