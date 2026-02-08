import type { Challenge } from '../../../core/types.ts';
import {
  DEFAULT_EFFECTS,
  DEFAULT_ADDITIVE_LFO,
  DEFAULT_NOISE,
  DEFAULT_GLIDE,
  DEFAULT_ARPEGGIATOR,
  DEFAULT_ADDITIVE_MOD_MATRIX,
} from '../../../core/types.ts';

export const challenge: Challenge = {
  id: 'sd9-01-fundamental',
  title: 'Fundamental Only',
  description: 'Create a pure tone using only the fundamental frequency. No overtones, just the first harmonic.',
  difficulty: 1,
  synthesisType: 'additive',
  module: 'SD9',
  testNote: 'C4',
  hints: [
    'A pure sine wave has only the fundamental frequency - no harmonics.',
    'Set the first harmonic (fundamental) to full, all others to zero.',
    'This is the simplest possible additive sound - just one partial.',
  ],
  targetParams: {
    harmonics: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
