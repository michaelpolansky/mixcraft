/**
 * M1-03: Rhythm Section Lock
 * Get the full rhythm section working together
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'm1-03-rhythm-section-lock',
  title: 'Rhythm Section Lock',
  description:
    'The rhythm section is the engine of your mix. Drums and bass should feel locked together - tight, punchy, and driving.',
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
      id: 'snare',
      name: 'Snare',
      sourceConfig: { type: 'snare' },
      initialVolume: -2,
      color: '#f97316',
    },
    {
      id: 'hihat',
      name: 'Hi-Hat',
      sourceConfig: { type: 'hihat' },
      initialVolume: -8,
      color: '#eab308',
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
      { type: 'volume_balanced', track1: 'kick', track2: 'snare', tolerance: 3 },
      { type: 'volume_balanced', track1: 'kick', track2: 'bass', tolerance: 3 },
      { type: 'volume_louder', track1: 'kick', track2: 'hihat' },
      { type: 'frequency_separation', track1: 'kick', track2: 'bass', band: 'low' },
      { type: 'pan_position', track: 'bass', position: 'center' },
    ],
  },
  controls: {
    eq: true,
    compressor: 'simple',
    volume: true,
    pan: true,
    reverb: false,
  },
  hints: [
    'Kick, snare, and bass should be balanced',
    'Hi-hat sits below the main elements',
    'Carve EQ space between kick and bass',
  ],
};
