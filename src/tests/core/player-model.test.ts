/**
 * Player Model Tests
 * Tests for breakdown extractors, skill scoring, weakness detection, and recommendations.
 */

import { describe, it, expect } from 'vitest';
import {
  extractSDBreakdown,
  extractFMBreakdown,
  extractAdditiveBreakdown,
  extractMixingBreakdown,
  extractProductionBreakdown,
  extractSamplingBreakdown,
  extractDrumBreakdown,
  computeSkillScores,
  getWeaknesses,
  getRecommendations,
  getPracticeMoreSuggestions,
} from '../../core/player-model.ts';
import type { ChallengeProgress } from '../../core/types.ts';
import type { ScoreResult, ScoreBreakdown } from '../../core/sound-comparison.ts';
import type { MixingScoreResult } from '../../ui/stores/mixing-store.ts';
import type { ProductionScoreResult } from '../../core/production-evaluation.ts';
import type { SamplingScoreResult } from '../../core/sampling-evaluation.ts';
import type { DrumSequencingScoreResult } from '../../ui/stores/drum-sequencer-store.ts';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSDResult(scores: {
  brightness: number;
  attack: number;
  filter: number;
  envelope: number;
}): ScoreResult {
  return {
    overall: Math.round((scores.brightness + scores.attack + scores.filter + scores.envelope) / 4),
    stars: 2,
    passed: true,
    breakdown: {
      brightness: { score: scores.brightness, feedback: '' },
      attack: { score: scores.attack, feedback: '' },
      filter: { score: scores.filter, feedback: '' },
      envelope: { score: scores.envelope, feedback: '' },
    },
  };
}

function p(id: string, overrides: Partial<ChallengeProgress> = {}): ChallengeProgress {
  return {
    challengeId: id,
    bestScore: 0,
    stars: 0,
    attempts: 0,
    completed: false,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Breakdown Extractors
// ---------------------------------------------------------------------------

describe('extractSDBreakdown', () => {
  it('extracts brightness, attack, filter, envelope from score result', () => {
    const result = makeSDResult({ brightness: 80, attack: 90, filter: 70, envelope: 85 });
    const breakdown = extractSDBreakdown(result);

    expect(breakdown.brightness).toBe(80);
    expect(breakdown.attack).toBe(90);
    expect(breakdown.filter).toBe(70);
    expect(breakdown.envelope).toBe(85);
  });
});

describe('extractFMBreakdown', () => {
  it('maps attack → harmonicity, filter → modulationIndex', () => {
    const result = makeSDResult({ brightness: 75, attack: 60, filter: 55, envelope: 90 });
    const breakdown = extractFMBreakdown(result);

    expect(breakdown.brightness).toBe(75);
    expect(breakdown.harmonicity).toBe(60);
    expect(breakdown.modulationIndex).toBe(55);
    expect(breakdown.envelope).toBe(90);
  });
});

describe('extractAdditiveBreakdown', () => {
  it('extracts brightness, harmonicity, filter, envelope', () => {
    const result = makeSDResult({ brightness: 80, attack: 85, filter: 90, envelope: 75 });
    const breakdown = extractAdditiveBreakdown(result);

    expect(breakdown.brightness).toBe(80);
    expect(breakdown.harmonicity).toBe(85);
    expect(breakdown.filter).toBe(90);
    expect(breakdown.envelope).toBe(75);
  });
});

describe('extractMixingBreakdown', () => {
  it('extracts EQ scores', () => {
    const result: MixingScoreResult = {
      overall: 80,
      stars: 2,
      passed: true,
      breakdown: {
        eq: { low: 90, mid: 75, high: 85, total: 83 },
      },
      feedback: [],
    };
    const breakdown = extractMixingBreakdown(result);

    expect(breakdown.eqLow).toBe(90);
    expect(breakdown.eqMid).toBe(75);
    expect(breakdown.eqHigh).toBe(85);
  });

  it('extracts compressor total', () => {
    const result: MixingScoreResult = {
      overall: 70,
      stars: 2,
      passed: true,
      breakdown: {
        compressor: { threshold: 80, amount: 70, total: 75 },
      },
      feedback: [],
    };
    const breakdown = extractMixingBreakdown(result);
    expect(breakdown.compressor).toBe(75);
  });

  it('calculates conditions percentage', () => {
    const result: MixingScoreResult = {
      overall: 85,
      stars: 2,
      passed: true,
      breakdown: {
        conditions: [
          { description: 'test1', passed: true },
          { description: 'test2', passed: true },
          { description: 'test3', passed: false },
          { description: 'test4', passed: true },
        ],
      },
      feedback: [],
    };
    const breakdown = extractMixingBreakdown(result);
    expect(breakdown.conditions).toBe(75); // 3 out of 4
  });

  it('returns empty object for empty breakdown', () => {
    const result: MixingScoreResult = {
      overall: 50,
      stars: 1,
      passed: true,
      breakdown: {},
      feedback: [],
    };
    const breakdown = extractMixingBreakdown(result);
    expect(Object.keys(breakdown)).toHaveLength(0);
  });
});

describe('extractProductionBreakdown', () => {
  it('averages layer scores and calculates condition percentage', () => {
    const result: ProductionScoreResult = {
      overall: 80,
      stars: 2,
      passed: true,
      breakdown: {
        type: 'goal',
        layerScores: [
          { id: 'bass', name: 'Bass', score: 80 },
          { id: 'pad', name: 'Pad', score: 60 },
        ],
        conditionResults: [
          { description: 'test1', passed: true },
          { description: 'test2', passed: false },
        ],
      },
      feedback: [],
    };
    const breakdown = extractProductionBreakdown(result);
    expect(breakdown.eqLow).toBe(70); // avg of 80 and 60
    expect(breakdown.conditions).toBe(50); // 1 out of 2
  });
});

describe('extractSamplingBreakdown', () => {
  it('extracts pitch, slice, timing, creativity', () => {
    const result: SamplingScoreResult = {
      overall: 80,
      stars: 2,
      passed: true,
      breakdown: {
        type: 'tune-to-track',
        pitchScore: 85,
        sliceScore: 70,
        timingScore: 90,
        creativityScore: 60,
      },
      feedback: [],
    };
    const breakdown = extractSamplingBreakdown(result);
    expect(breakdown.pitch).toBe(85);
    expect(breakdown.slice).toBe(70);
    expect(breakdown.timing).toBe(90);
    expect(breakdown.creativity).toBe(60);
  });

  it('handles undefined optional scores', () => {
    const result: SamplingScoreResult = {
      overall: 80,
      stars: 2,
      passed: true,
      breakdown: {
        type: 'chop-challenge',
        sliceScore: 88,
      },
      feedback: [],
    };
    const breakdown = extractSamplingBreakdown(result);
    expect(breakdown.slice).toBe(88);
    expect(breakdown.pitch).toBeUndefined();
    expect(breakdown.timing).toBeUndefined();
  });
});

describe('extractDrumBreakdown', () => {
  it('extracts pattern, velocity, swing, tempo', () => {
    const result: DrumSequencingScoreResult = {
      overall: 85,
      stars: 2,
      passed: true,
      breakdown: {
        patternScore: 90,
        velocityScore: 80,
        swingScore: 75,
        tempoScore: 95,
      },
      feedback: [],
    };
    const breakdown = extractDrumBreakdown(result);
    expect(breakdown.pattern).toBe(90);
    expect(breakdown.velocity).toBe(80);
    expect(breakdown.swing).toBe(75);
    expect(breakdown.tempo).toBe(95);
  });
});

// ---------------------------------------------------------------------------
// computeSkillScores
// ---------------------------------------------------------------------------

describe('computeSkillScores', () => {
  it('returns empty array for empty progress', () => {
    expect(computeSkillScores({})).toEqual([]);
  });

  it('returns empty for progress without breakdowns', () => {
    const progress = {
      'sd1-01': p('sd1-01', { bestScore: 80, completed: true }),
    };
    expect(computeSkillScores(progress)).toEqual([]);
  });

  it('computes averages correctly', () => {
    const progress = {
      'sd1-01': p('sd1-01', {
        bestScore: 80,
        completed: true,
        breakdown: { brightness: 80, attack: 90, filter: 70, envelope: 85 },
      }),
      'sd1-02': p('sd1-02', {
        bestScore: 70,
        completed: true,
        breakdown: { brightness: 60, attack: 80, filter: 90, envelope: 75 },
      }),
    };
    const scores = computeSkillScores(progress);

    const brightness = scores.find(s => s.skill === 'brightness')!;
    expect(brightness.score).toBe(70); // avg(80, 60)
    expect(brightness.sampleCount).toBe(2);

    const attack = scores.find(s => s.skill === 'attack')!;
    expect(attack.score).toBe(85); // avg(90, 80)
  });

  it('sorts weakest first', () => {
    const progress = {
      'sd1-01': p('sd1-01', {
        bestScore: 80,
        completed: true,
        breakdown: { brightness: 95, attack: 50, filter: 80, envelope: 70 },
      }),
    };
    const scores = computeSkillScores(progress);
    expect(scores[0]!.skill).toBe('attack');
    expect(scores[scores.length - 1]!.skill).toBe('brightness');
  });
});

// ---------------------------------------------------------------------------
// getWeaknesses
// ---------------------------------------------------------------------------

describe('getWeaknesses', () => {
  it('returns empty when all skills are above threshold', () => {
    const skills = [
      { skill: 'brightness' as const, label: 'Brightness', score: 90, sampleCount: 5, track: 'sound-design' },
      { skill: 'attack' as const, label: 'Attack', score: 85, sampleCount: 5, track: 'sound-design' },
    ];
    expect(getWeaknesses(skills)).toEqual([]);
  });

  it('filters by minSamples', () => {
    const skills = [
      { skill: 'brightness' as const, label: 'Brightness', score: 50, sampleCount: 1, track: 'sound-design' },
    ];
    // Default minSamples is 2
    expect(getWeaknesses(skills)).toEqual([]);
    expect(getWeaknesses(skills, 1)).toHaveLength(1);
  });

  it('returns up to maxResults weaknesses', () => {
    const skills = [
      { skill: 'brightness' as const, label: 'Brightness', score: 50, sampleCount: 5, track: 'sound-design' },
      { skill: 'attack' as const, label: 'Attack', score: 55, sampleCount: 5, track: 'sound-design' },
      { skill: 'filter' as const, label: 'Filter', score: 60, sampleCount: 5, track: 'sound-design' },
      { skill: 'envelope' as const, label: 'Envelope', score: 65, sampleCount: 5, track: 'sound-design' },
    ];
    const weaknesses = getWeaknesses(skills, 2, 2);
    expect(weaknesses).toHaveLength(2);
  });

  it('respects custom threshold', () => {
    const skills = [
      { skill: 'brightness' as const, label: 'Brightness', score: 70, sampleCount: 5, track: 'sound-design' },
    ];
    expect(getWeaknesses(skills, 2, 3, 80)).toHaveLength(1);
    expect(getWeaknesses(skills, 2, 3, 60)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// getRecommendations
// ---------------------------------------------------------------------------

describe('getRecommendations', () => {
  const challenges = [
    { id: 'sd1-01', title: 'Pure Tone', module: 'SD1' },
    { id: 'sd1-02', title: 'Buzzy Bass', module: 'SD1' },
    { id: 'sd2-01', title: 'Muffled Tone', module: 'SD2' },
    { id: 'sd2-02', title: 'Thin Lead', module: 'SD2' },
    { id: 'sd3-01', title: 'Slow Swell', module: 'SD3' },
    { id: 'sd6-01', title: 'Acid Bass', module: 'SD6' },
  ];

  it('returns empty for empty weaknesses', () => {
    expect(getRecommendations([], {}, challenges)).toEqual([]);
  });

  it('recommends incomplete challenges for weak skills', () => {
    const weaknesses = [
      { skill: 'filter' as const, label: 'Filter Control', score: 50, track: 'sound-design' },
    ];
    // SD2 and SD14 are filter modules; sd2-01 is incomplete
    const progress = {
      'sd2-01': p('sd2-01', { bestScore: 0, completed: false }),
    };
    const recs = getRecommendations(weaknesses, progress, challenges);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0]!.challengeId).toBe('sd2-01');
    expect(recs[0]!.priority).toBe(3); // incomplete = highest priority
  });

  it('recommends 1-star challenges over 3-star', () => {
    const weaknesses = [
      { skill: 'filter' as const, label: 'Filter Control', score: 50, track: 'sound-design' },
    ];
    const progress = {
      'sd2-01': p('sd2-01', { bestScore: 65, stars: 1, completed: true }),
      'sd2-02': p('sd2-02', { bestScore: 95, stars: 3, completed: true }),
    };
    const recs = getRecommendations(weaknesses, progress, challenges);
    expect(recs.find(r => r.challengeId === 'sd2-01')).toBeDefined();
    expect(recs.find(r => r.challengeId === 'sd2-02')).toBeUndefined();
  });

  it('respects max limit', () => {
    const weaknesses = [
      { skill: 'brightness' as const, label: 'Brightness', score: 50, track: 'sound-design' },
      { skill: 'filter' as const, label: 'Filter', score: 55, track: 'sound-design' },
    ];
    const recs = getRecommendations(weaknesses, {}, challenges, 2);
    expect(recs.length).toBeLessThanOrEqual(2);
  });

  it('sorts by priority descending', () => {
    const weaknesses = [
      { skill: 'brightness' as const, label: 'Brightness', score: 50, track: 'sound-design' },
    ];
    const progress = {
      'sd1-01': p('sd1-01', { bestScore: 65, stars: 1, completed: true }), // priority 2
      'sd1-02': p('sd1-02'), // priority 3 (incomplete)
    };
    const recs = getRecommendations(weaknesses, progress, challenges);
    if (recs.length >= 2) {
      expect(recs[0]!.priority).toBeGreaterThanOrEqual(recs[1]!.priority);
    }
  });
});

// ---------------------------------------------------------------------------
// getPracticeMoreSuggestions
// ---------------------------------------------------------------------------

describe('getPracticeMoreSuggestions', () => {
  const challenges = [
    { id: 'sd2-01', title: 'Muffled Tone', module: 'SD2' },
    { id: 'sd3-01', title: 'Slow Swell', module: 'SD3' },
  ];

  it('returns empty for undefined breakdown', () => {
    expect(getPracticeMoreSuggestions(undefined, {}, challenges)).toEqual([]);
  });

  it('returns empty when all dimensions >= 70%', () => {
    const breakdown = { brightness: 80, attack: 85, filter: 90, envelope: 75 };
    expect(getPracticeMoreSuggestions(breakdown, {}, challenges)).toEqual([]);
  });

  it('recommends challenges for weak dimensions', () => {
    const breakdown = { brightness: 80, attack: 85, filter: 50, envelope: 40 };
    const recs = getPracticeMoreSuggestions(breakdown, {}, challenges);
    expect(recs.length).toBeGreaterThan(0);
  });

  it('respects max limit', () => {
    const breakdown = { brightness: 30, attack: 30, filter: 30, envelope: 30 };
    const recs = getPracticeMoreSuggestions(breakdown, {}, challenges, 1);
    expect(recs.length).toBeLessThanOrEqual(1);
  });
});
