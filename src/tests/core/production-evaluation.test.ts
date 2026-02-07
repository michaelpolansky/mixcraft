/**
 * Tests for Production Evaluation Logic
 */

import { describe, it, expect } from 'vitest';
import { evaluateProductionChallenge } from '../../core/production-evaluation.ts';
import type { ProductionChallenge } from '../../core/types.ts';
import type { LayerState } from '../../core/production-source.ts';

// Helper to create layer states
function createLayerState(overrides: Partial<LayerState> & { id: string; name: string }): LayerState {
  return {
    id: overrides.id,
    name: overrides.name,
    volume: overrides.volume ?? 0,
    pan: overrides.pan ?? 0,
    muted: overrides.muted ?? false,
    solo: overrides.solo ?? false,
    eqLow: overrides.eqLow ?? 0,
    eqHigh: overrides.eqHigh ?? 0,
  };
}

describe('evaluateProductionChallenge', () => {
  describe('Reference matching (P1-P2)', () => {
    const referenceChallenge: ProductionChallenge = {
      id: 'test-reference',
      title: 'Match the Reference',
      description: 'Match volume and mute states',
      difficulty: 1,
      module: 'P1',
      layers: [
        { id: 'kick', name: 'Kick', sourceConfig: { type: 'drum' }, initialVolume: 0 },
        { id: 'bass', name: 'Bass', sourceConfig: { type: 'bass' }, initialVolume: 0 },
      ],
      target: {
        type: 'reference',
        layers: [
          { volume: -6, muted: false },
          { volume: -10, muted: false },
        ],
      },
      availableControls: { volume: true, mute: true, pan: false, eq: false },
      hints: [],
    };

    it('scores 100 when all layers match exactly', () => {
      const states: LayerState[] = [
        createLayerState({ id: 'kick', name: 'Kick', volume: -6, muted: false }),
        createLayerState({ id: 'bass', name: 'Bass', volume: -10, muted: false }),
      ];

      const result = evaluateProductionChallenge(referenceChallenge, states);

      expect(result.overall).toBe(100);
      expect(result.stars).toBe(3);
      expect(result.passed).toBe(true);
    });

    it('scores high when layers are close', () => {
      const states: LayerState[] = [
        createLayerState({ id: 'kick', name: 'Kick', volume: -5, muted: false }),
        createLayerState({ id: 'bass', name: 'Bass', volume: -9, muted: false }),
      ];

      const result = evaluateProductionChallenge(referenceChallenge, states);

      expect(result.overall).toBeGreaterThan(80);
      expect(result.passed).toBe(true);
    });

    it('penalizes wrong mute state', () => {
      const states: LayerState[] = [
        createLayerState({ id: 'kick', name: 'Kick', volume: -6, muted: true }), // Wrong!
        createLayerState({ id: 'bass', name: 'Bass', volume: -10, muted: false }),
      ];

      const result = evaluateProductionChallenge(referenceChallenge, states);

      expect(result.overall).toBeLessThan(80);
    });

    it('scores low when volumes are far off', () => {
      const states: LayerState[] = [
        createLayerState({ id: 'kick', name: 'Kick', volume: 6, muted: false }),
        createLayerState({ id: 'bass', name: 'Bass', volume: 6, muted: false }),
      ];

      const result = evaluateProductionChallenge(referenceChallenge, states);

      expect(result.overall).toBeLessThan(60);
      expect(result.passed).toBe(false);
    });
  });

  describe('Reference with pan and EQ', () => {
    const fullRefChallenge: ProductionChallenge = {
      id: 'test-full-ref',
      title: 'Full Reference Match',
      description: 'Match everything',
      difficulty: 2,
      module: 'P2',
      layers: [
        { id: 'guitar', name: 'Guitar', sourceConfig: { type: 'guitar' }, initialVolume: 0 },
      ],
      target: {
        type: 'reference',
        layers: [{ volume: -8, muted: false, pan: -0.5, eqLow: -3, eqHigh: 2 }],
      },
      availableControls: { volume: true, mute: true, pan: true, eq: true },
      hints: [],
    };

    it('includes pan and EQ in scoring', () => {
      const states: LayerState[] = [
        createLayerState({
          id: 'guitar',
          name: 'Guitar',
          volume: -8,
          muted: false,
          pan: -0.5,
          eqLow: -3,
          eqHigh: 2,
        }),
      ];

      const result = evaluateProductionChallenge(fullRefChallenge, states);

      expect(result.overall).toBe(100);
    });

    it('penalizes wrong pan', () => {
      const states: LayerState[] = [
        createLayerState({
          id: 'guitar',
          name: 'Guitar',
          volume: -8,
          muted: false,
          pan: 0.5, // Wrong - should be -0.5
          eqLow: -3,
          eqHigh: 2,
        }),
      ];

      const result = evaluateProductionChallenge(fullRefChallenge, states);

      expect(result.overall).toBeLessThan(90);
    });
  });

  describe('Goal-based evaluation (P3-P5)', () => {
    const goalChallenge: ProductionChallenge = {
      id: 'test-goal',
      title: 'Goal Challenge',
      description: 'Meet the goals',
      difficulty: 2,
      module: 'P3',
      layers: [
        { id: 'kick', name: 'Kick', sourceConfig: { type: 'drum' }, initialVolume: 0 },
        { id: 'snare', name: 'Snare', sourceConfig: { type: 'snare' }, initialVolume: 0 },
        { id: 'hihat', name: 'Hi-Hat', sourceConfig: { type: 'hihat' }, initialVolume: 0 },
      ],
      target: {
        type: 'goal',
        description: 'Build a groove',
        conditions: [
          { type: 'level_order', louder: 'kick', quieter: 'hihat' },
          { type: 'layer_active', layerId: 'snare', active: true },
        ],
      },
      availableControls: { volume: true, mute: true, pan: false, eq: false },
      hints: [],
    };

    it('passes when all conditions are met', () => {
      const states: LayerState[] = [
        createLayerState({ id: 'kick', name: 'Kick', volume: -6, muted: false }),
        createLayerState({ id: 'snare', name: 'Snare', volume: -8, muted: false }),
        createLayerState({ id: 'hihat', name: 'Hi-Hat', volume: -12, muted: false }),
      ];

      const result = evaluateProductionChallenge(goalChallenge, states);

      expect(result.overall).toBe(100);
      expect(result.passed).toBe(true);
      expect(result.breakdown.conditionResults?.every((c) => c.passed)).toBe(true);
    });

    it('fails when kick is quieter than hihat', () => {
      const states: LayerState[] = [
        createLayerState({ id: 'kick', name: 'Kick', volume: -18, muted: false }),
        createLayerState({ id: 'snare', name: 'Snare', volume: -8, muted: false }),
        createLayerState({ id: 'hihat', name: 'Hi-Hat', volume: -6, muted: false }),
      ];

      const result = evaluateProductionChallenge(goalChallenge, states);

      expect(result.overall).toBe(50); // 1 of 2 conditions met
      expect(result.passed).toBe(false);
    });

    it('fails when snare is muted', () => {
      const states: LayerState[] = [
        createLayerState({ id: 'kick', name: 'Kick', volume: -6, muted: false }),
        createLayerState({ id: 'snare', name: 'Snare', volume: -8, muted: true }), // Muted!
        createLayerState({ id: 'hihat', name: 'Hi-Hat', volume: -12, muted: false }),
      ];

      const result = evaluateProductionChallenge(goalChallenge, states);

      expect(result.overall).toBe(50);
      expect(result.passed).toBe(false);
    });
  });

  describe('level_order with muting', () => {
    const levelChallenge: ProductionChallenge = {
      id: 'test-level',
      title: 'Level Order',
      description: 'Order by level',
      difficulty: 1,
      module: 'P3',
      layers: [
        { id: 'a', name: 'A', sourceConfig: { type: 'tone' }, initialVolume: 0 },
        { id: 'b', name: 'B', sourceConfig: { type: 'tone' }, initialVolume: 0 },
      ],
      target: {
        type: 'goal',
        description: 'A louder than B',
        conditions: [{ type: 'level_order', louder: 'a', quieter: 'b' }],
      },
      availableControls: { volume: true, mute: true, pan: false, eq: false },
      hints: [],
    };

    it('muted layer counts as -Infinity volume', () => {
      const states: LayerState[] = [
        createLayerState({ id: 'a', name: 'A', volume: -20, muted: false }),
        createLayerState({ id: 'b', name: 'B', volume: 0, muted: true }), // Louder but muted
      ];

      const result = evaluateProductionChallenge(levelChallenge, states);

      expect(result.passed).toBe(true); // A is louder because B is muted
    });
  });

  describe('pan_spread condition', () => {
    const panChallenge: ProductionChallenge = {
      id: 'test-pan',
      title: 'Pan Spread',
      description: 'Create stereo width',
      difficulty: 2,
      module: 'P4',
      layers: [
        { id: 'left', name: 'Left', sourceConfig: { type: 'guitar' }, initialVolume: 0 },
        { id: 'right', name: 'Right', sourceConfig: { type: 'guitar' }, initialVolume: 0 },
      ],
      target: {
        type: 'goal',
        description: 'Wide stereo',
        conditions: [{ type: 'pan_spread', minWidth: 1.0 }],
      },
      availableControls: { volume: true, mute: true, pan: true, eq: false },
      hints: [],
    };

    it('passes with full stereo spread', () => {
      const states: LayerState[] = [
        createLayerState({ id: 'left', name: 'Left', pan: -1.0, muted: false }),
        createLayerState({ id: 'right', name: 'Right', pan: 1.0, muted: false }),
      ];

      const result = evaluateProductionChallenge(panChallenge, states);

      expect(result.passed).toBe(true);
    });

    it('fails with narrow spread', () => {
      const states: LayerState[] = [
        createLayerState({ id: 'left', name: 'Left', pan: -0.2, muted: false }),
        createLayerState({ id: 'right', name: 'Right', pan: 0.2, muted: false }),
      ];

      const result = evaluateProductionChallenge(panChallenge, states);

      expect(result.passed).toBe(false);
    });

    it('ignores muted layers in spread calculation', () => {
      const states: LayerState[] = [
        createLayerState({ id: 'left', name: 'Left', pan: -1.0, muted: true }), // Muted
        createLayerState({ id: 'right', name: 'Right', pan: 0.0, muted: false }),
      ];

      const result = evaluateProductionChallenge(panChallenge, states);

      expect(result.passed).toBe(false); // Only one active layer, no spread
    });
  });

  describe('relative_level condition', () => {
    const relativeChallenge: ProductionChallenge = {
      id: 'test-relative',
      title: 'Relative Levels',
      description: 'Set relative difference',
      difficulty: 2,
      module: 'P4',
      layers: [
        { id: 'main', name: 'Main', sourceConfig: { type: 'vocal' }, initialVolume: 0 },
        { id: 'backing', name: 'Backing', sourceConfig: { type: 'pad' }, initialVolume: 0 },
      ],
      target: {
        type: 'goal',
        description: 'Main 6-12dB louder than backing',
        conditions: [{ type: 'relative_level', layer1: 'main', layer2: 'backing', difference: [6, 12] }],
      },
      availableControls: { volume: true, mute: true, pan: false, eq: false },
      hints: [],
    };

    it('passes when difference is in range', () => {
      const states: LayerState[] = [
        createLayerState({ id: 'main', name: 'Main', volume: -6 }),
        createLayerState({ id: 'backing', name: 'Backing', volume: -14 }), // 8dB difference
      ];

      const result = evaluateProductionChallenge(relativeChallenge, states);

      expect(result.passed).toBe(true);
    });

    it('fails when difference is too small', () => {
      const states: LayerState[] = [
        createLayerState({ id: 'main', name: 'Main', volume: -6 }),
        createLayerState({ id: 'backing', name: 'Backing', volume: -8 }), // Only 2dB
      ];

      const result = evaluateProductionChallenge(relativeChallenge, states);

      expect(result.passed).toBe(false);
    });

    it('fails when difference is too large', () => {
      const states: LayerState[] = [
        createLayerState({ id: 'main', name: 'Main', volume: -6 }),
        createLayerState({ id: 'backing', name: 'Backing', volume: -24 }), // 18dB
      ];

      const result = evaluateProductionChallenge(relativeChallenge, states);

      expect(result.passed).toBe(false);
    });
  });

  describe('pan_position condition', () => {
    const posChallenge: ProductionChallenge = {
      id: 'test-pos',
      title: 'Pan Position',
      description: 'Place in stereo field',
      difficulty: 1,
      module: 'P4',
      layers: [{ id: 'guitar', name: 'Guitar', sourceConfig: { type: 'guitar' }, initialVolume: 0 }],
      target: {
        type: 'goal',
        description: 'Pan left',
        conditions: [{ type: 'pan_position', layerId: 'guitar', position: [-1, -0.3] }],
      },
      availableControls: { volume: true, mute: true, pan: true, eq: false },
      hints: [],
    };

    it('passes when in range', () => {
      const states: LayerState[] = [createLayerState({ id: 'guitar', name: 'Guitar', pan: -0.7 })];

      const result = evaluateProductionChallenge(posChallenge, states);

      expect(result.passed).toBe(true);
    });

    it('fails when outside range', () => {
      const states: LayerState[] = [createLayerState({ id: 'guitar', name: 'Guitar', pan: 0.5 })];

      const result = evaluateProductionChallenge(posChallenge, states);

      expect(result.passed).toBe(false);
    });
  });

  describe('Feedback generation', () => {
    const feedbackChallenge: ProductionChallenge = {
      id: 'test-feedback',
      title: 'Feedback Test',
      description: 'Check feedback',
      difficulty: 1,
      module: 'P1',
      layers: [{ id: 'test', name: 'Test', sourceConfig: { type: 'tone' }, initialVolume: 0 }],
      target: {
        type: 'reference',
        layers: [{ volume: 0, muted: false }],
      },
      availableControls: { volume: true, mute: true, pan: false, eq: false },
      hints: [],
    };

    it('provides positive feedback for high scores', () => {
      const states: LayerState[] = [createLayerState({ id: 'test', name: 'Test', volume: 0 })];

      const result = evaluateProductionChallenge(feedbackChallenge, states);

      expect(result.feedback[0]).toContain('Excellent');
    });

    it('provides constructive feedback for failing scores', () => {
      const states: LayerState[] = [createLayerState({ id: 'test', name: 'Test', volume: -20 })];

      const result = evaluateProductionChallenge(feedbackChallenge, states);

      expect(result.feedback.some((f) => f.includes('adjustment') || f.includes('reference'))).toBe(
        true
      );
    });
  });

  describe('Star thresholds', () => {
    const starChallenge: ProductionChallenge = {
      id: 'test-stars',
      title: 'Stars',
      description: 'Test stars',
      difficulty: 1,
      module: 'P1',
      layers: [{ id: 'a', name: 'A', sourceConfig: { type: 'tone' }, initialVolume: 0 }],
      target: {
        type: 'reference',
        layers: [{ volume: 0, muted: false }],
      },
      availableControls: { volume: true, mute: true, pan: false, eq: false },
      hints: [],
    };

    it('gives 3 stars for 90%+', () => {
      const states: LayerState[] = [createLayerState({ id: 'a', name: 'A', volume: 0 })];
      const result = evaluateProductionChallenge(starChallenge, states);
      expect(result.stars).toBe(3);
    });

    it('gives 2 stars for 75-89%', () => {
      const states: LayerState[] = [createLayerState({ id: 'a', name: 'A', volume: -4 })];
      const result = evaluateProductionChallenge(starChallenge, states);
      expect(result.stars).toBe(2);
    });

    it('gives 1 star for passing scores below 75%', () => {
      const states: LayerState[] = [createLayerState({ id: 'a', name: 'A', volume: -8 })];
      const result = evaluateProductionChallenge(starChallenge, states);
      expect(result.stars).toBe(1);
      expect(result.passed).toBe(true);
    });
  });
});
