/**
 * Mixing Evaluation
 * Scores player's EQ and compressor settings against targets
 */

import type { MixingChallenge, EQParams, CompressorFullParams, MixingTarget } from './types.ts';
import type { MixingScoreResult } from '../ui/stores/mixing-store.ts';

/**
 * Calculate similarity between two values within a tolerance range
 * Returns 100 if exact match, scales down as difference increases
 */
function scoreSimilarity(playerValue: number, targetValue: number, tolerance: number): number {
  const diff = Math.abs(playerValue - targetValue);
  if (diff <= tolerance * 0.1) return 100; // Within 10% tolerance = perfect
  if (diff > tolerance) return 0; // Outside tolerance = zero
  // Linear scale between
  return Math.round(100 * (1 - diff / tolerance));
}

/**
 * Evaluate EQ settings against target
 */
function evaluateEQ(
  player: EQParams,
  target: { low: number; mid: number; high: number },
  tolerance: number = 3 // ±3 dB default tolerance
): { low: number; mid: number; high: number; total: number } {
  const low = scoreSimilarity(player.low, target.low, tolerance);
  const mid = scoreSimilarity(player.mid, target.mid, tolerance);
  const high = scoreSimilarity(player.high, target.high, tolerance);
  const total = Math.round((low + mid + high) / 3);

  return { low, mid, high, total };
}

/**
 * Evaluate compressor settings against target
 */
function evaluateCompressor(
  player: CompressorFullParams,
  target: { threshold: number; amount: number; attack?: number; release?: number },
  includeTimings: boolean = false
): { threshold: number; amount: number; attack?: number; release?: number; total: number } {
  const threshold = scoreSimilarity(player.threshold, target.threshold, 6); // ±6 dB
  const amount = scoreSimilarity(player.amount, target.amount, 15); // ±15%

  if (!includeTimings || target.attack === undefined || target.release === undefined) {
    const total = Math.round((threshold + amount) / 2);
    return { threshold, amount, total };
  }

  // Include attack/release for F5 challenges
  const attack = scoreSimilarity(player.attack, target.attack, 0.05); // ±50ms
  const release = scoreSimilarity(player.release, target.release, 0.1); // ±100ms
  const total = Math.round((threshold + amount + attack + release) / 4);

  return { threshold, amount, attack, release, total };
}

/**
 * Evaluate problem-solving challenges (F6-F8)
 */
function evaluateProblem(
  playerEQ: EQParams,
  playerComp: CompressorFullParams,
  problem: {
    solution: {
      eq?: Partial<{ low: [number, number]; mid: [number, number]; high: [number, number] }>;
      compressor?: Partial<{ threshold: [number, number]; amount: [number, number] }>;
    }
  }
): { total: number; feedback: string[] } {
  const feedback: string[] = [];
  const scores: number[] = [];

  // Check EQ solution ranges
  if (problem.solution.eq) {
    const eq = problem.solution.eq;
    if (eq.low) {
      const [min, max] = eq.low;
      if (playerEQ.low >= min && playerEQ.low <= max) {
        scores.push(100);
      } else {
        scores.push(0);
        feedback.push(`Low EQ should be between ${min} and ${max} dB`);
      }
    }
    if (eq.mid) {
      const [min, max] = eq.mid;
      if (playerEQ.mid >= min && playerEQ.mid <= max) {
        scores.push(100);
      } else {
        scores.push(0);
        feedback.push(`Mid EQ should be between ${min} and ${max} dB`);
      }
    }
    if (eq.high) {
      const [min, max] = eq.high;
      if (playerEQ.high >= min && playerEQ.high <= max) {
        scores.push(100);
      } else {
        scores.push(0);
        feedback.push(`High EQ should be between ${min} and ${max} dB`);
      }
    }
  }

  // Check compressor solution ranges
  if (problem.solution.compressor) {
    const comp = problem.solution.compressor;
    if (comp.threshold) {
      const [min, max] = comp.threshold;
      if (playerComp.threshold >= min && playerComp.threshold <= max) {
        scores.push(100);
      } else {
        scores.push(0);
        feedback.push(`Threshold should be between ${min} and ${max} dB`);
      }
    }
    if (comp.amount) {
      const [min, max] = comp.amount;
      if (playerComp.amount >= min && playerComp.amount <= max) {
        scores.push(100);
      } else {
        scores.push(0);
        feedback.push(`Compression amount should be between ${min}% and ${max}%`);
      }
    }
  }

  const total = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  return { total, feedback };
}

/**
 * Generate feedback based on EQ scores
 */
function generateEQFeedback(
  scores: { low: number; mid: number; high: number },
  player: EQParams,
  target: { low: number; mid: number; high: number }
): string[] {
  const feedback: string[] = [];

  if (scores.low < 70) {
    const direction = player.low < target.low ? 'boost' : 'cut';
    feedback.push(`Try to ${direction} the low frequencies more`);
  }
  if (scores.mid < 70) {
    const direction = player.mid < target.mid ? 'boost' : 'cut';
    feedback.push(`The mids need more ${direction}`);
  }
  if (scores.high < 70) {
    const direction = player.high < target.high ? 'boost' : 'cut';
    feedback.push(`Adjust the highs - ${direction} a bit more`);
  }

  if (feedback.length === 0 && scores.low >= 70 && scores.mid >= 70 && scores.high >= 70) {
    feedback.push('Good EQ balance!');
  }

  return feedback;
}

/**
 * Generate feedback based on compressor scores
 */
function generateCompressorFeedback(
  scores: { threshold: number; amount: number; attack?: number; release?: number },
  player: CompressorFullParams,
  target: { threshold: number; amount: number; attack?: number; release?: number }
): string[] {
  const feedback: string[] = [];

  if (scores.threshold < 70) {
    const direction = player.threshold < target.threshold ? 'raise' : 'lower';
    feedback.push(`${direction} the threshold`);
  }
  if (scores.amount < 70) {
    const direction = player.amount < target.amount ? 'increase' : 'decrease';
    feedback.push(`${direction} the compression amount`);
  }
  if (scores.attack !== undefined && scores.attack < 70) {
    const direction = player.attack < target.attack! ? 'slower' : 'faster';
    feedback.push(`Try a ${direction} attack`);
  }
  if (scores.release !== undefined && scores.release < 70) {
    const direction = player.release < target.release! ? 'slower' : 'faster';
    feedback.push(`Adjust for a ${direction} release`);
  }

  if (feedback.length === 0) {
    feedback.push('Compression settings look good!');
  }

  return feedback;
}

/**
 * Calculate stars from overall score
 */
function calculateStars(score: number): 1 | 2 | 3 {
  if (score >= 90) return 3;
  if (score >= 75) return 2;
  return 1;
}

/**
 * Main evaluation function for mixing challenges
 */
export function evaluateMixingChallenge(
  challenge: MixingChallenge,
  playerEQ: EQParams,
  playerCompressor: CompressorFullParams
): MixingScoreResult {
  const target = challenge.target;
  const feedback: string[] = [];
  let overall = 0;

  const breakdown: MixingScoreResult['breakdown'] = {};

  if (target.type === 'eq') {
    // EQ matching challenge
    const eqScores = evaluateEQ(playerEQ, target);
    breakdown.eq = eqScores;
    overall = eqScores.total;
    feedback.push(...generateEQFeedback(eqScores, playerEQ, target));
  } else if (target.type === 'compressor') {
    // Compressor matching challenge
    const includeTimings = target.attack !== undefined && target.release !== undefined;
    const compScores = evaluateCompressor(playerCompressor, target, includeTimings);
    breakdown.compressor = compScores;
    overall = compScores.total;
    feedback.push(...generateCompressorFeedback(compScores, playerCompressor, target));
  } else if (target.type === 'problem') {
    // Problem-solving challenge
    const problemResult = evaluateProblem(playerEQ, playerCompressor, target);
    overall = problemResult.total;
    if (problemResult.feedback.length > 0) {
      feedback.push(...problemResult.feedback);
    } else {
      feedback.push('Problem solved correctly!');
    }
  }

  const stars = calculateStars(overall);
  const passed = overall >= 60; // 60% to pass

  return {
    overall,
    stars,
    passed,
    breakdown,
    feedback,
  };
}
