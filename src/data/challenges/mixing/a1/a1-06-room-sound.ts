/**
 * A1-06: Room Sound
 * Add cohesive room reverb to the drum kit
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a1-06-room-sound',
  title: 'Room Sound',
  description:
    'A touch of room reverb makes drums sound natural and alive. Add subtle reverb to create cohesion, but keep kick tight and snare punchy.',
  difficulty: 2,
  module: 'A1',
  tracks: [
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      color: '#ef4444',
    },
    {
      id: 'snare',
      name: 'Snare',
      sourceConfig: { type: 'snare' },
      color: '#f97316',
    },
    {
      id: 'hihat',
      name: 'Hi-Hat',
      sourceConfig: { type: 'hihat' },
      color: '#eab308',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Add natural room reverb to the kit',
    conditions: [
      { type: 'reverb_amount', track: 'kick', minMix: 5, maxMix: 20 },
      { type: 'reverb_amount', track: 'snare', minMix: 15, maxMix: 40 },
      { type: 'reverb_contrast', dryTrack: 'kick', wetTrack: 'snare', minDifference: 10 },
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
    'Kick needs very little reverb to stay punchy',
    'Snare can have more reverb for body and sustain',
    'The difference in reverb amounts creates depth',
  ],
};
