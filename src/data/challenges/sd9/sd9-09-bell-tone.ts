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
  id: 'sd9-09-bell-tone',
  title: 'Bell Tone',
  description: 'Create a bell-like tone. Bells have a distinctive sound with strong partials at specific intervals.',
  difficulty: 3,
  synthesisType: 'additive',
  module: 'SD9',
  testNote: 'C4',
  hints: [
    'Bell tones have a strong fundamental and specific upper partials.',
    'The 2nd and 3rd harmonics are typically quite prominent in bells.',
    'Higher harmonics should be present but quieter for the shimmering quality.',
  ],
  targetParams: {
    // Bell-like with emphasis on specific partials
    harmonics: [1, 0.7, 0.6, 0.2, 0.4, 0.15, 0.3, 0.1, 0.2, 0.08, 0.15, 0.05, 0.1, 0.03, 0.05, 0.02],
    amplitudeEnvelope: {
      attack: 0.001,
      decay: 1.5,
      sustain: 0.1,
      release: 2.0,
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
