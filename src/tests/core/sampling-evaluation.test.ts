/**
 * Tests for Sampling Evaluation Logic
 */

import { describe, it, expect } from 'vitest';
import {
  evaluateSamplingChallenge,
  scorePitch,
  scoreSlices,
  scoreTimeStretch,
} from '../../core/sampling-evaluation.ts';
import type { SamplingChallenge, SamplerParams, SampleSlice } from '../../core/types.ts';
import { DEFAULT_SAMPLER_PARAMS } from '../../core/types.ts';

// Helper to create sampler params with overrides
function createSamplerParams(overrides: Partial<SamplerParams> = {}): SamplerParams {
  return {
    ...DEFAULT_SAMPLER_PARAMS,
    sampleUrl: 'test-sample.wav',
    sampleName: 'Test Sample',
    duration: 4.0,
    ...overrides,
  };
}

// Helper to create sample slices
function createSlices(count: number, duration: number): SampleSlice[] {
  const spacing = duration / count;
  return Array.from({ length: count }, (_, i) => ({
    id: `slice-${i}`,
    start: i * spacing,
    end: (i + 1) * spacing,
    pitch: 0,
    velocity: 1,
  }));
}

describe('scorePitch', () => {
  it('returns 100 for exact match', () => {
    expect(scorePitch(0, 0)).toBe(100);
    expect(scorePitch(5, 5)).toBe(100);
    expect(scorePitch(-3, -3)).toBe(100);
  });

  it('returns high score within tolerance (1 semitone)', () => {
    const score = scorePitch(1, 0);
    expect(score).toBeGreaterThanOrEqual(70);
    expect(score).toBeLessThan(100);
  });

  it('returns 70 at exactly 1 semitone off', () => {
    expect(scorePitch(1, 0)).toBe(70);
    expect(scorePitch(-1, 0)).toBe(70);
  });

  it('returns lower score outside tolerance', () => {
    const score = scorePitch(3, 0);
    expect(score).toBeLessThan(70);
    expect(score).toBeGreaterThan(0);
  });

  it('returns 0 at 5+ semitones off', () => {
    expect(scorePitch(5, 0)).toBe(0);
    expect(scorePitch(-5, 0)).toBe(0);
  });
});

describe('scoreSlices', () => {
  it('returns 100 for correct count with even distribution', () => {
    const slices = createSlices(4, 4.0);
    const score = scoreSlices(slices, 4, 4.0);
    expect(score).toBe(100);
  });

  it('returns lower score for wrong count', () => {
    const slices = createSlices(2, 4.0);
    const score = scoreSlices(slices, 4, 4.0);
    expect(score).toBeLessThan(100);
  });

  it('returns 0 points for count when no slices and slices expected', () => {
    const score = scoreSlices([], 4, 4.0);
    expect(score).toBeLessThan(60);
  });

  it('returns 100 for no slices when none expected', () => {
    const score = scoreSlices([], 0, 4.0);
    expect(score).toBe(100);
  });

  it('penalizes creating slices when none expected', () => {
    const slices = createSlices(2, 4.0);
    const score = scoreSlices(slices, 0, 4.0);
    expect(score).toBe(50);
  });

  it('handles single slice correctly', () => {
    const slices = createSlices(1, 4.0);
    const score = scoreSlices(slices, 1, 4.0);
    expect(score).toBe(100);
  });
});

describe('scoreTimeStretch', () => {
  it('returns 100 for exact match', () => {
    expect(scoreTimeStretch(1.0, 1.0)).toBe(100);
    expect(scoreTimeStretch(0.75, 0.75)).toBe(100);
  });

  it('returns high score within tolerance (10%)', () => {
    const score = scoreTimeStretch(1.05, 1.0);
    expect(score).toBeGreaterThanOrEqual(70);
  });

  it('returns around 70 near tolerance boundary', () => {
    // Due to floating point precision, 1.1 - 1.0 may not be exactly 0.1
    const score = scoreTimeStretch(1.1, 1.0);
    expect(score).toBeGreaterThan(50);
    expect(score).toBeLessThanOrEqual(70);
  });

  it('returns low score far outside tolerance', () => {
    const score = scoreTimeStretch(1.3, 1.0);
    expect(score).toBeLessThan(70);
  });
});

describe('evaluateSamplingChallenge', () => {
  describe('recreate-kit challenges', () => {
    const recreateChallenge: SamplingChallenge = {
      id: 'test-recreate',
      title: 'Recreate the Kit',
      description: 'Match the target sample settings',
      difficulty: 2,
      module: 'SM1',
      challengeType: 'recreate-kit',
      sourceSampleUrl: 'source.wav',
      targetParams: {
        pitch: 3,
        timeStretch: 1.2,
      },
      expectedSlices: 4,
      hints: [],
    };

    it('scores 100 when all params match exactly', () => {
      const params = createSamplerParams({
        pitch: 3,
        timeStretch: 1.2,
        slices: createSlices(4, 4.0),
      });

      const result = evaluateSamplingChallenge(recreateChallenge, params);

      expect(result.overall).toBe(100);
      expect(result.stars).toBe(3);
      expect(result.passed).toBe(true);
    });

    it('scores high when params are close', () => {
      const params = createSamplerParams({
        pitch: 4,
        timeStretch: 1.15,
        slices: createSlices(4, 4.0),
      });

      const result = evaluateSamplingChallenge(recreateChallenge, params);

      expect(result.overall).toBeGreaterThan(70);
      expect(result.passed).toBe(true);
    });

    it('fails when params are far off', () => {
      const params = createSamplerParams({
        pitch: -5,
        timeStretch: 0.5,
        slices: [],
      });

      const result = evaluateSamplingChallenge(recreateChallenge, params);

      expect(result.overall).toBeLessThan(60);
      expect(result.passed).toBe(false);
    });

    it('includes breakdown scores', () => {
      const params = createSamplerParams({
        pitch: 3,
        timeStretch: 1.2,
        slices: createSlices(4, 4.0),
      });

      const result = evaluateSamplingChallenge(recreateChallenge, params);

      expect(result.breakdown.type).toBe('recreate-kit');
      expect(result.breakdown.pitchScore).toBeDefined();
      expect(result.breakdown.sliceScore).toBeDefined();
      expect(result.breakdown.timingScore).toBeDefined();
    });
  });

  describe('chop-challenge', () => {
    const chopChallenge: SamplingChallenge = {
      id: 'test-chop',
      title: 'Chop It Up',
      description: 'Create 4 evenly spaced chops',
      difficulty: 1,
      module: 'SM2',
      challengeType: 'chop-challenge',
      sourceSampleUrl: 'source.wav',
      expectedSlices: 4,
      hints: [],
    };

    it('passes with correct slice count', () => {
      const params = createSamplerParams({
        slices: createSlices(4, 4.0),
      });

      const result = evaluateSamplingChallenge(chopChallenge, params);

      expect(result.overall).toBe(100);
      expect(result.passed).toBe(true);
      expect(result.breakdown.type).toBe('chop-challenge');
    });

    it('fails with no slices', () => {
      const params = createSamplerParams({
        slices: [],
      });

      const result = evaluateSamplingChallenge(chopChallenge, params);

      expect(result.passed).toBe(false);
      expect(result.feedback.some((f) => f.includes('No slices'))).toBe(true);
    });

    it('scores lower with wrong slice count', () => {
      const params = createSamplerParams({
        slices: createSlices(2, 4.0),
      });

      const result = evaluateSamplingChallenge(chopChallenge, params);

      expect(result.overall).toBeLessThan(100);
      expect(result.feedback.some((f) => f.includes('Expected'))).toBe(true);
    });
  });

  describe('tune-to-track challenges', () => {
    const tuneChallenge: SamplingChallenge = {
      id: 'test-tune',
      title: 'Tune to Track',
      description: 'Match the pitch and tempo',
      difficulty: 2,
      module: 'SM3',
      challengeType: 'tune-to-track',
      sourceSampleUrl: 'source.wav',
      targetParams: {
        pitch: -2,
        timeStretch: 0.8,
      },
      hints: [],
    };

    it('passes with matching pitch and time stretch', () => {
      const params = createSamplerParams({
        pitch: -2,
        timeStretch: 0.8,
      });

      const result = evaluateSamplingChallenge(tuneChallenge, params);

      expect(result.overall).toBe(100);
      expect(result.passed).toBe(true);
    });

    it('fails when pitch is way off', () => {
      const params = createSamplerParams({
        pitch: 10,
        timeStretch: 0.8,
      });

      const result = evaluateSamplingChallenge(tuneChallenge, params);

      expect(result.passed).toBe(false);
    });
  });

  describe('flip-this challenges', () => {
    const flipChallenge: SamplingChallenge = {
      id: 'test-flip',
      title: 'Flip This',
      description: 'Make something creative',
      difficulty: 3,
      module: 'SM4',
      challengeType: 'flip-this',
      sourceSampleUrl: 'source.wav',
      hints: [],
    };

    it('fails when no sample loaded', () => {
      const params = createSamplerParams({
        sampleUrl: null,
      });

      const result = evaluateSamplingChallenge(flipChallenge, params);

      expect(result.passed).toBe(false);
      expect(result.overall).toBe(0);
    });

    it('passes with sample loaded and manipulated', () => {
      const params = createSamplerParams({
        pitch: 5,
        reverse: true,
      });

      const result = evaluateSamplingChallenge(flipChallenge, params);

      expect(result.passed).toBe(true);
      expect(result.breakdown.creativityScore).toBeGreaterThan(60);
    });

    it('scores higher with more manipulation', () => {
      const minimalParams = createSamplerParams({
        pitch: 5,
      });

      const maximalParams = createSamplerParams({
        pitch: 5,
        timeStretch: 1.5,
        reverse: true,
        slices: createSlices(4, 4.0),
        startPoint: 0.1,
      });

      const minResult = evaluateSamplingChallenge(flipChallenge, minimalParams);
      const maxResult = evaluateSamplingChallenge(flipChallenge, maximalParams);

      expect(maxResult.overall).toBeGreaterThan(minResult.overall);
    });

    it('gives partial score for sample loaded but not manipulated', () => {
      const params = createSamplerParams({
        pitch: 0,
        timeStretch: 1.0,
        reverse: false,
        slices: [],
        startPoint: 0,
        endPoint: 1,
      });

      const result = evaluateSamplingChallenge(flipChallenge, params);

      expect(result.overall).toBe(50);
      expect(result.passed).toBe(false);
    });
  });

  describe('clean-sample challenges', () => {
    const cleanChallenge: SamplingChallenge = {
      id: 'test-clean',
      title: 'Clean Sample',
      description: 'Trim and add fades',
      difficulty: 1,
      module: 'SM5',
      challengeType: 'clean-sample',
      sourceSampleUrl: 'source.wav',
      targetParams: {
        startPoint: 0.1,
        endPoint: 0.9,
        fadeIn: 0.05,
        fadeOut: 0.05,
      },
      hints: [],
    };

    it('passes with matching trim and fades', () => {
      const params = createSamplerParams({
        startPoint: 0.1,
        endPoint: 0.9,
        fadeIn: 0.05,
        fadeOut: 0.05,
      });

      const result = evaluateSamplingChallenge(cleanChallenge, params);

      expect(result.overall).toBe(100);
      expect(result.passed).toBe(true);
    });

    it('scores lower with incorrect trim points', () => {
      const params = createSamplerParams({
        startPoint: 0,
        endPoint: 1,
        fadeIn: 0.05,
        fadeOut: 0.05,
      });

      const result = evaluateSamplingChallenge(cleanChallenge, params);

      expect(result.overall).toBeLessThan(100);
    });
  });

  describe('routing to correct evaluator', () => {
    it('routes recreate-kit to evaluateRecreateKit', () => {
      const challenge: SamplingChallenge = {
        id: 'test',
        title: 'Test',
        description: 'Test',
        difficulty: 1,
        module: 'SM1',
        challengeType: 'recreate-kit',
        sourceSampleUrl: 'source.wav',
        hints: [],
      };

      const result = evaluateSamplingChallenge(challenge, createSamplerParams());
      expect(result.breakdown.type).toBe('recreate-kit');
    });

    it('routes chop-challenge to evaluateChopChallenge', () => {
      const challenge: SamplingChallenge = {
        id: 'test',
        title: 'Test',
        description: 'Test',
        difficulty: 1,
        module: 'SM1',
        challengeType: 'chop-challenge',
        sourceSampleUrl: 'source.wav',
        expectedSlices: 4,
        hints: [],
      };

      const result = evaluateSamplingChallenge(challenge, createSamplerParams());
      expect(result.breakdown.type).toBe('chop-challenge');
    });

    it('routes tune-to-track to evaluateTuneToTrack', () => {
      const challenge: SamplingChallenge = {
        id: 'test',
        title: 'Test',
        description: 'Test',
        difficulty: 1,
        module: 'SM1',
        challengeType: 'tune-to-track',
        sourceSampleUrl: 'source.wav',
        hints: [],
      };

      const result = evaluateSamplingChallenge(challenge, createSamplerParams());
      expect(result.breakdown.type).toBe('tune-to-track');
    });

    it('routes flip-this to evaluateFlipThis', () => {
      const challenge: SamplingChallenge = {
        id: 'test',
        title: 'Test',
        description: 'Test',
        difficulty: 1,
        module: 'SM1',
        challengeType: 'flip-this',
        sourceSampleUrl: 'source.wav',
        hints: [],
      };

      const result = evaluateSamplingChallenge(challenge, createSamplerParams());
      expect(result.breakdown.type).toBe('flip-this');
    });

    it('routes clean-sample to evaluateCleanSample', () => {
      const challenge: SamplingChallenge = {
        id: 'test',
        title: 'Test',
        description: 'Test',
        difficulty: 1,
        module: 'SM1',
        challengeType: 'clean-sample',
        sourceSampleUrl: 'source.wav',
        hints: [],
      };

      const result = evaluateSamplingChallenge(challenge, createSamplerParams());
      expect(result.breakdown.type).toBe('clean-sample');
    });
  });

  describe('star thresholds', () => {
    const challenge: SamplingChallenge = {
      id: 'test-stars',
      title: 'Stars Test',
      description: 'Test star thresholds',
      difficulty: 1,
      module: 'SM1',
      challengeType: 'chop-challenge',
      sourceSampleUrl: 'source.wav',
      expectedSlices: 4,
      hints: [],
    };

    it('gives 3 stars for 90%+', () => {
      const params = createSamplerParams({
        slices: createSlices(4, 4.0),
      });

      const result = evaluateSamplingChallenge(challenge, params);
      expect(result.stars).toBe(3);
    });

    it('gives 2 stars for 75-89%', () => {
      // 3 slices instead of 4 gives count score of ~45/60 + some distribution
      // This results in a score around 75-85%
      const params = createSamplerParams({
        slices: createSlices(3, 4.0),
      });

      const result = evaluateSamplingChallenge(challenge, params);
      expect(result.stars).toBe(2);
      expect(result.overall).toBeGreaterThanOrEqual(75);
      expect(result.overall).toBeLessThan(90);
    });

    it('gives 1 star for passing scores below 75%', () => {
      // 2 slices instead of 4 gives count score of ~30/60 + distribution
      const params = createSamplerParams({
        slices: createSlices(2, 4.0),
      });

      const result = evaluateSamplingChallenge(challenge, params);
      expect(result.stars).toBe(1);
      expect(result.passed).toBe(true);
      expect(result.overall).toBeGreaterThanOrEqual(60);
      expect(result.overall).toBeLessThan(75);
    });
  });

  describe('feedback generation', () => {
    it('provides positive feedback for high scores', () => {
      const challenge: SamplingChallenge = {
        id: 'test',
        title: 'Test',
        description: 'Test',
        difficulty: 1,
        module: 'SM1',
        challengeType: 'chop-challenge',
        sourceSampleUrl: 'source.wav',
        expectedSlices: 4,
        hints: [],
      };

      const params = createSamplerParams({
        slices: createSlices(4, 4.0),
      });

      const result = evaluateSamplingChallenge(challenge, params);
      expect(result.feedback[0]).toContain('Perfect');
    });

    it('provides constructive feedback for failing scores', () => {
      const challenge: SamplingChallenge = {
        id: 'test',
        title: 'Test',
        description: 'Test',
        difficulty: 1,
        module: 'SM1',
        challengeType: 'chop-challenge',
        sourceSampleUrl: 'source.wav',
        expectedSlices: 4,
        hints: [],
      };

      const params = createSamplerParams({
        slices: [],
      });

      const result = evaluateSamplingChallenge(challenge, params);
      expect(result.feedback.some((f) => f.includes('practicing') || f.includes('No slices'))).toBe(true);
    });
  });
});
