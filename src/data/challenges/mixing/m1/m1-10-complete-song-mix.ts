/**
 * M1-10: Complete Song Mix
 * Master challenge: mix a complete song
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'm1-10-complete-song-mix',
  title: 'Complete Song Mix',
  description:
    'Final challenge: create a professional mix from scratch. Apply everything you\'ve learned - EQ, compression, panning, reverb, depth, and bus processing.',
  difficulty: 3,
  module: 'M1',
  tracks: [
    {
      id: 'vocal',
      name: 'Lead Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      initialVolume: -6,
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
      initialVolume: -4,
      color: '#f97316',
    },
    {
      id: 'bass',
      name: 'Bass',
      sourceConfig: { type: 'bass', frequency: 55 },
      initialVolume: -3,
      color: '#3b82f6',
    },
    {
      id: 'guitarL',
      name: 'Guitar L',
      sourceConfig: { type: 'guitar', frequency: 330 },
      initialVolume: -6,
      initialPan: -0.3,
      color: '#22c55e',
    },
    {
      id: 'guitarR',
      name: 'Guitar R',
      sourceConfig: { type: 'guitar', frequency: 330 },
      initialVolume: -6,
      initialPan: 0.3,
      color: '#10b981',
    },
    {
      id: 'keys',
      name: 'Keys',
      sourceConfig: { type: 'keys', frequency: 440 },
      initialVolume: -8,
      color: '#eab308',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Create a complete professional mix',
    conditions: [
      { type: 'volume_louder', track1: 'vocal', track2: 'guitarL' },
      { type: 'volume_louder', track1: 'vocal', track2: 'keys' },
      { type: 'volume_balanced', track1: 'kick', track2: 'bass', tolerance: 3 },
      { type: 'volume_balanced', track1: 'guitarL', track2: 'guitarR', tolerance: 2 },
      { type: 'pan_position', track: 'vocal', position: 'center' },
      { type: 'pan_position', track: 'kick', position: 'center' },
      { type: 'pan_position', track: 'bass', position: 'center' },
      { type: 'pan_opposite', track1: 'guitarL', track2: 'guitarR' },
      { type: 'depth_placement', track: 'vocal', depth: 'front' },
      { type: 'eq_boost', track: 'vocal', band: 'mid', minBoost: 1 },
    ],
  },
  controls: {
    eq: true,
    compressor: 'simple',
    volume: true,
    pan: true,
    reverb: true,
    busCompressor: true,
    busEQ: true,
  },
  hints: [
    'Start with rhythm section balance',
    'Make the vocal the star',
    'Create width with panned guitars',
    'Keep the vocal dry and upfront',
  ],
};
