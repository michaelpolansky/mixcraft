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
  id: 'sd9-11-nasal-reed',
  title: 'Nasal Reed',
  description: 'Create a nasal, reed-like tone. Reed instruments have a distinctive buzzy quality from strong mid harmonics.',
  difficulty: 2,
  synthesisType: 'additive',
  module: 'SD9',
  testNote: 'C4',
  hints: [
    'Reed instruments have strong mid-range harmonics that create their nasal quality.',
    'Harmonics 3-6 should be prominent for the buzzy character.',
    'The fundamental can be weaker than the mid harmonics.',
  ],
  targetParams: {
    // Nasal reed with strong mid harmonics
    harmonics: [0.6, 0.5, 1, 0.9, 0.8, 0.6, 0.3, 0.2, 0.15, 0.1, 0.08, 0.05, 0.03, 0.02, 0.01, 0],
    amplitudeEnvelope: {
      attack: 0.05,
      decay: 0.1,
      sustain: 0.75,
      release: 0.15,
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
