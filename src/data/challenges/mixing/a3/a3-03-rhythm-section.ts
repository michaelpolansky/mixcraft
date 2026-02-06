/**
 * A3-03: Rhythm Section
 * Balance drums and bass as a unit
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a3-03-rhythm-section',
  title: 'Rhythm Section',
  description:
    'The rhythm section (drums + bass) is the backbone of the mix. These elements need to lock together tightly while providing a solid foundation for everything else.',
  difficulty: 2,
  module: 'A3',
  tracks: [
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      initialVolume: 0,
      color: '#ef4444',
    },
    {
      id: 'snare',
      name: 'Snare',
      sourceConfig: { type: 'snare' },
      initialVolume: -3,
      color: '#f97316',
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
    description: 'Lock the rhythm section together',
    conditions: [
      { type: 'volume_balanced', track1: 'kick', track2: 'bass', tolerance: 3 },
      { type: 'volume_balanced', track1: 'kick', track2: 'snare', tolerance: 3 },
      { type: 'frequency_separation', track1: 'kick', track2: 'bass', band: 'low' },
      { type: 'pan_position', track: 'kick', position: 'center' },
      { type: 'pan_position', track: 'bass', position: 'center' },
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
    'All three elements should be similar in level',
    'Separate kick and bass with EQ',
    'Keep the low end centered',
  ],
};
