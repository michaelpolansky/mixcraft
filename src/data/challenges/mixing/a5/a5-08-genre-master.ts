/**
 * A5-08: Genre Master
 * Apply genre-appropriate mixing to a full arrangement
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a5-08-genre-master',
  title: 'Genre Master',
  description:
    'Final challenge: create a professional mix using all the genre-appropriate techniques. Balance the elements, shape the tone, create width and depth.',
  difficulty: 3,
  module: 'A5',
  tracks: [
    {
      id: 'vocal',
      name: 'Lead Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      initialVolume: -4,
      color: '#a855f7',
    },
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
    {
      id: 'guitarL',
      name: 'Guitar L',
      sourceConfig: { type: 'guitar', frequency: 330 },
      initialVolume: -6,
      initialPan: -0.5,
      color: '#22c55e',
    },
    {
      id: 'guitarR',
      name: 'Guitar R',
      sourceConfig: { type: 'guitar', frequency: 330 },
      initialVolume: -6,
      initialPan: 0.5,
      color: '#10b981',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Create a professional genre-appropriate mix',
    conditions: [
      { type: 'volume_louder', track1: 'vocal', track2: 'guitarL' },
      { type: 'volume_louder', track1: 'vocal', track2: 'guitarR' },
      { type: 'pan_position', track: 'vocal', position: 'center' },
      { type: 'pan_opposite', track1: 'guitarL', track2: 'guitarR' },
      { type: 'volume_balanced', track1: 'kick', track2: 'bass', tolerance: 3 },
      { type: 'eq_boost', track: 'vocal', band: 'mid', minBoost: 1 },
      { type: 'depth_placement', track: 'vocal', depth: 'front' },
    ],
  },
  controls: {
    eq: true,
    compressor: 'simple',
    volume: true,
    pan: true,
    reverb: true,
  },
  hints: [
    'Vocal is the star - make it loud and upfront',
    'Pan guitars for width',
    'Boost vocal mids for presence',
  ],
};
