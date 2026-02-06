/**
 * M4-06: Complete Troubleshoot
 * Final challenge: diagnose and fix multiple mix problems
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'm4-06-complete-troubleshoot',
  title: 'Complete Troubleshoot',
  description:
    'Final challenge: this mix has multiple problems - muddy lows, harsh highs, poor balance, and no depth. Diagnose and fix everything to create a professional mix.',
  difficulty: 3,
  module: 'M4',
  tracks: [
    {
      id: 'vocal',
      name: 'Lead Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      initialVolume: -8,
      color: '#a855f7',
    },
    {
      id: 'kick',
      name: 'Kick',
      sourceConfig: { type: 'drum' },
      initialVolume: -2,
      color: '#ef4444',
    },
    {
      id: 'snare',
      name: 'Snare',
      sourceConfig: { type: 'snare' },
      initialVolume: 0,
      color: '#f97316',
    },
    {
      id: 'bass',
      name: 'Bass',
      sourceConfig: { type: 'bass', frequency: 55 },
      initialVolume: 2,
      initialPan: 0.2,
      color: '#3b82f6',
    },
    {
      id: 'guitar',
      name: 'Guitar',
      sourceConfig: { type: 'guitar', frequency: 330 },
      initialVolume: 0,
      color: '#22c55e',
    },
    {
      id: 'pad',
      name: 'Pad',
      sourceConfig: { type: 'pad', frequency: 220 },
      initialVolume: -2,
      color: '#eab308',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Fix all problems and create a professional mix',
    conditions: [
      { type: 'volume_louder', track1: 'vocal', track2: 'guitar' },
      { type: 'volume_louder', track1: 'vocal', track2: 'pad' },
      { type: 'volume_balanced', track1: 'kick', track2: 'bass', tolerance: 3 },
      { type: 'pan_position', track: 'vocal', position: 'center' },
      { type: 'pan_position', track: 'bass', position: 'center' },
      { type: 'frequency_separation', track1: 'kick', track2: 'bass', band: 'low' },
      { type: 'depth_placement', track: 'vocal', depth: 'front' },
      { type: 'depth_placement', track: 'pad', depth: 'back' },
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
    'Make the vocal the star - loud, centered, upfront',
    'Fix the low end - separate kick/bass, center the bass',
    'Create depth - vocal dry, pad wet',
    'Balance levels and use all your tools',
  ],
};
