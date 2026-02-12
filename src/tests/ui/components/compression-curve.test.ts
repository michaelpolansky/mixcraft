/**
 * Tests for CompressionCurve pure math helpers
 */

import { describe, it, expect } from 'vitest';
import { outputDb, estimateInputFromGR } from '../../../ui/components/CompressionCurve.tsx';

describe('outputDb', () => {
  const threshold = -20;
  const ratio = 4;
  const knee = 6;

  it('returns input unchanged below threshold - knee/2', () => {
    expect(outputDb(-40, threshold, ratio, knee)).toBe(-40);
    expect(outputDb(-60, threshold, ratio, knee)).toBe(-60);
    expect(outputDb(-24, threshold, ratio, knee)).toBe(-24); // Just below knee region
  });

  it('returns compressed value above threshold + knee/2', () => {
    // Above knee: output = threshold + (input - threshold) / ratio
    // input=-10, threshold=-20, ratio=4: -20 + (-10 - -20)/4 = -20 + 2.5 = -17.5
    expect(outputDb(-10, threshold, ratio, knee)).toBe(-17.5);
    // input=0: -20 + (0 - -20)/4 = -20 + 5 = -15
    expect(outputDb(0, threshold, ratio, knee)).toBe(-15);
  });

  it('is continuous at knee boundaries', () => {
    const lowerKnee = threshold - knee / 2; // -23
    const upperKnee = threshold + knee / 2; // -17

    // Just below and at lower knee boundary
    const belowLower = outputDb(lowerKnee - 0.001, threshold, ratio, knee);
    const atLower = outputDb(lowerKnee, threshold, ratio, knee);
    expect(Math.abs(belowLower - atLower)).toBeLessThan(0.01);

    // Just at and above upper knee boundary
    const atUpper = outputDb(upperKnee, threshold, ratio, knee);
    const aboveUpper = outputDb(upperKnee + 0.001, threshold, ratio, knee);
    expect(Math.abs(atUpper - aboveUpper)).toBeLessThan(0.01);
  });

  it('matches 1:1 line at ratio=1', () => {
    expect(outputDb(-40, threshold, 1, knee)).toBe(-40);
    expect(outputDb(-20, threshold, 1, knee)).toBe(-20);
    expect(outputDb(-10, threshold, 1, knee)).toBe(-10);
    expect(outputDb(0, threshold, 1, knee)).toBe(0);
  });

  it('barely increases above threshold at ratio=20', () => {
    // At ratio=20, input=0: threshold + (0 - threshold)/20 = -20 + 1 = -19
    const out = outputDb(0, threshold, 20, knee);
    expect(out).toBeCloseTo(-19, 0);
    // Output barely moves above threshold
    expect(out - threshold).toBeLessThan(2);
  });

  it('handles knee=0 as hard knee', () => {
    // With knee=0, should transition sharply at threshold
    const belowThresh = outputDb(-25, threshold, ratio, 0);
    expect(belowThresh).toBe(-25);
    const aboveThresh = outputDb(-10, threshold, ratio, 0);
    expect(aboveThresh).toBe(-17.5);
  });
});

describe('estimateInputFromGR', () => {
  const threshold = -20;
  const ratio = 4;

  it('returns threshold when GR is 0', () => {
    expect(estimateInputFromGR(0, threshold, ratio)).toBe(threshold);
  });

  it('returns threshold when ratio is 1', () => {
    expect(estimateInputFromGR(-6, threshold, 1)).toBe(threshold);
  });

  it('returns correct input for known GR values', () => {
    // GR at input=-10: output = -17.5, so GR = -17.5 - (-10) = -7.5
    // Inverse: input = threshold + |GR| / (1 - 1/ratio) = -20 + 7.5 / 0.75 = -10
    const input = estimateInputFromGR(-7.5, threshold, ratio);
    expect(input).toBeCloseTo(-10, 1);
  });

  it('clamps to valid range', () => {
    // Very large GR should not produce input above 0
    const input = estimateInputFromGR(-100, threshold, ratio);
    expect(input).toBeLessThanOrEqual(0);
    expect(input).toBeGreaterThanOrEqual(-60);
  });
});
