/**
 * I2-06: Lead Vocal Mix
 * Complete vocal presence challenge
 */

import type { MixingChallenge } from '../../../../core/types.ts';

export const challenge: MixingChallenge = {
  id: 'i2-06-lead-vocal-mix',
  title: 'Lead Vocal Mix',
  description:
    'Final challenge: make the vocal sit perfectly in this mix. It needs warmth without mud, presence without harshness, and air without sizzle. The vocal should be clearly the lead element while the instruments support it.',
  difficulty: 3,
  module: 'I2',
  tracks: [
    {
      id: 'vocal',
      name: 'Vocal',
      sourceConfig: { type: 'vocal', frequency: 220 },
      color: '#f59e0b',
    },
    {
      id: 'keys',
      name: 'Keys',
      sourceConfig: { type: 'keys', frequency: 440 },
      color: '#8b5cf6',
    },
    {
      id: 'guitar',
      name: 'Guitar',
      sourceConfig: { type: 'guitar', frequency: 330 },
      color: '#10b981',
    },
  ],
  target: {
    type: 'multitrack-goal',
    description: 'Create a polished vocal mix with full instrumental backing',
    conditions: [
      { type: 'eq_boost', track: 'vocal', band: 'high', minBoost: 2 },
      { type: 'frequency_separation', track1: 'vocal', track2: 'keys', band: 'high' },
      { type: 'frequency_separation', track1: 'vocal', track2: 'guitar', band: 'mid' },
      { type: 'relative_level', louder: 'vocal', quieter: 'keys', band: 'mid' },
    ],
  },
  controls: {
    eq: true,
    compressor: 'simple',
    volume: true,
  },
  hints: [
    'Start by boosting vocal presence (highs) and cutting competing frequencies',
    'Carve the guitar mids to make room for the vocal',
    'Cut the keys highs so they don\'t compete with vocal air',
  ],
};
