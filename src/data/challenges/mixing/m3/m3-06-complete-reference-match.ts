/**
 * M3-06: Complete Reference Match
 * Match all aspects of a professional reference
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'm3-06-complete-reference-match',
  title: 'Complete Reference Match',
  description:
    'Final challenge: match a professional reference in every way - frequency balance, dynamics, width, depth. Create a release-ready mix.',
  difficulty: 3,
  module: 'M3',
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
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Match a professional reference completely',
    conditions: [
      { type: 'volume_louder', track1: 'vocal', track2: 'guitarL' },
      { type: 'volume_balanced', track1: 'kick', track2: 'bass', tolerance: 3 },
      { type: 'pan_position', track: 'vocal', position: 'center' },
      { type: 'pan_position', track: 'kick', position: 'center' },
      { type: 'pan_opposite', track1: 'guitarL', track2: 'guitarR' },
      { type: 'depth_placement', track: 'vocal', depth: 'front' },
      { type: 'eq_boost', track: 'vocal', band: 'mid', minBoost: 1 },
      { type: 'bus_compression', minAmount: 10, maxAmount: 40 },
      { type: 'bus_eq_boost', band: 'high', minBoost: 1 },
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
    'Balance: vocal on top, rhythm section solid',
    'Width: guitars panned, foundation centered',
    'Depth: vocal dry and upfront',
    'Polish: bus compression and high EQ',
  ],
};
