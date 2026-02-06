/**
 * P1-04: Stack the Spectrum
 * Cover the full frequency range with four elements
 */

import type { ProductionChallenge } from '../../../../core/types.ts';

export const challenge: ProductionChallenge = {
  id: 'p1-04-stack-the-spectrum',
  title: 'Stack the Spectrum',
  description: 'Balance four elements that together should fill the entire frequency spectrum from sub bass to high air.',
  difficulty: 2,
  module: 'P1',
  layers: [
    {
      id: 'sub',
      name: 'Sub',
      sourceConfig: { type: 'bass', frequency: 40 },
      initialVolume: -12,
    },
    {
      id: 'low-mid',
      name: 'Low-Mid',
      sourceConfig: { type: 'bass', frequency: 120 },
      initialVolume: -12,
    },
    {
      id: 'mid',
      name: 'Mid',
      sourceConfig: { type: 'pad', frequency: 400 },
      initialVolume: -12,
    },
    {
      id: 'high',
      name: 'High',
      sourceConfig: { type: 'tone', frequency: 2000 },
      initialVolume: -12,
    },
  ],
  target: {
    type: 'reference',
    layers: [
      { volume: -6, muted: false },
      { volume: -9, muted: false },
      { volume: -6, muted: false },
      { volume: -12, muted: false },
    ],
  },
  availableControls: {
    volume: true,
    mute: true,
    pan: false,
    eq: false,
  },
  hints: [
    'Each layer occupies a different frequency zone',
    'Sub and mids are often the loudest',
    'High frequencies need less volume to be heard',
  ],
};
