/**
 * Production Challenge Evaluation
 * Scoring logic for reference matching and goal-based evaluation
 */

import type {
  ProductionChallenge,
  ProductionReferenceTarget,
  ProductionGoalTarget,
  ProductionCondition,
} from './types.ts';
import type { LayerState } from './production-source.ts';

/**
 * Score result for production challenges
 */
export interface ProductionScoreResult {
  overall: number;           // 0-100
  stars: 1 | 2 | 3;
  passed: boolean;
  breakdown: {
    type: 'reference' | 'goal';
    layerScores?: { id: string; name: string; score: number }[];
    conditionResults?: { description: string; passed: boolean }[];
  };
  feedback: string[];
}

/**
 * Tolerance values for reference matching
 */
const TOLERANCES = {
  volume: 3,    // ±3 dB
  pan: 0.2,     // ±0.2
  eq: 2,        // ±2 dB
};

/**
 * Calculate similarity score between two values with tolerance
 */
function scoreSimilarity(actual: number, target: number, tolerance: number): number {
  const diff = Math.abs(actual - target);
  if (diff <= tolerance) {
    // Within tolerance: 70-100 based on how close
    return 100 - (diff / tolerance) * 30;
  } else {
    // Outside tolerance: 0-70 based on distance
    const maxDiff = tolerance * 5; // Beyond 5x tolerance is 0
    const ratio = Math.min(diff / maxDiff, 1);
    return 70 * (1 - ratio);
  }
}

/**
 * Evaluate a reference matching challenge
 */
function evaluateReference(
  target: ProductionReferenceTarget,
  states: LayerState[],
  challenge: ProductionChallenge
): ProductionScoreResult {
  const layerScores: { id: string; name: string; score: number }[] = [];
  const feedback: string[] = [];

  for (let i = 0; i < states.length; i++) {
    const state = states[i];
    const targetLayer = target.layers[i];
    if (!state || !targetLayer) continue;

    let layerScore = 0;
    let components = 0;

    // Volume score
    const volumeScore = scoreSimilarity(state.volume, targetLayer.volume, TOLERANCES.volume);
    layerScore += volumeScore;
    components++;

    // Mute state (binary)
    const muteCorrect = state.muted === targetLayer.muted;
    layerScore += muteCorrect ? 100 : 0;
    components++;

    // Pan score (if applicable)
    if (targetLayer.pan !== undefined && challenge.availableControls.pan) {
      const panScore = scoreSimilarity(state.pan, targetLayer.pan, TOLERANCES.pan);
      layerScore += panScore;
      components++;
    }

    // EQ scores (if applicable)
    if (challenge.availableControls.eq) {
      if (targetLayer.eqLow !== undefined) {
        const eqLowScore = scoreSimilarity(state.eqLow, targetLayer.eqLow, TOLERANCES.eq);
        layerScore += eqLowScore;
        components++;
      }
      if (targetLayer.eqHigh !== undefined) {
        const eqHighScore = scoreSimilarity(state.eqHigh, targetLayer.eqHigh, TOLERANCES.eq);
        layerScore += eqHighScore;
        components++;
      }
    }

    const avgScore = components > 0 ? layerScore / components : 0;
    layerScores.push({ id: state.id, name: state.name, score: avgScore });

    // Generate feedback
    if (avgScore < 60) {
      feedback.push(`${state.name} needs adjustment`);
    } else if (avgScore < 85) {
      feedback.push(`${state.name} is close, fine-tune it`);
    }
  }

  // Calculate overall score
  const overall = layerScores.reduce((sum, l) => sum + l.score, 0) / layerScores.length;
  const passed = overall >= 60;
  const stars = overall >= 90 ? 3 : overall >= 75 ? 2 : 1;

  if (overall >= 90) {
    feedback.unshift('Excellent balance!');
  } else if (overall >= 75) {
    feedback.unshift('Good work, getting close!');
  } else if (passed) {
    feedback.unshift('Keep refining the balance');
  } else {
    feedback.unshift('Listen to the reference again');
  }

  return {
    overall: Math.round(overall),
    stars: stars as 1 | 2 | 3,
    passed,
    breakdown: {
      type: 'reference',
      layerScores,
    },
    feedback,
  };
}

/**
 * Check a single condition
 */
function checkCondition(condition: ProductionCondition, states: LayerState[]): boolean {
  const getState = (id: string) => states.find((s) => s.id === id);

  switch (condition.type) {
    case 'level_order': {
      const louder = getState(condition.louder);
      const quieter = getState(condition.quieter);
      if (!louder || !quieter) return false;
      // Account for muting
      const louderLevel = louder.muted ? -Infinity : louder.volume;
      const quieterLevel = quieter.muted ? -Infinity : quieter.volume;
      return louderLevel > quieterLevel;
    }

    case 'pan_spread': {
      const panValues = states.filter((s) => !s.muted).map((s) => s.pan);
      if (panValues.length < 2) return false;
      const min = Math.min(...panValues);
      const max = Math.max(...panValues);
      return max - min >= condition.minWidth;
    }

    case 'layer_active': {
      const layer = getState(condition.layerId);
      if (!layer) return false;
      const isActive = !layer.muted;
      return isActive === condition.active;
    }

    case 'layer_muted': {
      const layer = getState(condition.layerId);
      if (!layer) return false;
      return layer.muted === condition.muted;
    }

    case 'relative_level': {
      const layer1 = getState(condition.layer1);
      const layer2 = getState(condition.layer2);
      if (!layer1 || !layer2) return false;
      const diff = layer1.volume - layer2.volume;
      const [min, max] = condition.difference;
      return diff >= min && diff <= max;
    }

    case 'pan_position': {
      const layer = getState(condition.layerId);
      if (!layer) return false;
      const [min, max] = condition.position;
      return layer.pan >= min && layer.pan <= max;
    }

    default:
      return false;
  }
}

/**
 * Get a human-readable description of a condition
 */
function describeCondition(condition: ProductionCondition): string {
  switch (condition.type) {
    case 'level_order':
      return `${condition.louder} louder than ${condition.quieter}`;
    case 'pan_spread':
      return `Stereo width at least ${condition.minWidth}`;
    case 'layer_active':
      return condition.active
        ? `${condition.layerId} is playing`
        : `${condition.layerId} is not playing`;
    case 'layer_muted':
      return condition.muted
        ? `${condition.layerId} is muted`
        : `${condition.layerId} is unmuted`;
    case 'relative_level':
      return `${condition.layer1} level relative to ${condition.layer2}`;
    case 'pan_position':
      return `${condition.layerId} panned correctly`;
    default:
      return 'Unknown condition';
  }
}

/**
 * Evaluate a goal-based challenge
 */
function evaluateGoal(
  target: ProductionGoalTarget,
  states: LayerState[]
): ProductionScoreResult {
  const conditionResults: { description: string; passed: boolean }[] = [];
  const feedback: string[] = [];

  for (const condition of target.conditions) {
    const passed = checkCondition(condition, states);
    conditionResults.push({
      description: describeCondition(condition),
      passed,
    });

    if (!passed) {
      feedback.push(`Not met: ${describeCondition(condition)}`);
    }
  }

  // Calculate score based on conditions met
  const passedCount = conditionResults.filter((c) => c.passed).length;
  const overall = (passedCount / conditionResults.length) * 100;
  const passed = overall >= 60;
  const stars = overall >= 90 ? 3 : overall >= 75 ? 2 : 1;

  if (overall >= 90) {
    feedback.unshift('All goals met!');
  } else if (overall >= 75) {
    feedback.unshift('Almost there!');
  } else if (passed) {
    feedback.unshift('Good start, keep going');
  } else {
    feedback.unshift('Review the goals and try again');
  }

  return {
    overall: Math.round(overall),
    stars: stars as 1 | 2 | 3,
    passed,
    breakdown: {
      type: 'goal',
      conditionResults,
    },
    feedback,
  };
}

/**
 * Evaluate a production challenge
 */
export function evaluateProductionChallenge(
  challenge: ProductionChallenge,
  states: LayerState[]
): ProductionScoreResult {
  if (challenge.target.type === 'reference') {
    return evaluateReference(challenge.target, states, challenge);
  } else {
    return evaluateGoal(challenge.target, states);
  }
}
