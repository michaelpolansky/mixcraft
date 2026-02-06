/**
 * Tests for Drum Sequencing Evaluation Logic
 */

import { describe, it, expect } from 'vitest';
import {
  evaluateDrumSequencingChallenge,
  scorePattern,
  scoreVelocity,
  scoreSwing,
  scoreTempo,
  compareTrackPatterns,
} from '../../core/drum-sequencing-evaluation.ts';
import type { DrumSequencingChallenge, DrumPattern, DrumTrack, DrumStep } from '../../core/types.ts';

// Helper to create drum steps
function createSteps(pattern: boolean[], velocity: number = 0.8): DrumStep[] {
  return pattern.map((active) => ({ active, velocity }));
}

// Helper to create a drum track
function createTrack(
  id: string,
  pattern: boolean[],
  velocity: number = 0.8
): DrumTrack {
  return {
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1),
    sampleUrl: `/samples/drums/${id}.wav`,
    steps: createSteps(pattern, velocity),
  };
}

// Helper to create a drum pattern
function createPattern(
  tracks: DrumTrack[],
  overrides: Partial<DrumPattern> = {}
): DrumPattern {
  return {
    name: 'Test Pattern',
    tempo: 120,
    swing: 0,
    stepCount: 16,
    tracks,
    ...overrides,
  };
}

// Helper to create a basic challenge
function createChallenge(
  targetPattern: DrumPattern,
  evaluationFocus: DrumSequencingChallenge['evaluationFocus'],
  overrides: Partial<DrumSequencingChallenge> = {}
): DrumSequencingChallenge {
  return {
    id: 'test-challenge',
    title: 'Test Challenge',
    description: 'Test description',
    difficulty: 1,
    module: 'DS1',
    challengeType: 'match-beat',
    startingPattern: createPattern([]),
    targetPattern,
    evaluationFocus,
    hints: [],
    ...overrides,
  };
}

// Standard 4-on-the-floor kick pattern
const KICK_PATTERN = [
  true, false, false, false,
  true, false, false, false,
  true, false, false, false,
  true, false, false, false,
];

// Backbeat snare pattern
const SNARE_PATTERN = [
  false, false, false, false,
  true, false, false, false,
  false, false, false, false,
  true, false, false, false,
];

// Hi-hat 8th notes
const HIHAT_PATTERN = [
  true, false, true, false,
  true, false, true, false,
  true, false, true, false,
  true, false, true, false,
];

describe('compareTrackPatterns', () => {
  it('returns 100 for identical patterns', () => {
    const track1 = createTrack('kick', KICK_PATTERN);
    const track2 = createTrack('kick', KICK_PATTERN);

    expect(compareTrackPatterns(track1, track2)).toBe(100);
  });

  it('returns 0 when patterns are completely opposite', () => {
    const track1 = createTrack('kick', KICK_PATTERN);
    const oppositePattern = KICK_PATTERN.map((v) => !v);
    const track2 = createTrack('kick', oppositePattern);

    expect(compareTrackPatterns(track1, track2)).toBe(0);
  });

  it('returns proportional score for partial matches', () => {
    const track1 = createTrack('kick', KICK_PATTERN);
    // Change 2 steps out of 16 (87.5% match)
    const partialPattern = [...KICK_PATTERN];
    partialPattern[1] = true;  // Add extra hit
    partialPattern[4] = false; // Remove a hit
    const track2 = createTrack('kick', partialPattern);

    const score = compareTrackPatterns(track1, track2);
    expect(score).toBe(87.5);
  });

  it('handles empty patterns', () => {
    const empty1 = createTrack('kick', []);
    const empty2 = createTrack('kick', []);

    expect(compareTrackPatterns(empty1, empty2)).toBe(100);
  });

  it('handles mismatched step counts', () => {
    const track1 = createTrack('kick', [true, false, true, false]);
    const track2 = createTrack('kick', [true, false]); // Shorter

    // Should compare only the first 2 steps
    expect(compareTrackPatterns(track1, track2)).toBe(100);
  });
});

describe('scorePattern', () => {
  it('returns 100 for perfect pattern match', () => {
    const userPattern = createPattern([
      createTrack('kick', KICK_PATTERN),
      createTrack('snare', SNARE_PATTERN),
    ]);
    const targetPattern = createPattern([
      createTrack('kick', KICK_PATTERN),
      createTrack('snare', SNARE_PATTERN),
    ]);

    expect(scorePattern(userPattern, targetPattern)).toBe(100);
  });

  it('returns 0 when user pattern is completely wrong', () => {
    const userPattern = createPattern([
      createTrack('kick', KICK_PATTERN.map((v) => !v)),
      createTrack('snare', SNARE_PATTERN.map((v) => !v)),
    ]);
    const targetPattern = createPattern([
      createTrack('kick', KICK_PATTERN),
      createTrack('snare', SNARE_PATTERN),
    ]);

    expect(scorePattern(userPattern, targetPattern)).toBe(0);
  });

  it('averages scores across multiple tracks', () => {
    const userPattern = createPattern([
      createTrack('kick', KICK_PATTERN), // 100% match
      createTrack('snare', SNARE_PATTERN.map((v) => !v)), // 0% match
    ]);
    const targetPattern = createPattern([
      createTrack('kick', KICK_PATTERN),
      createTrack('snare', SNARE_PATTERN),
    ]);

    expect(scorePattern(userPattern, targetPattern)).toBe(50);
  });

  it('returns 0 for missing user tracks', () => {
    const userPattern = createPattern([
      createTrack('kick', KICK_PATTERN),
      // Missing snare track
    ]);
    const targetPattern = createPattern([
      createTrack('kick', KICK_PATTERN),
      createTrack('snare', SNARE_PATTERN),
    ]);

    // kick: 100%, snare: 0% (missing) => average 50%
    expect(scorePattern(userPattern, targetPattern)).toBe(50);
  });

  it('handles empty target pattern', () => {
    const userPattern = createPattern([createTrack('kick', KICK_PATTERN)]);
    const targetPattern = createPattern([]);

    expect(scorePattern(userPattern, targetPattern)).toBe(100);
  });
});

describe('scoreVelocity', () => {
  it('returns 100 for exact velocity match', () => {
    const userPattern = createPattern([
      createTrack('kick', KICK_PATTERN, 0.8),
    ]);
    const targetPattern = createPattern([
      createTrack('kick', KICK_PATTERN, 0.8),
    ]);

    expect(scoreVelocity(userPattern, targetPattern)).toBe(100);
  });

  it('returns high score within tolerance (0.15)', () => {
    const userPattern = createPattern([
      createTrack('kick', KICK_PATTERN, 0.9), // 0.1 off from target
    ]);
    const targetPattern = createPattern([
      createTrack('kick', KICK_PATTERN, 0.8),
    ]);

    const score = scoreVelocity(userPattern, targetPattern);
    expect(score).toBeGreaterThanOrEqual(70);
    expect(score).toBeLessThan(100);
  });

  it('returns 70 at exactly tolerance boundary', () => {
    const userPattern = createPattern([
      createTrack('kick', KICK_PATTERN, 0.95), // 0.15 off from target
    ]);
    const targetPattern = createPattern([
      createTrack('kick', KICK_PATTERN, 0.8),
    ]);

    expect(scoreVelocity(userPattern, targetPattern)).toBe(70);
  });

  it('returns lower score outside tolerance', () => {
    const userPattern = createPattern([
      createTrack('kick', KICK_PATTERN, 0.4), // 0.4 off from target
    ]);
    const targetPattern = createPattern([
      createTrack('kick', KICK_PATTERN, 0.8),
    ]);

    const score = scoreVelocity(userPattern, targetPattern);
    expect(score).toBeLessThan(70);
  });

  it('only compares steps active in both patterns', () => {
    // User has extra active steps that target doesn't
    const userKick = createTrack('kick', [true, true, false, false], 0.5);
    const targetKick = createTrack('kick', [true, false, false, false], 0.8);

    const userPattern = createPattern([userKick]);
    const targetPattern = createPattern([targetKick]);

    // Only step 0 is active in both - compare that velocity
    const score = scoreVelocity(userPattern, targetPattern);
    expect(score).toBeLessThan(70); // 0.5 vs 0.8 is 0.3 diff, outside tolerance
  });

  it('returns 100 when no active steps to compare', () => {
    const userPattern = createPattern([
      createTrack('kick', [false, false, false, false]),
    ]);
    const targetPattern = createPattern([
      createTrack('kick', [false, false, false, false]),
    ]);

    expect(scoreVelocity(userPattern, targetPattern)).toBe(100);
  });

  it('handles varying velocities across steps', () => {
    // Create tracks with per-step velocities
    const userKick: DrumTrack = {
      id: 'kick',
      name: 'Kick',
      sampleUrl: '/samples/drums/kick.wav',
      steps: [
        { active: true, velocity: 1.0 },
        { active: false, velocity: 0.8 },
        { active: true, velocity: 0.5 },
        { active: false, velocity: 0.8 },
      ],
    };

    const targetKick: DrumTrack = {
      id: 'kick',
      name: 'Kick',
      sampleUrl: '/samples/drums/kick.wav',
      steps: [
        { active: true, velocity: 1.0 },   // Match
        { active: false, velocity: 0.8 },
        { active: true, velocity: 0.5 },   // Match
        { active: false, velocity: 0.8 },
      ],
    };

    const userPattern = createPattern([userKick]);
    const targetPattern = createPattern([targetKick]);

    expect(scoreVelocity(userPattern, targetPattern)).toBe(100);
  });
});

describe('scoreSwing', () => {
  it('returns 100 for exact swing match', () => {
    expect(scoreSwing(0.5, 0.5)).toBe(100);
    expect(scoreSwing(0, 0)).toBe(100);
  });

  it('returns high score within tolerance (0.1)', () => {
    const score = scoreSwing(0.55, 0.5);
    expect(score).toBeGreaterThanOrEqual(70);
    expect(score).toBeLessThan(100);
  });

  it('returns 70 at exactly tolerance boundary', () => {
    expect(scoreSwing(0.6, 0.5)).toBe(70);
    expect(scoreSwing(0.4, 0.5)).toBe(70);
  });

  it('returns lower score outside tolerance', () => {
    const score = scoreSwing(0.8, 0.5);
    expect(score).toBeLessThan(70);
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it('returns 0 for maximum difference', () => {
    // Max diff is 0.1 * 3 = 0.3 beyond tolerance
    // So 0.4 beyond tolerance should be 0
    const score = scoreSwing(0.9, 0.5); // 0.4 diff, 0.3 beyond tolerance
    expect(score).toBe(0);
  });
});

describe('scoreTempo', () => {
  it('returns 100 for exact tempo match', () => {
    expect(scoreTempo(120, 120)).toBe(100);
    expect(scoreTempo(90, 90)).toBe(100);
  });

  it('returns high score within tolerance (5 BPM)', () => {
    const score = scoreTempo(123, 120);
    expect(score).toBeGreaterThanOrEqual(70);
    expect(score).toBeLessThan(100);
  });

  it('returns 70 at exactly tolerance boundary', () => {
    expect(scoreTempo(125, 120)).toBe(70);
    expect(scoreTempo(115, 120)).toBe(70);
  });

  it('returns lower score outside tolerance', () => {
    const score = scoreTempo(130, 120);
    expect(score).toBeLessThan(70);
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it('returns 0 for large tempo difference', () => {
    // Max diff is 5 * 3 = 15 beyond tolerance
    // So 20 beyond tolerance should be 0
    const score = scoreTempo(145, 120); // 25 diff, 20 beyond tolerance
    expect(score).toBe(0);
  });
});

describe('evaluateDrumSequencingChallenge', () => {
  describe('pattern evaluation', () => {
    it('scores 100 for perfect pattern match', () => {
      const targetPattern = createPattern([
        createTrack('kick', KICK_PATTERN),
        createTrack('snare', SNARE_PATTERN),
      ]);

      const userPattern = createPattern([
        createTrack('kick', KICK_PATTERN),
        createTrack('snare', SNARE_PATTERN),
      ]);

      const challenge = createChallenge(targetPattern, ['pattern']);
      const result = evaluateDrumSequencingChallenge(challenge, userPattern);

      expect(result.overall).toBe(100);
      expect(result.stars).toBe(3);
      expect(result.passed).toBe(true);
      expect(result.breakdown.patternScore).toBe(100);
    });

    it('scores proportionally for partial pattern match', () => {
      const targetPattern = createPattern([
        createTrack('kick', KICK_PATTERN),
      ]);

      // Modify 4 steps out of 16 (75% match)
      const userKickPattern = [...KICK_PATTERN];
      userKickPattern[1] = true;
      userKickPattern[5] = true;
      userKickPattern[9] = true;
      userKickPattern[13] = true;

      const userPattern = createPattern([
        createTrack('kick', userKickPattern),
      ]);

      const challenge = createChallenge(targetPattern, ['pattern']);
      const result = evaluateDrumSequencingChallenge(challenge, userPattern);

      expect(result.overall).toBe(75);
      expect(result.stars).toBe(2);
      expect(result.passed).toBe(true);
    });

    it('fails with poor pattern match', () => {
      const targetPattern = createPattern([
        createTrack('kick', KICK_PATTERN),
      ]);

      const userPattern = createPattern([
        createTrack('kick', KICK_PATTERN.map((v) => !v)),
      ]);

      const challenge = createChallenge(targetPattern, ['pattern']);
      const result = evaluateDrumSequencingChallenge(challenge, userPattern);

      expect(result.overall).toBe(0);
      expect(result.stars).toBe(1);
      expect(result.passed).toBe(false);
    });
  });

  describe('velocity evaluation', () => {
    it('scores 100 for exact velocity match', () => {
      const targetPattern = createPattern([
        createTrack('kick', KICK_PATTERN, 0.8),
      ]);

      const userPattern = createPattern([
        createTrack('kick', KICK_PATTERN, 0.8),
      ]);

      const challenge = createChallenge(targetPattern, ['velocity']);
      const result = evaluateDrumSequencingChallenge(challenge, userPattern);

      expect(result.overall).toBe(100);
      expect(result.breakdown.velocityScore).toBe(100);
    });

    it('passes with velocity within tolerance', () => {
      const targetPattern = createPattern([
        createTrack('kick', KICK_PATTERN, 0.8),
      ]);

      const userPattern = createPattern([
        createTrack('kick', KICK_PATTERN, 0.9), // 0.1 off
      ]);

      const challenge = createChallenge(targetPattern, ['velocity']);
      const result = evaluateDrumSequencingChallenge(challenge, userPattern);

      expect(result.overall).toBeGreaterThanOrEqual(70);
      expect(result.passed).toBe(true);
    });

    it('fails with velocity outside tolerance', () => {
      const targetPattern = createPattern([
        createTrack('kick', KICK_PATTERN, 0.8),
      ]);

      const userPattern = createPattern([
        createTrack('kick', KICK_PATTERN, 0.3), // 0.5 off
      ]);

      const challenge = createChallenge(targetPattern, ['velocity']);
      const result = evaluateDrumSequencingChallenge(challenge, userPattern);

      expect(result.overall).toBeLessThan(70);
      expect(result.passed).toBe(false);
    });
  });

  describe('swing evaluation', () => {
    it('scores 100 for exact swing match', () => {
      const targetPattern = createPattern([], { swing: 0.5 });
      const userPattern = createPattern([], { swing: 0.5 });

      const challenge = createChallenge(targetPattern, ['swing']);
      const result = evaluateDrumSequencingChallenge(challenge, userPattern);

      expect(result.overall).toBe(100);
      expect(result.breakdown.swingScore).toBe(100);
    });

    it('passes with swing within tolerance', () => {
      const targetPattern = createPattern([], { swing: 0.5 });
      const userPattern = createPattern([], { swing: 0.55 }); // 0.05 off

      const challenge = createChallenge(targetPattern, ['swing']);
      const result = evaluateDrumSequencingChallenge(challenge, userPattern);

      expect(result.overall).toBeGreaterThanOrEqual(70);
      expect(result.passed).toBe(true);
    });

    it('fails with swing outside tolerance', () => {
      const targetPattern = createPattern([], { swing: 0.5 });
      const userPattern = createPattern([], { swing: 0.9 }); // 0.4 off

      const challenge = createChallenge(targetPattern, ['swing']);
      const result = evaluateDrumSequencingChallenge(challenge, userPattern);

      expect(result.overall).toBeLessThan(70);
      expect(result.passed).toBe(false);
    });
  });

  describe('tempo evaluation', () => {
    it('scores 100 for exact tempo match', () => {
      const targetPattern = createPattern([], { tempo: 120 });
      const userPattern = createPattern([], { tempo: 120 });

      const challenge = createChallenge(targetPattern, ['tempo']);
      const result = evaluateDrumSequencingChallenge(challenge, userPattern);

      expect(result.overall).toBe(100);
      expect(result.breakdown.tempoScore).toBe(100);
    });

    it('passes with tempo within tolerance', () => {
      const targetPattern = createPattern([], { tempo: 120 });
      const userPattern = createPattern([], { tempo: 123 }); // 3 BPM off

      const challenge = createChallenge(targetPattern, ['tempo']);
      const result = evaluateDrumSequencingChallenge(challenge, userPattern);

      expect(result.overall).toBeGreaterThanOrEqual(70);
      expect(result.passed).toBe(true);
    });

    it('fails with tempo outside tolerance', () => {
      const targetPattern = createPattern([], { tempo: 120 });
      const userPattern = createPattern([], { tempo: 90 }); // 30 BPM off

      const challenge = createChallenge(targetPattern, ['tempo']);
      const result = evaluateDrumSequencingChallenge(challenge, userPattern);

      expect(result.overall).toBeLessThan(70);
      expect(result.passed).toBe(false);
    });
  });

  describe('combined evaluation', () => {
    it('averages pattern and velocity scores', () => {
      const targetPattern = createPattern([
        createTrack('kick', KICK_PATTERN, 0.8),
      ]);

      const userPattern = createPattern([
        createTrack('kick', KICK_PATTERN, 0.8), // 100% pattern, 100% velocity
      ]);

      const challenge = createChallenge(targetPattern, ['pattern', 'velocity']);
      const result = evaluateDrumSequencingChallenge(challenge, userPattern);

      expect(result.overall).toBe(100);
      expect(result.breakdown.patternScore).toBe(100);
      expect(result.breakdown.velocityScore).toBe(100);
    });

    it('averages all four metrics when all focused', () => {
      const targetPattern = createPattern(
        [createTrack('kick', KICK_PATTERN, 0.8)],
        { tempo: 120, swing: 0.5 }
      );

      const userPattern = createPattern(
        [createTrack('kick', KICK_PATTERN, 0.8)],
        { tempo: 120, swing: 0.5 }
      );

      const challenge = createChallenge(targetPattern, ['pattern', 'velocity', 'swing', 'tempo']);
      const result = evaluateDrumSequencingChallenge(challenge, userPattern);

      expect(result.overall).toBe(100);
      expect(result.breakdown.patternScore).toBe(100);
      expect(result.breakdown.velocityScore).toBe(100);
      expect(result.breakdown.swingScore).toBe(100);
      expect(result.breakdown.tempoScore).toBe(100);
    });

    it('correctly weights mixed scores', () => {
      const targetPattern = createPattern(
        [createTrack('kick', KICK_PATTERN, 0.8)],
        { tempo: 120 }
      );

      // Pattern: 100%, Tempo: 70% (at tolerance boundary)
      const userPattern = createPattern(
        [createTrack('kick', KICK_PATTERN, 0.8)],
        { tempo: 125 } // Exactly at 5 BPM tolerance
      );

      const challenge = createChallenge(targetPattern, ['pattern', 'tempo']);
      const result = evaluateDrumSequencingChallenge(challenge, userPattern);

      expect(result.breakdown.patternScore).toBe(100);
      expect(result.breakdown.tempoScore).toBe(70);
      expect(result.overall).toBe(85); // (100 + 70) / 2
    });
  });

  describe('empty pattern handling', () => {
    it('handles empty user pattern', () => {
      const targetPattern = createPattern([
        createTrack('kick', KICK_PATTERN),
      ]);

      const userPattern = createPattern([]);

      const challenge = createChallenge(targetPattern, ['pattern']);
      const result = evaluateDrumSequencingChallenge(challenge, userPattern);

      // Missing track counts as 0% match
      expect(result.overall).toBe(0);
      expect(result.passed).toBe(false);
    });

    it('handles empty target pattern', () => {
      const targetPattern = createPattern([]);
      const userPattern = createPattern([createTrack('kick', KICK_PATTERN)]);

      const challenge = createChallenge(targetPattern, ['pattern']);
      const result = evaluateDrumSequencingChallenge(challenge, userPattern);

      expect(result.overall).toBe(100);
      expect(result.passed).toBe(true);
    });

    it('handles both patterns empty', () => {
      const targetPattern = createPattern([]);
      const userPattern = createPattern([]);

      const challenge = createChallenge(targetPattern, ['pattern', 'velocity']);
      const result = evaluateDrumSequencingChallenge(challenge, userPattern);

      expect(result.overall).toBe(100);
      expect(result.passed).toBe(true);
    });
  });

  describe('star thresholds', () => {
    it('gives 3 stars for 90%+', () => {
      const targetPattern = createPattern([
        createTrack('kick', KICK_PATTERN),
      ]);

      const userPattern = createPattern([
        createTrack('kick', KICK_PATTERN),
      ]);

      const challenge = createChallenge(targetPattern, ['pattern']);
      const result = evaluateDrumSequencingChallenge(challenge, userPattern);

      expect(result.overall).toBe(100);
      expect(result.stars).toBe(3);
    });

    it('gives 2 stars for 70-89%', () => {
      const targetPattern = createPattern([
        createTrack('kick', KICK_PATTERN),
      ]);

      // 4 wrong out of 16 = 75% match
      const userKickPattern = [...KICK_PATTERN];
      userKickPattern[1] = true;
      userKickPattern[5] = true;
      userKickPattern[9] = true;
      userKickPattern[13] = true;

      const userPattern = createPattern([
        createTrack('kick', userKickPattern),
      ]);

      const challenge = createChallenge(targetPattern, ['pattern']);
      const result = evaluateDrumSequencingChallenge(challenge, userPattern);

      expect(result.overall).toBe(75);
      expect(result.stars).toBe(2);
    });

    it('gives 1 star for below 70%', () => {
      const targetPattern = createPattern([
        createTrack('kick', KICK_PATTERN),
      ]);

      // Lots of wrong steps
      const userPattern = createPattern([
        createTrack('kick', KICK_PATTERN.map(() => true)), // All steps on
      ]);

      const challenge = createChallenge(targetPattern, ['pattern']);
      const result = evaluateDrumSequencingChallenge(challenge, userPattern);

      expect(result.overall).toBeLessThan(70);
      expect(result.stars).toBe(1);
    });
  });

  describe('feedback generation', () => {
    it('provides positive feedback for high scores', () => {
      const targetPattern = createPattern([
        createTrack('kick', KICK_PATTERN),
      ]);

      const userPattern = createPattern([
        createTrack('kick', KICK_PATTERN),
      ]);

      const challenge = createChallenge(targetPattern, ['pattern']);
      const result = evaluateDrumSequencingChallenge(challenge, userPattern);

      expect(result.feedback[0]).toContain('Excellent');
    });

    it('provides constructive feedback for passing but imperfect scores', () => {
      const targetPattern = createPattern([
        createTrack('kick', KICK_PATTERN),
      ]);

      // 75% match
      const userKickPattern = [...KICK_PATTERN];
      userKickPattern[1] = true;
      userKickPattern[5] = true;
      userKickPattern[9] = true;
      userKickPattern[13] = true;

      const userPattern = createPattern([
        createTrack('kick', userKickPattern),
      ]);

      const challenge = createChallenge(targetPattern, ['pattern']);
      const result = evaluateDrumSequencingChallenge(challenge, userPattern);

      expect(result.feedback[0]).toContain('Good work');
      expect(result.feedback.some((f) => f.includes('steps') || f.includes('adjustment'))).toBe(true);
    });

    it('provides encouraging feedback for failing scores', () => {
      const targetPattern = createPattern([
        createTrack('kick', KICK_PATTERN),
      ]);

      const userPattern = createPattern([
        createTrack('kick', KICK_PATTERN.map((v) => !v)),
      ]);

      const challenge = createChallenge(targetPattern, ['pattern']);
      const result = evaluateDrumSequencingChallenge(challenge, userPattern);

      expect(result.feedback[0]).toContain('practicing');
    });

    it('includes specific feedback for each evaluation focus', () => {
      const targetPattern = createPattern(
        [createTrack('kick', KICK_PATTERN, 0.8)],
        { tempo: 120, swing: 0.5 }
      );

      const userPattern = createPattern(
        [createTrack('kick', KICK_PATTERN.map((v) => !v), 0.3)],
        { tempo: 90, swing: 0.9 }
      );

      const challenge = createChallenge(targetPattern, ['pattern', 'velocity', 'swing', 'tempo']);
      const result = evaluateDrumSequencingChallenge(challenge, userPattern);

      // Should have feedback for multiple failing aspects
      expect(result.feedback.length).toBeGreaterThan(1);
    });
  });

  describe('breakdown scores', () => {
    it('only includes scores for evaluated aspects', () => {
      const targetPattern = createPattern([
        createTrack('kick', KICK_PATTERN),
      ]);

      const userPattern = createPattern([
        createTrack('kick', KICK_PATTERN),
      ]);

      const challenge = createChallenge(targetPattern, ['pattern']);
      const result = evaluateDrumSequencingChallenge(challenge, userPattern);

      expect(result.breakdown.patternScore).toBeDefined();
      expect(result.breakdown.velocityScore).toBeUndefined();
      expect(result.breakdown.swingScore).toBeUndefined();
      expect(result.breakdown.tempoScore).toBeUndefined();
    });

    it('includes all scores when all aspects evaluated', () => {
      const targetPattern = createPattern(
        [createTrack('kick', KICK_PATTERN, 0.8)],
        { tempo: 120, swing: 0.5 }
      );

      const userPattern = createPattern(
        [createTrack('kick', KICK_PATTERN, 0.8)],
        { tempo: 120, swing: 0.5 }
      );

      const challenge = createChallenge(targetPattern, ['pattern', 'velocity', 'swing', 'tempo']);
      const result = evaluateDrumSequencingChallenge(challenge, userPattern);

      expect(result.breakdown.patternScore).toBeDefined();
      expect(result.breakdown.velocityScore).toBeDefined();
      expect(result.breakdown.swingScore).toBeDefined();
      expect(result.breakdown.tempoScore).toBeDefined();
    });
  });
});
