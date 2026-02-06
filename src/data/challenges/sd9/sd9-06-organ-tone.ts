import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_EFFECTS, ADDITIVE_PRESETS } from '../../../core/types.ts';

export const challenge: Challenge = {
  id: 'sd9-06-organ-tone',
  title: 'Organ Tone',
  description: 'Create a classic organ tone using specific harmonic combinations like a Hammond drawbar setting.',
  difficulty: 3,
  synthesisType: 'additive',
  module: 'SD9',
  testNote: 'C4',
  hints: [
    'Hammond organs use drawbars to mix specific harmonics.',
    'Focus on harmonics 1, 2, 4, 6, and 8 - these are the classic organ stops.',
    'Each drawbar controls a different harmonic at a specific level.',
  ],
  targetParams: {
    harmonics: [...ADDITIVE_PRESETS.organ],
    amplitudeEnvelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.7,
      release: 0.3,
    },
    effects: DEFAULT_EFFECTS,
    volume: -12,
  },
};
