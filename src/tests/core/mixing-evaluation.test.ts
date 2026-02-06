/**
 * Tests for Mixing Evaluation Logic
 */

import { describe, it, expect } from 'vitest';
import { evaluateMixingChallenge } from '../../core/mixing-evaluation.ts';
import type { MixingChallenge, EQParams, CompressorFullParams } from '../../core/types.ts';

// Default test params
const defaultEQ: EQParams = { low: 0, mid: 0, high: 0 };
const defaultCompressor: CompressorFullParams = {
  threshold: -20,
  amount: 50,
  attack: 0.01,
  release: 0.1,
};

describe('evaluateMixingChallenge', () => {
  describe('EQ target matching', () => {
    const eqChallenge: MixingChallenge = {
      id: 'test-eq',
      title: 'Test EQ',
      description: 'Match the EQ',
      difficulty: 1,
      module: 'F1',
      sourceConfig: { type: 'tone', frequency: 440 },
      target: { type: 'eq', low: 3, mid: 0, high: -3 },
      hints: [],
      controls: { eq: true, compressor: false },
    };

    it('scores 100 when EQ matches exactly', () => {
      const playerEQ = { low: 3, mid: 0, high: -3 };
      const result = evaluateMixingChallenge(eqChallenge, playerEQ, defaultCompressor);

      expect(result.overall).toBe(100);
      expect(result.stars).toBe(3);
      expect(result.passed).toBe(true);
    });

    it('scores high when EQ is close', () => {
      const playerEQ = { low: 2.5, mid: 0.3, high: -2.5 };
      const result = evaluateMixingChallenge(eqChallenge, playerEQ, defaultCompressor);

      expect(result.overall).toBeGreaterThan(80);
      expect(result.passed).toBe(true);
    });

    it('scores low when EQ is far off', () => {
      const playerEQ = { low: -6, mid: 6, high: 6 };
      const result = evaluateMixingChallenge(eqChallenge, playerEQ, defaultCompressor);

      expect(result.overall).toBeLessThan(50);
      expect(result.passed).toBe(false);
    });

    it('provides feedback for incorrect bands', () => {
      const playerEQ = { low: -3, mid: 0, high: 3 }; // Opposite of target
      const result = evaluateMixingChallenge(eqChallenge, playerEQ, defaultCompressor);

      expect(result.feedback.length).toBeGreaterThan(0);
      expect(result.feedback.some((f) => f.includes('low'))).toBe(true);
    });
  });

  describe('Compressor target matching', () => {
    const compChallenge: MixingChallenge = {
      id: 'test-comp',
      title: 'Test Compressor',
      description: 'Match the compression',
      difficulty: 1,
      module: 'F4',
      sourceConfig: { type: 'drum' },
      target: { type: 'compressor', threshold: -18, amount: 60 },
      hints: [],
      controls: { eq: false, compressor: 'simple' },
    };

    it('scores 100 when compressor matches exactly', () => {
      const playerComp = { ...defaultCompressor, threshold: -18, amount: 60 };
      const result = evaluateMixingChallenge(compChallenge, defaultEQ, playerComp);

      expect(result.overall).toBe(100);
      expect(result.stars).toBe(3);
      expect(result.passed).toBe(true);
    });

    it('scores high when compressor is close', () => {
      const playerComp = { ...defaultCompressor, threshold: -16, amount: 55 };
      const result = evaluateMixingChallenge(compChallenge, defaultEQ, playerComp);

      expect(result.overall).toBeGreaterThanOrEqual(60);
      expect(result.passed).toBe(true);
    });

    it('scores low when compressor is far off', () => {
      const playerComp = { ...defaultCompressor, threshold: 0, amount: 0 };
      const result = evaluateMixingChallenge(compChallenge, defaultEQ, playerComp);

      expect(result.overall).toBeLessThan(50);
      expect(result.passed).toBe(false);
    });
  });

  describe('Compressor with attack/release (F5)', () => {
    const f5Challenge: MixingChallenge = {
      id: 'test-f5',
      title: 'Test F5',
      description: 'Match attack and release',
      difficulty: 2,
      module: 'F5',
      sourceConfig: { type: 'drum' },
      target: {
        type: 'compressor',
        threshold: -20,
        amount: 50,
        attack: 0.02,
        release: 0.15,
      },
      hints: [],
      controls: { eq: false, compressor: 'full' },
    };

    it('scores 100 when all params match', () => {
      const playerComp = {
        threshold: -20,
        amount: 50,
        attack: 0.02,
        release: 0.15,
      };
      const result = evaluateMixingChallenge(f5Challenge, defaultEQ, playerComp);

      expect(result.overall).toBe(100);
      expect(result.breakdown.compressor?.attack).toBe(100);
      expect(result.breakdown.compressor?.release).toBe(100);
    });
  });

  describe('Problem solving challenges', () => {
    const problemChallenge: MixingChallenge = {
      id: 'test-problem',
      title: 'Fix the Problem',
      description: 'Fix the muddy bass',
      difficulty: 2,
      module: 'F6',
      sourceConfig: { type: 'bass', frequency: 55 },
      target: {
        type: 'problem',
        description: 'Muddy bass',
        solution: {
          eq: { low: [-3, 0] }, // Cut lows by 0-3 dB
        },
      },
      hints: [],
      controls: { eq: true, compressor: false },
    };

    it('passes when solution is within range', () => {
      const playerEQ = { low: -2, mid: 0, high: 0 };
      const result = evaluateMixingChallenge(problemChallenge, playerEQ, defaultCompressor);

      expect(result.overall).toBe(100);
      expect(result.passed).toBe(true);
    });

    it('fails when solution is outside range', () => {
      const playerEQ = { low: 3, mid: 0, high: 0 }; // Boosting instead of cutting
      const result = evaluateMixingChallenge(problemChallenge, playerEQ, defaultCompressor);

      expect(result.overall).toBe(0);
      expect(result.passed).toBe(false);
      expect(result.feedback.some((f) => f.includes('Low EQ'))).toBe(true);
    });
  });

  describe('Multi-track goal evaluation', () => {
    const multiTrackChallenge: MixingChallenge = {
      id: 'test-multitrack',
      title: 'Balance the Mix',
      description: 'Create separation',
      difficulty: 2,
      module: 'I1',
      tracks: [
        { id: 'kick', name: 'Kick', sourceConfig: { type: 'drum' }, color: '#f00' },
        { id: 'bass', name: 'Bass', sourceConfig: { type: 'bass', frequency: 55 }, color: '#00f' },
      ],
      target: {
        type: 'multitrack-goal',
        description: 'Separate kick and bass',
        conditions: [
          { type: 'frequency_separation', track1: 'kick', track2: 'bass', band: 'low' },
          { type: 'pan_position', track: 'bass', position: 'center' },
        ],
      },
      hints: [],
      controls: { eq: true, compressor: false, pan: true },
    };

    it('passes when all conditions are met', () => {
      const trackParams = {
        kick: { low: 2, mid: 0, high: 0, pan: 0, volume: 0 },
        bass: { low: -2, mid: 0, high: 0, pan: 0, volume: 0 }, // Cut lows = separation
      };
      const result = evaluateMixingChallenge(
        multiTrackChallenge,
        defaultEQ,
        defaultCompressor,
        trackParams
      );

      expect(result.overall).toBe(100);
      expect(result.passed).toBe(true);
      expect(result.breakdown.conditions?.every((c) => c.passed)).toBe(true);
    });

    it('fails when conditions are not met', () => {
      const trackParams = {
        kick: { low: 3, mid: 0, high: 0, pan: 0, volume: 0 },
        bass: { low: 3, mid: 0, high: 0, pan: 0.5, volume: 0 }, // Both boosting lows, bass off-center
      };
      const result = evaluateMixingChallenge(
        multiTrackChallenge,
        defaultEQ,
        defaultCompressor,
        trackParams
      );

      expect(result.passed).toBe(false);
      expect(result.breakdown.conditions?.some((c) => !c.passed)).toBe(true);
    });
  });

  describe('Volume conditions', () => {
    const volumeChallenge: MixingChallenge = {
      id: 'test-volume',
      title: 'Balance Levels',
      description: 'Set proper levels',
      difficulty: 1,
      module: 'I3',
      tracks: [
        { id: 'vocal', name: 'Vocal', sourceConfig: { type: 'vocal', frequency: 220 } },
        { id: 'guitar', name: 'Guitar', sourceConfig: { type: 'guitar', frequency: 330 } },
      ],
      target: {
        type: 'multitrack-goal',
        description: 'Vocal louder than guitar',
        conditions: [
          { type: 'volume_louder', track1: 'vocal', track2: 'guitar' },
          { type: 'volume_balanced', track1: 'vocal', track2: 'guitar', tolerance: 6 },
        ],
      },
      hints: [],
      controls: { eq: true, compressor: false, volume: true },
    };

    it('passes when vocal is louder but balanced', () => {
      const trackParams = {
        vocal: { low: 0, mid: 0, high: 0, volume: -6, pan: 0 },
        guitar: { low: 0, mid: 0, high: 0, volume: -10, pan: 0 },
      };
      const result = evaluateMixingChallenge(
        volumeChallenge,
        defaultEQ,
        defaultCompressor,
        trackParams
      );

      expect(result.passed).toBe(true);
    });

    it('fails when guitar is louder', () => {
      const trackParams = {
        vocal: { low: 0, mid: 0, high: 0, volume: -12, pan: 0 },
        guitar: { low: 0, mid: 0, high: 0, volume: -6, pan: 0 },
      };
      const result = evaluateMixingChallenge(
        volumeChallenge,
        defaultEQ,
        defaultCompressor,
        trackParams
      );

      expect(result.passed).toBe(false);
    });
  });

  describe('Reverb and depth conditions', () => {
    const depthChallenge: MixingChallenge = {
      id: 'test-depth',
      title: 'Create Depth',
      description: 'Front to back placement',
      difficulty: 2,
      module: 'A3',
      tracks: [
        { id: 'vocal', name: 'Vocal', sourceConfig: { type: 'vocal', frequency: 220 } },
        { id: 'pad', name: 'Pad', sourceConfig: { type: 'pad', frequency: 220 } },
      ],
      target: {
        type: 'multitrack-goal',
        description: 'Vocal front, pad back',
        conditions: [
          { type: 'depth_placement', track: 'vocal', depth: 'front' },
          { type: 'depth_placement', track: 'pad', depth: 'back' },
          { type: 'reverb_contrast', dryTrack: 'vocal', wetTrack: 'pad', minDifference: 30 },
        ],
      },
      hints: [],
      controls: { eq: true, compressor: false, reverb: true },
    };

    it('passes with correct depth placement', () => {
      const trackParams = {
        vocal: { low: 0, mid: 0, high: 0, volume: 0, pan: 0, reverbMix: 10 },
        pad: { low: 0, mid: 0, high: 0, volume: 0, pan: 0, reverbMix: 50 },
      };
      const result = evaluateMixingChallenge(
        depthChallenge,
        defaultEQ,
        defaultCompressor,
        trackParams
      );

      expect(result.passed).toBe(true);
      expect(result.breakdown.conditions?.every((c) => c.passed)).toBe(true);
    });

    it('fails when vocal has too much reverb', () => {
      const trackParams = {
        vocal: { low: 0, mid: 0, high: 0, volume: 0, pan: 0, reverbMix: 40 },
        pad: { low: 0, mid: 0, high: 0, volume: 0, pan: 0, reverbMix: 50 },
      };
      const result = evaluateMixingChallenge(
        depthChallenge,
        defaultEQ,
        defaultCompressor,
        trackParams
      );

      expect(result.passed).toBe(false);
    });
  });

  describe('Bus-level conditions', () => {
    const busChallenge: MixingChallenge = {
      id: 'test-bus',
      title: 'Master Processing',
      description: 'Add bus processing',
      difficulty: 2,
      module: 'M3',
      tracks: [
        { id: 'kick', name: 'Kick', sourceConfig: { type: 'drum' } },
        { id: 'bass', name: 'Bass', sourceConfig: { type: 'bass', frequency: 55 } },
      ],
      target: {
        type: 'multitrack-goal',
        description: 'Glue the mix',
        conditions: [
          { type: 'bus_compression', minAmount: 20 },
          { type: 'bus_eq_boost', band: 'low', minBoost: 1 },
        ],
      },
      hints: [],
      controls: { eq: true, compressor: false, busCompressor: true, busEQ: true },
    };

    it('passes when bus processing meets requirements', () => {
      const trackParams = {
        kick: { low: 0, mid: 0, high: 0, volume: 0, pan: 0 },
        bass: { low: 0, mid: 0, high: 0, volume: 0, pan: 0 },
      };
      const busComp = { ...defaultCompressor, amount: 30 };
      const busEQ = { low: 2, mid: 0, high: 0 };

      const result = evaluateMixingChallenge(
        busChallenge,
        defaultEQ,
        busComp,
        trackParams,
        busEQ
      );

      expect(result.passed).toBe(true);
    });

    it('fails when bus compression is too low', () => {
      const trackParams = {
        kick: { low: 0, mid: 0, high: 0, volume: 0, pan: 0 },
        bass: { low: 0, mid: 0, high: 0, volume: 0, pan: 0 },
      };
      const busComp = { ...defaultCompressor, amount: 10 }; // Below minAmount
      const busEQ = { low: 2, mid: 0, high: 0 };

      const result = evaluateMixingChallenge(
        busChallenge,
        defaultEQ,
        busComp,
        trackParams,
        busEQ
      );

      expect(result.passed).toBe(false);
    });
  });

  describe('Star rating thresholds', () => {
    const simpleChallenge: MixingChallenge = {
      id: 'test-stars',
      title: 'Test',
      description: 'Test',
      difficulty: 1,
      module: 'F1',
      sourceConfig: { type: 'tone', frequency: 440 },
      target: { type: 'eq', low: 0, mid: 0, high: 0 },
      hints: [],
      controls: { eq: true, compressor: false },
    };

    it('gives 3 stars for 90%+ score', () => {
      const result = evaluateMixingChallenge(simpleChallenge, defaultEQ, defaultCompressor);
      expect(result.stars).toBe(3);
      expect(result.overall).toBeGreaterThanOrEqual(90);
    });

    it('gives 2 stars for 75-89% score', () => {
      const playerEQ = { low: 1.5, mid: 0, high: 0 };
      const result = evaluateMixingChallenge(simpleChallenge, playerEQ, defaultCompressor);
      // Score should be around 83%
      expect(result.stars).toBe(2);
    });

    it('gives 1 star for 60-74% score', () => {
      const playerEQ = { low: 2.5, mid: 0, high: 0 };
      const result = evaluateMixingChallenge(simpleChallenge, playerEQ, defaultCompressor);
      expect(result.stars).toBe(1);
    });
  });
});
