import type { Challenge } from '../../../core/types.ts';
import { DEFAULT_EFFECTS } from '../../../core/types.ts';

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
  },
};
