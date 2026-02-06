/**
 * I5-06: Three-Dimensional Mix
 * Create a complete 3D soundstage with width and depth
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i5-06-three-dimensional-mix',
  title: 'Three-Dimensional Mix',
  description:
    'Final challenge: combine stereo width (panning) with depth (reverb) to create a full three-dimensional soundstage. Vocal centered and upfront, guitars wide and mid-depth, pad wide and in the back.',
  difficulty: 3,
  module: 'I5',
  tracks: [
    {
      id: 'vocal',
      name: 'Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      color: '#a855f7',
    },
    {
      id: 'guitar_l',
      name: 'Guitar L',
      sourceConfig: { type: 'guitar', frequency: 330 },
      color: '#f97316',
    },
    {
      id: 'guitar_r',
      name: 'Guitar R',
      sourceConfig: { type: 'guitar', frequency: 329 },
      color: '#eab308',
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
    description: 'Create a 3D soundstage with width and depth',
    conditions: [
      { type: 'pan_position', track: 'vocal', position: 'center' },
      { type: 'depth_placement', track: 'vocal', depth: 'front' },
      { type: 'pan_opposite', track1: 'guitar_l', track2: 'guitar_r' },
      { type: 'depth_placement', track: 'guitar_l', depth: 'middle' },
      { type: 'depth_placement', track: 'pad', depth: 'back' },
    ],
  },
  controls: {
    eq: false,
    compressor: false,
    volume: true,
    pan: true,
    reverb: true,
  },
  hints: [
    'Vocal: centered and dry for maximum presence',
    'Guitars: panned wide with medium reverb for mid-depth',
    'Pad: can be wide or centered, but pushed back with heavy reverb',
  ],
};
