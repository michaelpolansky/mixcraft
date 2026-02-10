/**
 * Player Model — Adaptive Curriculum Engine
 *
 * Pure functions for extracting score breakdowns from evaluation results,
 * computing skill scores, identifying weaknesses, and recommending challenges.
 * No React dependencies — used by UI hooks.
 */

import type { ChallengeProgress, ScoreBreakdownData } from './types.ts';
import type { ScoreResult } from './sound-comparison.ts';
import type { MixingScoreResult } from '../ui/stores/mixing-store.ts';
import type { ProductionScoreResult } from './production-evaluation.ts';
import type { SamplingScoreResult } from './sampling-evaluation.ts';
import type { DrumSequencingScoreResult } from '../ui/stores/drum-sequencer-store.ts';

// ============================================
// Breakdown Extractors
// ============================================

/** Extract breakdown from subtractive sound design score result */
export function extractSDBreakdown(result: ScoreResult): ScoreBreakdownData {
  return {
    brightness: result.breakdown.brightness.score,
    attack: result.breakdown.attack.score,
    filter: result.breakdown.filter.score,
    envelope: result.breakdown.envelope.score,
  };
}

/** Extract breakdown from FM synthesis score result (same shape as SD) */
export function extractFMBreakdown(result: ScoreResult): ScoreBreakdownData {
  // FM uses the same ScoreResult but we map to FM-specific fields
  return {
    brightness: result.breakdown.brightness.score,
    harmonicity: result.breakdown.attack.score,
    modulationIndex: result.breakdown.filter.score,
    envelope: result.breakdown.envelope.score,
  };
}

/** Extract breakdown from additive synthesis score result */
export function extractAdditiveBreakdown(result: ScoreResult): ScoreBreakdownData {
  return {
    brightness: result.breakdown.brightness.score,
    harmonicity: result.breakdown.attack.score,
    filter: result.breakdown.filter.score,
    envelope: result.breakdown.envelope.score,
  };
}

/** Extract breakdown from mixing score result */
export function extractMixingBreakdown(result: MixingScoreResult): ScoreBreakdownData {
  const bd = result.breakdown;
  const data: ScoreBreakdownData = {};

  if (bd.eq) {
    data.eqLow = bd.eq.low;
    data.eqMid = bd.eq.mid;
    data.eqHigh = bd.eq.high;
  }
  if (bd.compressor) {
    data.compressor = bd.compressor.total;
  }
  if (bd.conditions) {
    const passed = bd.conditions.filter(c => c.passed).length;
    const total = bd.conditions.length;
    data.conditions = total > 0 ? Math.round((passed / total) * 100) : 100;
  }

  return data;
}

/** Extract breakdown from production score result */
export function extractProductionBreakdown(result: ProductionScoreResult): ScoreBreakdownData {
  const bd = result.breakdown;
  const data: ScoreBreakdownData = {};

  if (bd.layerScores && bd.layerScores.length > 0) {
    const avg = bd.layerScores.reduce((sum, l) => sum + l.score, 0) / bd.layerScores.length;
    // Map layer score average to generic fields
    data.eqLow = Math.round(avg);
  }
  if (bd.conditionResults) {
    const passed = bd.conditionResults.filter(c => c.passed).length;
    const total = bd.conditionResults.length;
    data.conditions = total > 0 ? Math.round((passed / total) * 100) : 100;
  }

  return data;
}

/** Extract breakdown from sampling score result */
export function extractSamplingBreakdown(result: SamplingScoreResult): ScoreBreakdownData {
  return {
    pitch: result.breakdown.pitchScore,
    slice: result.breakdown.sliceScore,
    timing: result.breakdown.timingScore,
    creativity: result.breakdown.creativityScore,
  };
}

/** Extract breakdown from drum sequencing score result */
export function extractDrumBreakdown(result: DrumSequencingScoreResult): ScoreBreakdownData {
  return {
    pattern: result.breakdown.patternScore,
    velocity: result.breakdown.velocityScore,
    swing: result.breakdown.swingScore,
    tempo: result.breakdown.tempoScore,
  };
}

// ============================================
// Skill Scoring
// ============================================

export interface SkillScore {
  /** Key in ScoreBreakdownData */
  skill: keyof ScoreBreakdownData;
  /** Human-readable label */
  label: string;
  /** Average score 0-100 */
  score: number;
  /** Number of challenges contributing to this score */
  sampleCount: number;
  /** Track this skill belongs to */
  track: string;
}

const SKILL_LABELS: Record<keyof ScoreBreakdownData, { label: string; track: string }> = {
  brightness: { label: 'Brightness / Timbre', track: 'sound-design' },
  attack: { label: 'Attack Shaping', track: 'sound-design' },
  filter: { label: 'Filter Control', track: 'sound-design' },
  envelope: { label: 'Envelope Design', track: 'sound-design' },
  harmonicity: { label: 'Harmonicity / FM', track: 'sound-design' },
  modulationIndex: { label: 'Modulation Index', track: 'sound-design' },
  eqLow: { label: 'Low-End EQ', track: 'mixing' },
  eqMid: { label: 'Mid-Range EQ', track: 'mixing' },
  eqHigh: { label: 'High-End EQ', track: 'mixing' },
  compressor: { label: 'Compression', track: 'mixing' },
  conditions: { label: 'Goal Conditions', track: 'mixing' },
  pitch: { label: 'Pitch Control', track: 'sampling' },
  slice: { label: 'Slicing', track: 'sampling' },
  timing: { label: 'Timing', track: 'sampling' },
  creativity: { label: 'Creativity', track: 'sampling' },
  pattern: { label: 'Pattern Accuracy', track: 'drum-sequencing' },
  velocity: { label: 'Velocity Control', track: 'drum-sequencing' },
  swing: { label: 'Swing / Groove', track: 'drum-sequencing' },
  tempo: { label: 'Tempo', track: 'drum-sequencing' },
};

/**
 * Compute average skill scores from all progress entries that have breakdowns.
 * Returns scores sorted weakest-first.
 */
export function computeSkillScores(
  allProgress: Record<string, ChallengeProgress>
): SkillScore[] {
  // Accumulate sums and counts per skill
  const sums: Partial<Record<keyof ScoreBreakdownData, number>> = {};
  const counts: Partial<Record<keyof ScoreBreakdownData, number>> = {};

  for (const progress of Object.values(allProgress)) {
    if (!progress.breakdown) continue;

    for (const [key, value] of Object.entries(progress.breakdown)) {
      if (typeof value !== 'number') continue;
      const k = key as keyof ScoreBreakdownData;
      sums[k] = (sums[k] ?? 0) + value;
      counts[k] = (counts[k] ?? 0) + 1;
    }
  }

  // Build skill scores
  const scores: SkillScore[] = [];
  for (const [key, meta] of Object.entries(SKILL_LABELS)) {
    const k = key as keyof ScoreBreakdownData;
    const count = counts[k];
    if (!count) continue;

    scores.push({
      skill: k,
      label: meta.label,
      score: Math.round((sums[k]! / count)),
      sampleCount: count,
      track: meta.track,
    });
  }

  // Sort weakest first
  scores.sort((a, b) => a.score - b.score);
  return scores;
}

// ============================================
// Weakness Detection
// ============================================

export interface Weakness {
  skill: keyof ScoreBreakdownData;
  label: string;
  score: number;
  track: string;
}

/**
 * Filter skills that are below threshold with enough data.
 */
export function getWeaknesses(
  skills: SkillScore[],
  minSamples = 2,
  maxResults = 3,
  threshold = 80,
): Weakness[] {
  return skills
    .filter(s => s.sampleCount >= minSamples && s.score < threshold)
    .slice(0, maxResults)
    .map(s => ({ skill: s.skill, label: s.label, score: s.score, track: s.track }));
}

// ============================================
// Recommendations
// ============================================

export interface Recommendation {
  challengeId: string;
  title: string;
  module: string;
  reason: string;
  priority: number;
}

/** Maps skill keys to the challenge modules that train them */
const SKILL_TO_MODULES: Partial<Record<keyof ScoreBreakdownData, string[]>> = {
  brightness: ['SD1', 'SD6', 'SD7'],
  attack: ['SD3', 'SD16'],
  filter: ['SD2', 'SD14'],
  envelope: ['SD3', 'SD6'],
  harmonicity: ['SD8'],
  modulationIndex: ['SD8'],
  eqLow: ['F1', 'F2', 'I1', 'A1'],
  eqMid: ['F1', 'F3', 'A1'],
  eqHigh: ['F1', 'F3', 'A1'],
  compressor: ['F4', 'F5', 'A4'],
  conditions: ['I2', 'I3', 'I4', 'A5', 'M1'],
  pitch: ['SM2', 'SM3'],
  slice: ['SM1', 'SM2'],
  timing: ['SM4', 'SM5'],
  creativity: ['SM5', 'SM6'],
  pattern: ['DS1', 'DS2', 'DS5'],
  velocity: ['DS4'],
  swing: ['DS3'],
  tempo: ['DS1', 'DS6'],
};

interface ChallengeEntry {
  id: string;
  title: string;
  module: string;
}

/**
 * Generate challenge recommendations based on weaknesses.
 * Prioritizes: incomplete > 1-star > next uncompleted.
 */
export function getRecommendations(
  weaknesses: Weakness[],
  allProgress: Record<string, ChallengeProgress>,
  allChallenges: ChallengeEntry[],
  max = 5,
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const used = new Set<string>();

  for (const weakness of weaknesses) {
    const modules = SKILL_TO_MODULES[weakness.skill] ?? [];
    const candidates = allChallenges.filter(c => modules.includes(c.module));

    for (const candidate of candidates) {
      if (used.has(candidate.id)) continue;

      const progress = allProgress[candidate.id];

      // Priority: not attempted (3) > 1 star (2) > 2 stars (1)
      let priority = 0;
      if (!progress || !progress.completed) {
        priority = 3;
      } else if (progress.stars === 1) {
        priority = 2;
      } else if (progress.stars === 2) {
        priority = 1;
      } else {
        continue; // 3 stars — skip
      }

      recommendations.push({
        challengeId: candidate.id,
        title: candidate.title,
        module: candidate.module,
        reason: `Improve ${weakness.label.toLowerCase()}`,
        priority,
      });
      used.add(candidate.id);

      if (recommendations.length >= max) break;
    }

    if (recommendations.length >= max) break;
  }

  // Sort by priority descending
  recommendations.sort((a, b) => b.priority - a.priority);
  return recommendations.slice(0, max);
}

/**
 * Generate "Practice More" suggestions from a just-completed challenge's breakdown.
 * Finds weak dimensions (<70%) and recommends related challenges.
 */
export function getPracticeMoreSuggestions(
  currentBreakdown: ScoreBreakdownData | undefined,
  allProgress: Record<string, ChallengeProgress>,
  allChallenges: ChallengeEntry[],
  max = 3,
): Recommendation[] {
  if (!currentBreakdown) return [];

  // Find dimensions where score < 70%
  const weakDimensions: Weakness[] = [];
  for (const [key, value] of Object.entries(currentBreakdown)) {
    if (typeof value !== 'number' || value >= 70) continue;
    const k = key as keyof ScoreBreakdownData;
    const meta = SKILL_LABELS[k];
    if (meta) {
      weakDimensions.push({ skill: k, label: meta.label, score: value, track: meta.track });
    }
  }

  if (weakDimensions.length === 0) return [];

  return getRecommendations(weakDimensions, allProgress, allChallenges, max);
}
