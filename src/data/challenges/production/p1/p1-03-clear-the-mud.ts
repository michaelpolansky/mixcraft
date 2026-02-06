/**
 * P1-03: Clear the Mud
 * Reduce low-end buildup by balancing or muting
 */

import type { ProductionChallenge } from '../../../../core/types.ts';

export const challenge: ProductionChallenge = {
  id: 'p1-03-clear-the-mud',
  title: 'Clear the Mud',
  description: 'Too much low end makes a mix muddy. Balance these three bass-heavy elements so the low end is powerful but clear.',
  difficulty: 2,
  module: 'P1',
  layers: [
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      initialVolume: 0,
    },
    {
      id: 'bass',
      name: 'Bass',
      sourceConfig: { type: 'bass', frequency: 55 },
      initialVolume: 0,
    },
    {
      id: 'low-pad',
      name: 'Low Pad',
      sourceConfig: { type: 'pad', frequency: 110 },
      initialVolume: 0,
    },
  ],
  target: {
    type: 'reference',
    layers: [
      { volume: -3, muted: false },
      { volume: -9, muted: false },
      { volume: -15, muted: false },
    ],
  },
  availableControls: {
    volume: true,
    mute: true,
    pan: false,
    eq: false,
  },
  hints: [
    'All three elements are too loud in the low end',
    'The kick needs punch, bass needs weight, pad needs to stay back',
    'Volume differences create clarity in a mix',
  ],
};
