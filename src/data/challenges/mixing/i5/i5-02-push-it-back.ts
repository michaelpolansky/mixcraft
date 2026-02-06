/**
 * I5-02: Push It Back
 * Use reverb to push a pad to the background
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i5-02-push-it-back',
  title: 'Push It Back',
  description:
    'Reverb creates distance. The more reverb, the further away something sounds. Push the pad to the back of the mix by adding reverb while keeping the keys upfront.',
  difficulty: 1,
  module: 'I5',
  tracks: [
    {
      id: 'keys',
      name: 'Keys',
      sourceConfig: { type: 'keys', frequency: 440 },
      color: '#3b82f6',
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
    description: 'Create depth by pushing the pad back with reverb',
    conditions: [
      { type: 'depth_placement', track: 'keys', depth: 'front' },
      { type: 'depth_placement', track: 'pad', depth: 'back' },
      { type: 'reverb_contrast', dryTrack: 'keys', wetTrack: 'pad', minDifference: 30 },
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
    'More reverb = further away in the soundstage',
    'Keep the keys dry for a close, present sound',
    'Push the pad back by adding significant reverb',
  ],
};
