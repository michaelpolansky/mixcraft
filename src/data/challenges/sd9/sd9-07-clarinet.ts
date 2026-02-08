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
  id: 'sd9-07-clarinet',
  title: 'Clarinet Tone',
  description: 'Create a clarinet-like tone. Clarinets have strong odd harmonics but very weak even harmonics.',
  difficulty: 2,
  synthesisType: 'additive',
  module: 'SD9',
  testNote: 'C4',
  hints: [
    'Clarinets naturally suppress even harmonics due to their cylindrical bore.',
    'Use only odd harmonics (1, 3, 5, 7, 9...) with a gentle rolloff.',
    'The fundamental should be strongest, with harmonics falling off gradually.',
  ],
  targetParams: {
    // Strong odd harmonics, no even harmonics - clarinet character
    harmonics: [1, 0, 0.6, 0, 0.4, 0, 0.25, 0, 0.15, 0, 0.1, 0, 0.06, 0, 0.03, 0],
    amplitudeEnvelope: {
      attack: 0.08,
      decay: 0.1,
      sustain: 0.8,
      release: 0.2,
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
