/**
 * Mixing Challenge Registry
 * Central index for mixing fundamentals challenges
 */

import type { MixingChallenge } from '../../../core/types.ts';

// F1 - Frequency Basics
import { challenge as f1_01 } from './f1/f1-01-low-boost.ts';
import { challenge as f1_02 } from './f1/f1-02-high-cut.ts';
import { challenge as f1_03 } from './f1/f1-03-mid-scoop.ts';
import { challenge as f1_04 } from './f1/f1-04-presence-boost.ts';

// F2 - EQ Shaping
import { challenge as f2_01 } from './f2/f2-01-warm-it-up.ts';
import { challenge as f2_02 } from './f2/f2-02-add-brightness.ts';
import { challenge as f2_03 } from './f2/f2-03-smiley-curve.ts';
import { challenge as f2_04 } from './f2/f2-04-telephone-effect.ts';

// F3 - EQ Repair
import { challenge as f3_01 } from './f3/f3-01-muddy-bass.ts';
import { challenge as f3_02 } from './f3/f3-02-harsh-highs.ts';
import { challenge as f3_03 } from './f3/f3-03-boxy-mids.ts';
import { challenge as f3_04 } from './f3/f3-04-thin-tone.ts';

// F4 - Compression Basics
import { challenge as f4_01 } from './f4/f4-01-gentle-squeeze.ts';
import { challenge as f4_02 } from './f4/f4-02-tame-the-peaks.ts';
import { challenge as f4_03 } from './f4/f4-03-heavy-squeeze.ts';
import { challenge as f4_04 } from './f4/f4-04-parallel-punch.ts';

// F5 - Advanced Compression
import { challenge as f5_01 } from './f5/f5-01-snappy-attack.ts';
import { challenge as f5_02 } from './f5/f5-02-let-it-breathe.ts';
import { challenge as f5_03 } from './f5/f5-03-pump-and-release.ts';
import { challenge as f5_04 } from './f5/f5-04-smooth-sustain.ts';

// F6 - Combined Processing
import { challenge as f6_01 } from './f6/f6-01-punchy-bass.ts';
import { challenge as f6_02 } from './f6/f6-02-bright-drums.ts';
import { challenge as f6_03 } from './f6/f6-03-warm-pad.ts';
import { challenge as f6_04 } from './f6/f6-04-radio-ready.ts';

// F7 - Problem Solving
import { challenge as f7_01 } from './f7/f7-01-fix-the-boom.ts';
import { challenge as f7_02 } from './f7/f7-02-tame-the-harsh.ts';
import { challenge as f7_03 } from './f7/f7-03-unbury-the-attack.ts';
import { challenge as f7_04 } from './f7/f7-04-control-the-dynamics.ts';

// F8 - Mix Balance
import { challenge as f8_01 } from './f8/f8-01-fill-the-spectrum.ts';
import { challenge as f8_02 } from './f8/f8-02-make-it-sit.ts';
import { challenge as f8_03 } from './f8/f8-03-punch-through.ts';
import { challenge as f8_04 } from './f8/f8-04-polish-and-glue.ts';

/**
 * All mixing challenges indexed by ID
 */
export const mixingChallengesById: Record<string, MixingChallenge> = {
  'f1-01-low-boost': f1_01,
  'f1-02-high-cut': f1_02,
  'f1-03-mid-scoop': f1_03,
  'f1-04-presence-boost': f1_04,
  'f2-01-warm-it-up': f2_01,
  'f2-02-add-brightness': f2_02,
  'f2-03-smiley-curve': f2_03,
  'f2-04-telephone-effect': f2_04,
  'f3-01-muddy-bass': f3_01,
  'f3-02-harsh-highs': f3_02,
  'f3-03-boxy-mids': f3_03,
  'f3-04-thin-tone': f3_04,
  'f4-01-gentle-squeeze': f4_01,
  'f4-02-tame-the-peaks': f4_02,
  'f4-03-heavy-squeeze': f4_03,
  'f4-04-parallel-punch': f4_04,
  'f5-01-snappy-attack': f5_01,
  'f5-02-let-it-breathe': f5_02,
  'f5-03-pump-and-release': f5_03,
  'f5-04-smooth-sustain': f5_04,
  'f6-01-punchy-bass': f6_01,
  'f6-02-bright-drums': f6_02,
  'f6-03-warm-pad': f6_03,
  'f6-04-radio-ready': f6_04,
  'f7-01-fix-the-boom': f7_01,
  'f7-02-tame-the-harsh': f7_02,
  'f7-03-unbury-the-attack': f7_03,
  'f7-04-control-the-dynamics': f7_04,
  'f8-01-fill-the-spectrum': f8_01,
  'f8-02-make-it-sit': f8_02,
  'f8-03-punch-through': f8_03,
  'f8-04-polish-and-glue': f8_04,
};

/**
 * Mixing challenges grouped by module
 */
export const mixingChallengesByModule: Record<string, MixingChallenge[]> = {
  F1: [f1_01, f1_02, f1_03, f1_04],
  F2: [f2_01, f2_02, f2_03, f2_04],
  F3: [f3_01, f3_02, f3_03, f3_04],
  F4: [f4_01, f4_02, f4_03, f4_04],
  F5: [f5_01, f5_02, f5_03, f5_04],
  F6: [f6_01, f6_02, f6_03, f6_04],
  F7: [f7_01, f7_02, f7_03, f7_04],
  F8: [f8_01, f8_02, f8_03, f8_04],
};

/**
 * Ordered list of all mixing challenges
 */
export const allMixingChallenges: MixingChallenge[] = [
  // F1 - Frequency Basics
  f1_01,
  f1_02,
  f1_03,
  f1_04,
  // F2 - EQ Shaping
  f2_01,
  f2_02,
  f2_03,
  f2_04,
  // F3 - EQ Repair
  f3_01,
  f3_02,
  f3_03,
  f3_04,
  // F4 - Compression Basics
  f4_01,
  f4_02,
  f4_03,
  f4_04,
  // F5 - Advanced Compression
  f5_01,
  f5_02,
  f5_03,
  f5_04,
  // F6 - Combined Processing
  f6_01,
  f6_02,
  f6_03,
  f6_04,
  // F7 - Problem Solving
  f7_01,
  f7_02,
  f7_03,
  f7_04,
  // F8 - Mix Balance
  f8_01,
  f8_02,
  f8_03,
  f8_04,
];

/**
 * Mixing module metadata
 */
export const mixingModules = {
  F1: {
    id: 'F1',
    title: 'Frequency Basics',
    description: 'Learn to hear and adjust low, mid, and high frequencies with a 3-band EQ.',
    challengeCount: 4,
  },
  F2: {
    id: 'F2',
    title: 'EQ Shaping',
    description: 'Shape the overall character of sounds by combining EQ moves.',
    challengeCount: 4,
  },
  F3: {
    id: 'F3',
    title: 'EQ Repair',
    description: 'Fix common frequency problems: muddy bass, harsh highs, boxy mids.',
    challengeCount: 4,
  },
  F4: {
    id: 'F4',
    title: 'Compression Basics',
    description: 'Control dynamics with threshold and amount. Learn to hear compression.',
    challengeCount: 4,
  },
  F5: {
    id: 'F5',
    title: 'Advanced Compression',
    description: 'Master attack and release timing for transparent or pumping compression.',
    challengeCount: 4,
  },
  F6: {
    id: 'F6',
    title: 'Combined Processing',
    description: 'Use EQ and compression together to shape sounds for different contexts.',
    challengeCount: 4,
  },
  F7: {
    id: 'F7',
    title: 'Problem Solving',
    description: 'Diagnose and fix common audio problems: boom, harshness, weak attack.',
    challengeCount: 4,
  },
  F8: {
    id: 'F8',
    title: 'Mix Balance',
    description: 'Advanced scenarios: filling the spectrum, sitting in a mix, polishing.',
    challengeCount: 4,
  },
} as const;

/**
 * Get a mixing challenge by ID
 */
export function getMixingChallenge(id: string): MixingChallenge | undefined {
  return mixingChallengesById[id];
}

/**
 * Get the next mixing challenge after the given one
 */
export function getNextMixingChallenge(currentId: string): MixingChallenge | undefined {
  const index = allMixingChallenges.findIndex((c) => c.id === currentId);
  if (index === -1 || index >= allMixingChallenges.length - 1) {
    return undefined;
  }
  return allMixingChallenges[index + 1];
}
