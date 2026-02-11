/**
 * Tests for Parametric EQ types, defaults, and evaluation conversion
 *
 * MixingParametricEQ class requires Web Audio API (Tone.js) and is not unit-testable
 * here. These tests cover the pure-function conversion logic and type invariants.
 */

import { describe, it, expect } from 'vitest';
import {
  DEFAULT_PARAMETRIC_BANDS,
  DEFAULT_PARAMETRIC_EQ,
  PARAMETRIC_EQ_RANGES,
} from '../../core/mixing-effects.ts';
import { parametricToEffective3Band } from '../../core/mixing-evaluation.ts';
import type { ParametricBand, ParametricEQParams } from '../../core/types.ts';

/** Helper to build a ParametricEQParams from partial band overrides */
function makeParams(
  overrides: Partial<Record<0 | 1 | 2 | 3, Partial<ParametricBand>>>
): ParametricEQParams {
  const bands = DEFAULT_PARAMETRIC_BANDS.map((b, i) => ({
    ...b,
    ...(overrides[i as 0 | 1 | 2 | 3] ?? {}),
  })) as [ParametricBand, ParametricBand, ParametricBand, ParametricBand];
  return { bands };
}

// ============================================================
// Defaults & Constants
// ============================================================

describe('Parametric EQ defaults', () => {
  it('DEFAULT_PARAMETRIC_BANDS has 4 bands', () => {
    expect(DEFAULT_PARAMETRIC_BANDS).toHaveLength(4);
  });

  it('band types are lowshelf, peaking, peaking, highshelf', () => {
    expect(DEFAULT_PARAMETRIC_BANDS.map((b) => b.type)).toEqual([
      'lowshelf',
      'peaking',
      'peaking',
      'highshelf',
    ]);
  });

  it('default frequencies are 200, 800, 3000, 8000 Hz', () => {
    expect(DEFAULT_PARAMETRIC_BANDS.map((b) => b.frequency)).toEqual([200, 800, 3000, 8000]);
  });

  it('all default gains are 0 (flat)', () => {
    expect(DEFAULT_PARAMETRIC_BANDS.every((b) => b.gain === 0)).toBe(true);
  });

  it('DEFAULT_PARAMETRIC_EQ wraps bands tuple', () => {
    expect(DEFAULT_PARAMETRIC_EQ.bands).toHaveLength(4);
    expect(DEFAULT_PARAMETRIC_EQ.bands[0]!.type).toBe('lowshelf');
  });

  it('PARAMETRIC_EQ_RANGES are sensible', () => {
    expect(PARAMETRIC_EQ_RANGES.frequency.min).toBe(20);
    expect(PARAMETRIC_EQ_RANGES.frequency.max).toBe(20000);
    expect(PARAMETRIC_EQ_RANGES.gain.min).toBe(-12);
    expect(PARAMETRIC_EQ_RANGES.gain.max).toBe(12);
    expect(PARAMETRIC_EQ_RANGES.Q.min).toBe(0.3);
    expect(PARAMETRIC_EQ_RANGES.Q.max).toBe(12);
  });
});

// ============================================================
// parametricToEffective3Band
// ============================================================

describe('parametricToEffective3Band', () => {
  describe('flat / no boost', () => {
    it('all gains at 0 returns flat 3-band', () => {
      const result = parametricToEffective3Band(DEFAULT_PARAMETRIC_EQ);
      expect(result).toEqual({ low: 0, mid: 0, high: 0 });
    });
  });

  describe('low shelf boost', () => {
    it('low shelf boost registers as low gain', () => {
      // Band 0: lowshelf @ 200Hz, +6 dB
      const result = parametricToEffective3Band(makeParams({ 0: { gain: 6 } }));
      expect(result.low).toBe(6); // Measurement at 200Hz, shelf center is 200Hz
      expect(result.mid).toBeLessThan(result.low); // Decays above shelf freq
      expect(result.high).toBeLessThanOrEqual(result.mid); // Further decay or same
    });

    it('low shelf cut registers as negative low gain', () => {
      const result = parametricToEffective3Band(makeParams({ 0: { gain: -8 } }));
      expect(result.low).toBe(-8);
      expect(result.mid).toBeGreaterThan(result.low); // Less cut further away
    });
  });

  describe('high shelf boost', () => {
    it('high shelf boost registers as high gain', () => {
      // Band 3: highshelf @ 8000Hz, +6 dB
      // Measurement at 5000Hz is below shelf center (8kHz) — gets partial influence
      const result = parametricToEffective3Band(makeParams({ 3: { gain: 6 } }));
      expect(result.high).toBeGreaterThan(0);
      expect(result.high).toBeLessThanOrEqual(6);
      expect(result.low).toBeLessThan(result.high);
    });

    it('high shelf cut registers as negative high gain', () => {
      const result = parametricToEffective3Band(makeParams({ 3: { gain: -10 } }));
      expect(result.high).toBeLessThan(0);
      expect(result.low).toBeGreaterThan(result.high);
    });
  });

  describe('peaking band boost', () => {
    it('peak at 800Hz boosts mid strongly', () => {
      // Band 1: peaking @ 800Hz, +8 dB, Q=1.0
      const result = parametricToEffective3Band(makeParams({ 1: { gain: 8 } }));
      // Measurement at 1000Hz, band center at 800Hz — within 1 octave, Q=1 so bandwidth=1 oct
      expect(result.mid).toBeGreaterThan(0);
      // Low measurement at 200Hz: ~2 octaves from 800Hz, wider than bandwidth, should be 0 or small
      expect(result.mid).toBeGreaterThan(result.low);
    });

    it('peak at 3000Hz boosts high strongly', () => {
      // Band 2: peaking @ 3000Hz, +8 dB, Q=1.0
      const result = parametricToEffective3Band(makeParams({ 2: { gain: 8 } }));
      // Measurement at 5000Hz is ~0.7 octaves from 3000Hz (within bandwidth=1)
      expect(result.high).toBeGreaterThan(0);
      // Measurement at 1000Hz is ~1.6 octaves away — outside bandwidth
      expect(result.high).toBeGreaterThan(result.mid);
    });

    it('narrow Q restricts influence', () => {
      // High Q (narrow) at 800Hz should primarily affect mid, not low/high
      const narrow = parametricToEffective3Band(
        makeParams({ 1: { gain: 8, Q: 8 } })
      );
      const wide = parametricToEffective3Band(
        makeParams({ 1: { gain: 8, Q: 0.5 } })
      );
      // With narrow Q, low should get less spillover than with wide Q
      expect(narrow.low).toBeLessThanOrEqual(wide.low);
    });
  });

  describe('multiple bands interact', () => {
    it('low shelf + high shelf boost both ends', () => {
      const result = parametricToEffective3Band(
        makeParams({ 0: { gain: 6 }, 3: { gain: 6 } })
      );
      expect(result.low).toBeGreaterThan(0);
      expect(result.high).toBeGreaterThan(0);
      // Mid may also get some spillover from both shelves
    });

    it('opposing bands can cancel out', () => {
      // Boost low shelf, cut peaking at 800Hz — mid region may cancel
      const result = parametricToEffective3Band(
        makeParams({ 0: { gain: 6 }, 1: { gain: -6 } })
      );
      // At mid measurement (1000Hz), low shelf contributes some boost,
      // but peaking cut at 800Hz contributes significant cut
      // The mid value should be less than low value
      expect(result.mid).toBeLessThan(result.low);
    });

    it('all bands boosted produces overall boost', () => {
      const result = parametricToEffective3Band(
        makeParams({ 0: { gain: 6 }, 1: { gain: 6 }, 2: { gain: 6 }, 3: { gain: 6 } })
      );
      expect(result.low).toBeGreaterThan(0);
      expect(result.mid).toBeGreaterThan(0);
      expect(result.high).toBeGreaterThan(0);
    });
  });

  describe('clamping', () => {
    it('output is clamped to [-12, 12]', () => {
      // Extreme: all bands at +12 all contributing to one region
      const result = parametricToEffective3Band(
        makeParams({ 0: { gain: 12 }, 1: { gain: 12 }, 2: { gain: 12 }, 3: { gain: 12 } })
      );
      expect(result.low).toBeLessThanOrEqual(12);
      expect(result.mid).toBeLessThanOrEqual(12);
      expect(result.high).toBeLessThanOrEqual(12);
    });

    it('output is clamped on negative side', () => {
      const result = parametricToEffective3Band(
        makeParams({ 0: { gain: -12 }, 1: { gain: -12 }, 2: { gain: -12 }, 3: { gain: -12 } })
      );
      expect(result.low).toBeGreaterThanOrEqual(-12);
      expect(result.mid).toBeGreaterThanOrEqual(-12);
      expect(result.high).toBeGreaterThanOrEqual(-12);
    });
  });

  describe('symmetry and rounding', () => {
    it('returns rounded values (1 decimal place)', () => {
      const result = parametricToEffective3Band(
        makeParams({ 1: { gain: 3 } })
      );
      // All values should be rounded to 1 decimal place
      expect(result.low).toBe(Math.round(result.low * 10) / 10);
      expect(result.mid).toBe(Math.round(result.mid * 10) / 10);
      expect(result.high).toBe(Math.round(result.high * 10) / 10);
    });

    it('equal boost/cut magnitude produces symmetric results', () => {
      const boost = parametricToEffective3Band(makeParams({ 0: { gain: 6 } }));
      const cut = parametricToEffective3Band(makeParams({ 0: { gain: -6 } }));
      // Use closeTo to handle +0/-0 edge case from rounding
      expect(boost.low).toBeCloseTo(-cut.low, 5);
      expect(boost.mid).toBeCloseTo(-cut.mid, 5);
      expect(boost.high).toBeCloseTo(-cut.high, 5);
    });
  });
});
