/**
 * A3-08: Complete Instrument Balance
 * Master challenge: balance a full arrangement
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'a3-08-complete-instrument-balance',
  title: 'Complete Instrument Balance',
  description:
    'Final challenge: create a professional instrument balance. Every element should have its place - solid low end, clear midrange, and defined stereo field.',
  difficulty: 3,
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
    {
      id: 'guitar1',
      name: 'Guitar L',
      sourceConfig: { type: 'guitar', frequency: 330 },
      initialVolume: -6,
      initialPan: -0.7,
      color: '#eab308',
    },
    {
      id: 'guitar2',
      name: 'Guitar R',
      sourceConfig: { type: 'guitar', frequency: 330 },
      initialVolume: -6,
      initialPan: 0.7,
      color: '#fbbf24',
    },
    {
      id: 'keys',
      name: 'Keys',
      sourceConfig: { type: 'keys', frequency: 440 },
      initialVolume: -8,
      color: '#22c55e',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Create a professional instrument balance',
    conditions: [
      { type: 'volume_balanced', track1: 'kick', track2: 'bass', tolerance: 3 },
      { type: 'volume_balanced', track1: 'kick', track2: 'snare', tolerance: 3 },
      { type: 'pan_position', track: 'kick', position: 'center' },
      { type: 'pan_position', track: 'bass', position: 'center' },
      { type: 'pan_opposite', track1: 'guitar1', track2: 'guitar2' },
      { type: 'volume_balanced', track1: 'guitar1', track2: 'guitar2', tolerance: 2 },
      { type: 'volume_louder', track1: 'kick', track2: 'keys' },
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
    'Foundation: kick, snare, bass balanced and centered',
    'Pan guitars opposite for stereo width',
    'Keys should support, not dominate',
  ],
};
