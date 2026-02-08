import type { Challenge } from '../../../core/types.ts';
import {
  DEFAULT_EFFECTS,
  DEFAULT_FM_LFO,
  DEFAULT_NOISE,
  DEFAULT_GLIDE,
  DEFAULT_ARPEGGIATOR,
  DEFAULT_FM_MOD_MATRIX,
} from '../../../core/types.ts';

export const challenge: Challenge = {
  id: 'sd8-11-synth-organ',
  title: 'Synth Organ',
  description: 'Create a sustained organ tone using FM synthesis. Integer harmonicity with steady modulation produces the characteristic organ timbre.',
  difficulty: 2,
  synthesisType: 'fm',
  module: 'SD8',
  testNote: 'C4',
  hints: [
    'Organs have sustained, steady tones with consistent harmonic content.',
    'Harmonicity of 3 adds the octave-and-fifth character of organ pipes.',
    'Keep the modulation envelope amount low for consistent brightness.',
    'Fast attack and high sustain create the instant-on organ feel.',
  ],
  targetParams: {
    harmonicity: 3,
    modulationIndex: 2.2,
    carrierType: 'sine',
    modulatorType: 'sine',
    amplitudeEnvelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.9,
      release: 0.2,
    },
    modulationEnvelopeAmount: 0.1,
    effects: DEFAULT_EFFECTS,
    volume: -12,
    lfo: DEFAULT_FM_LFO,
    noise: DEFAULT_NOISE,
    glide: DEFAULT_GLIDE,
    velocity: { ampAmount: 0, modIndexAmount: 0 },
    arpeggiator: DEFAULT_ARPEGGIATOR,
    modMatrix: DEFAULT_FM_MOD_MATRIX,
    pan: 0,
  },
};
