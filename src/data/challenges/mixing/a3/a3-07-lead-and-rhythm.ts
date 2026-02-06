/**
 * A3-07: Lead & Rhythm Separation
 * Separate lead and rhythm instruments
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a3-07-lead-and-rhythm',
  title: 'Lead & Rhythm Separation',
  description:
    'Lead instruments need to stand out while rhythm parts provide the foundation. Use volume, panning, and depth to create clear separation between lead and rhythm.',
  difficulty: 3,
  module: 'A3',
  tracks: [
    {
      id: 'leadGuitar',
      name: 'Lead Guitar',
      sourceConfig: { type: 'guitar', frequency: 440 },
      initialVolume: -4,
      color: '#f97316',
    },
    {
      id: 'rhythmGuitar',
      name: 'Rhythm Guitar',
      sourceConfig: { type: 'guitar', frequency: 330 },
      initialVolume: 0,
      initialPan: 0.5,
      color: '#fb923c',
    },
    {
      id: 'bass',
      name: 'Bass',
      sourceConfig: { type: 'bass', frequency: 55 },
      initialVolume: -2,
      color: '#3b82f6',
    },
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      initialVolume: 0,
      color: '#ef4444',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Separate lead from rhythm parts',
    conditions: [
      { type: 'volume_louder', track1: 'leadGuitar', track2: 'rhythmGuitar' },
      { type: 'pan_position', track: 'leadGuitar', position: 'center' },
      { type: 'depth_placement', track: 'leadGuitar', depth: 'front' },
      { type: 'depth_placement', track: 'rhythmGuitar', depth: 'middle' },
      { type: 'pan_position', track: 'bass', position: 'center' },
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
    'Lead should be louder and centered',
    'Keep the lead dry and upfront',
    'Push rhythm back with subtle reverb',
  ],
};
