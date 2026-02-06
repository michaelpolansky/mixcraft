/**
 * A2-05: Vocal Space
 * Place the vocal in space with reverb
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a2-05-vocal-space',
  title: 'Vocal Space',
  description:
    'Reverb adds dimension to vocals, but too much pushes them back. Use subtle reverb to add space while keeping the vocal upfront and intimate.',
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
      id: 'pad',
      name: 'Pad',
      sourceConfig: { type: 'pad', frequency: 220 },
      initialVolume: -6,
      color: '#22c55e',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Add space to the vocal while keeping it upfront',
    conditions: [
      { type: 'depth_placement', track: 'vocal', depth: 'front' },
      { type: 'reverb_amount', track: 'vocal', minMix: 5, maxMix: 25 },
      { type: 'reverb_contrast', dryTrack: 'vocal', wetTrack: 'pad', minDifference: 20 },
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
    'The vocal needs just a touch of reverb',
    'Too much pushes it back in the mix',
    'The pad can be wetter to create contrast',
  ],
};
