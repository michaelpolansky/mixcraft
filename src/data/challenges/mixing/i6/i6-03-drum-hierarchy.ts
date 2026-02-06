/**
 * I6-03: Drum Hierarchy
 * Set proper level relationships within the drum kit
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i6-03-drum-hierarchy',
  title: 'Drum Hierarchy',
  description:
    'In most music, the kick and snare are the loudest drum elements, followed by hi-hats. Create the proper level hierarchy within the kit.',
  difficulty: 2,
  module: 'I6',
  tracks: [
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      initialVolume: -6,
      color: '#ef4444',
    },
    {
      id: 'snare',
      name: 'Snare',
      sourceConfig: { type: 'snare' },
      initialVolume: -6,
      color: '#f97316',
    },
    {
      id: 'hihat',
      name: 'Hi-Hat',
      sourceConfig: { type: 'hihat' },
      initialVolume: 0,
      color: '#eab308',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Create proper drum level hierarchy',
    conditions: [
      { type: 'volume_louder', track1: 'kick', track2: 'hihat' },
      { type: 'volume_louder', track1: 'snare', track2: 'hihat' },
      { type: 'volume_balanced', track1: 'kick', track2: 'snare', tolerance: 3 },
    ],
  },
  controls: {
    eq: false,
    compressor: false,
    volume: true,
    pan: false,
    reverb: false,
  },
  hints: [
    'Kick and snare should be similarly loud',
    'Hi-hats should be supporting, not dominating',
    'Turn down the hi-hat to let kick and snare shine',
  ],
};
