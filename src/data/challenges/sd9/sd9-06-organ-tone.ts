import type { Challenge } from '../../../core/types.ts';
import {
  DEFAULT_EFFECTS,
  ADDITIVE_PRESETS,
  DEFAULT_ADDITIVE_LFO,
  DEFAULT_NOISE,
  DEFAULT_GLIDE,
  DEFAULT_ARPEGGIATOR,
  DEFAULT_ADDITIVE_MOD_MATRIX,
} from '../../../core/types.ts';

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
    lfo: DEFAULT_ADDITIVE_LFO,
    noise: DEFAULT_NOISE,
    glide: DEFAULT_GLIDE,
    velocity: { ampAmount: 0, brightnessAmount: 0 },
    arpeggiator: DEFAULT_ARPEGGIATOR,
    modMatrix: DEFAULT_ADDITIVE_MOD_MATRIX,
    pan: 0,
  },
};
