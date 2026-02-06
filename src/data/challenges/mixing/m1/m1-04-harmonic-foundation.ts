/**
 * M1-04: Harmonic Foundation
 * Add guitars and keys to support the rhythm
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'm1-04-harmonic-foundation',
  title: 'Harmonic Foundation',
  description:
    'With the rhythm section solid, add harmonic elements. Guitars and keys fill the midrange and create width - pan them to avoid congestion.',
  difficulty: 2,
  module: 'M1',
  tracks: [
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
      initialVolume: -6,
      initialPan: 0.3,
      color: '#22c55e',
    },
    {
      id: 'keys',
      name: 'Keys',
      sourceConfig: { type: 'keys', frequency: 440 },
      initialVolume: -6,
      initialPan: -0.3,
      color: '#a855f7',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Add harmonic elements with width',
    conditions: [
      { type: 'pan_opposite', track1: 'guitar', track2: 'keys' },
      { type: 'volume_balanced', track1: 'guitar', track2: 'keys', tolerance: 3 },
      { type: 'volume_louder', track1: 'kick', track2: 'guitar' },
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
    'Pan guitar and keys opposite',
    'Keep them below the rhythm section',
    'Foundation stays centered',
  ],
};
