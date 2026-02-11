/**
 * Production Store Tests
 * Tests for layer initialization, clamping, mute/solo, progress, and retry.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ProductionChallenge, ChallengeProgress } from '../../../core/types.ts';
import type { ProductionScoreResult } from '../../../core/production-evaluation.ts';
import { LAYER_RANGES } from '../../../core/production-source.ts';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('../../../core/player-model.ts', () => ({
  extractProductionBreakdown: vi.fn(() => ({ eqLow: 75 })),
}));

import { useProductionStore } from '../../../ui/stores/production-store.ts';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeChallenge(overrides: Partial<ProductionChallenge> = {}): ProductionChallenge {
  return {
    id: 'p1-01',
    title: 'Test Production',
    description: 'Test production challenge',
    difficulty: 1,
    module: 'P1',
    hints: ['Hint 1', 'Hint 2', 'Hint 3'],
    layers: [
      { id: 'kick', name: 'Kick', sourceConfig: { type: 'drum' }, initialVolume: -6, initialPan: 0 },
      { id: 'bass', name: 'Bass', sourceConfig: { type: 'bass' }, initialVolume: 0, initialPan: -0.3, initialMuted: true },
    ],
    target: { type: 'goal', conditions: [] },
    availableControls: { volume: true, mute: true, pan: true, eq: true },
    ...overrides,
  } as ProductionChallenge;
}

function makeResult(overrides: Partial<ProductionScoreResult> = {}): ProductionScoreResult {
  return {
    overall: 80,
    stars: 2,
    passed: true,
    breakdown: { type: 'goal', conditionResults: [] },
    feedback: ['Nice mix'],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ProductionStore', () => {
  beforeEach(() => {
    useProductionStore.setState({
      currentChallenge: null,
      currentAttempt: 0,
      hintsRevealed: 0,
      isScoring: false,
      lastResult: null,
      layerStates: [],
      progress: {},
    });
    vi.clearAllMocks();
  });

  // ─── loadChallenge ─────────────────────────────────────────────────

  describe('loadChallenge', () => {
    it('creates layer states from config', () => {
      useProductionStore.getState().loadChallenge(makeChallenge());

      const layers = useProductionStore.getState().layerStates;
      expect(layers).toHaveLength(2);
      expect(layers[0]!.id).toBe('kick');
      expect(layers[1]!.id).toBe('bass');
    });

    it('respects initialVolume and initialPan', () => {
      useProductionStore.getState().loadChallenge(makeChallenge());

      const layers = useProductionStore.getState().layerStates;
      expect(layers[0]!.volume).toBe(-6);
      expect(layers[0]!.pan).toBe(0);
      expect(layers[1]!.volume).toBe(0);
      expect(layers[1]!.pan).toBe(-0.3);
    });

    it('respects initialMuted', () => {
      useProductionStore.getState().loadChallenge(makeChallenge());

      const layers = useProductionStore.getState().layerStates;
      expect(layers[0]!.muted).toBe(false);  // default
      expect(layers[1]!.muted).toBe(true);   // initialMuted: true
    });

    it('defaults: volume=0, pan=0, muted=false, solo=false, eqLow=0, eqHigh=0', () => {
      const ch = makeChallenge({
        layers: [
          { id: 'pad', name: 'Pad', sourceConfig: { type: 'pad' }, initialVolume: 0 },
        ],
      });

      useProductionStore.getState().loadChallenge(ch);

      const layer = useProductionStore.getState().layerStates[0]!;
      expect(layer.volume).toBe(0);
      expect(layer.pan).toBe(0);
      expect(layer.muted).toBe(false);
      expect(layer.solo).toBe(false);
      expect(layer.eqLow).toBe(0);
      expect(layer.eqHigh).toBe(0);
    });

    it('increments attempt from progress', () => {
      useProductionStore.setState({
        progress: {
          'p1-01': { challengeId: 'p1-01', bestScore: 50, stars: 1, attempts: 3, completed: false },
        },
      });

      useProductionStore.getState().loadChallenge(makeChallenge());
      expect(useProductionStore.getState().currentAttempt).toBe(4);
    });

    it('resets transient state on load', () => {
      useProductionStore.setState({
        hintsRevealed: 2,
        isScoring: true,
        lastResult: makeResult(),
      });

      useProductionStore.getState().loadChallenge(makeChallenge());

      const state = useProductionStore.getState();
      expect(state.hintsRevealed).toBe(0);
      expect(state.isScoring).toBe(false);
      expect(state.lastResult).toBeNull();
    });
  });

  // ─── Layer controls ────────────────────────────────────────────────

  describe('Layer controls', () => {
    beforeEach(() => {
      useProductionStore.getState().loadChallenge(makeChallenge());
    });

    it('setLayerVolume updates correct layer', () => {
      useProductionStore.getState().setLayerVolume('kick', -20);
      expect(useProductionStore.getState().layerStates[0]!.volume).toBe(-20);
      expect(useProductionStore.getState().layerStates[1]!.volume).toBe(0); // unchanged
    });

    it('setLayerVolume clamps to [-60, 6]', () => {
      useProductionStore.getState().setLayerVolume('kick', -100);
      expect(useProductionStore.getState().layerStates[0]!.volume).toBe(LAYER_RANGES.volume.min);

      useProductionStore.getState().setLayerVolume('kick', 20);
      expect(useProductionStore.getState().layerStates[0]!.volume).toBe(LAYER_RANGES.volume.max);
    });

    it('setLayerPan updates correct layer', () => {
      useProductionStore.getState().setLayerPan('bass', 0.8);
      expect(useProductionStore.getState().layerStates[1]!.pan).toBe(0.8);
    });

    it('setLayerPan clamps to [-1, 1]', () => {
      useProductionStore.getState().setLayerPan('kick', -5);
      expect(useProductionStore.getState().layerStates[0]!.pan).toBe(LAYER_RANGES.pan.min);

      useProductionStore.getState().setLayerPan('kick', 5);
      expect(useProductionStore.getState().layerStates[0]!.pan).toBe(LAYER_RANGES.pan.max);
    });

    it('setLayerEQLow clamps to [-12, 12]', () => {
      useProductionStore.getState().setLayerEQLow('kick', 5);
      expect(useProductionStore.getState().layerStates[0]!.eqLow).toBe(5);

      useProductionStore.getState().setLayerEQLow('kick', -20);
      expect(useProductionStore.getState().layerStates[0]!.eqLow).toBe(LAYER_RANGES.eqLow.min);

      useProductionStore.getState().setLayerEQLow('kick', 20);
      expect(useProductionStore.getState().layerStates[0]!.eqLow).toBe(LAYER_RANGES.eqLow.max);
    });

    it('setLayerEQHigh clamps to [-12, 12]', () => {
      useProductionStore.getState().setLayerEQHigh('bass', -8);
      expect(useProductionStore.getState().layerStates[1]!.eqHigh).toBe(-8);

      useProductionStore.getState().setLayerEQHigh('bass', -20);
      expect(useProductionStore.getState().layerStates[1]!.eqHigh).toBe(LAYER_RANGES.eqHigh.min);

      useProductionStore.getState().setLayerEQHigh('bass', 20);
      expect(useProductionStore.getState().layerStates[1]!.eqHigh).toBe(LAYER_RANGES.eqHigh.max);
    });

    it('setLayerMuted toggles correct layer only', () => {
      useProductionStore.getState().setLayerMuted('kick', true);
      expect(useProductionStore.getState().layerStates[0]!.muted).toBe(true);
      expect(useProductionStore.getState().layerStates[1]!.muted).toBe(true); // already muted from init
    });

    it('setLayerSolo toggles correct layer only', () => {
      useProductionStore.getState().setLayerSolo('bass', true);
      expect(useProductionStore.getState().layerStates[1]!.solo).toBe(true);
      expect(useProductionStore.getState().layerStates[0]!.solo).toBe(false);
    });

    it('does not affect other layers', () => {
      useProductionStore.getState().setLayerVolume('kick', -30);
      useProductionStore.getState().setLayerPan('kick', 0.9);

      const bass = useProductionStore.getState().layerStates[1]!;
      expect(bass.volume).toBe(0);
      expect(bass.pan).toBe(-0.3);
    });
  });

  // ─── resetLayers ───────────────────────────────────────────────────

  describe('resetLayers', () => {
    it('resets to initial states from config', () => {
      useProductionStore.getState().loadChallenge(makeChallenge());

      // Modify layers
      useProductionStore.getState().setLayerVolume('kick', -30);
      useProductionStore.getState().setLayerPan('bass', 0.9);
      useProductionStore.getState().setLayerEQLow('kick', 8);

      useProductionStore.getState().resetLayers();

      const layers = useProductionStore.getState().layerStates;
      expect(layers[0]!.volume).toBe(-6); // back to initialVolume
      expect(layers[0]!.eqLow).toBe(0);
      expect(layers[1]!.pan).toBe(-0.3); // back to initialPan
    });

    it('is a no-op when no challenge', () => {
      useProductionStore.setState({ layerStates: [] });
      useProductionStore.getState().resetLayers();
      expect(useProductionStore.getState().layerStates).toHaveLength(0);
    });
  });

  // ─── revealHint ────────────────────────────────────────────────────

  describe('revealHint', () => {
    it('increments hintsRevealed', () => {
      useProductionStore.setState({ currentChallenge: makeChallenge(), hintsRevealed: 0 });
      useProductionStore.getState().revealHint();
      expect(useProductionStore.getState().hintsRevealed).toBe(1);
    });

    it('does not exceed max hints', () => {
      useProductionStore.setState({
        currentChallenge: makeChallenge({ hints: ['H1'] }),
        hintsRevealed: 1,
      });
      useProductionStore.getState().revealHint();
      expect(useProductionStore.getState().hintsRevealed).toBe(1);
    });

    it('is a no-op when no challenge', () => {
      useProductionStore.getState().revealHint();
      expect(useProductionStore.getState().hintsRevealed).toBe(0);
    });
  });

  // ─── submitResult ──────────────────────────────────────────────────

  describe('submitResult', () => {
    it('creates progress with best-wins logic', () => {
      useProductionStore.setState({ currentChallenge: makeChallenge() });

      useProductionStore.getState().submitResult(makeResult({ overall: 85, stars: 3, passed: true }));

      const progress = useProductionStore.getState().progress['p1-01']!;
      expect(progress.bestScore).toBe(85);
      expect(progress.stars).toBe(3);
      expect(progress.attempts).toBe(1);
      expect(progress.completed).toBe(true);
    });

    it('keeps higher best score', () => {
      useProductionStore.setState({
        currentChallenge: makeChallenge(),
        progress: {
          'p1-01': { challengeId: 'p1-01', bestScore: 95, stars: 3, attempts: 2, completed: true },
        },
      });

      useProductionStore.getState().submitResult(makeResult({ overall: 70, passed: true }));
      expect(useProductionStore.getState().progress['p1-01']!.bestScore).toBe(95);
    });

    it('completed stays true after later fails', () => {
      useProductionStore.setState({
        currentChallenge: makeChallenge(),
        progress: {
          'p1-01': { challengeId: 'p1-01', bestScore: 80, stars: 2, attempts: 1, completed: true },
        },
      });

      useProductionStore.getState().submitResult(makeResult({ overall: 30, stars: 0 as 1, passed: false }));
      expect(useProductionStore.getState().progress['p1-01']!.completed).toBe(true);
    });

    it('clears isScoring and sets lastResult', () => {
      useProductionStore.setState({ currentChallenge: makeChallenge(), isScoring: true });

      const result = makeResult();
      useProductionStore.getState().submitResult(result);
      expect(useProductionStore.getState().isScoring).toBe(false);
      expect(useProductionStore.getState().lastResult).toBe(result);
    });

    it('is a no-op when no challenge loaded', () => {
      useProductionStore.getState().submitResult(makeResult());
      expect(Object.keys(useProductionStore.getState().progress)).toHaveLength(0);
    });
  });

  // ─── retry ─────────────────────────────────────────────────────────

  describe('retry', () => {
    it('resets layers to initial config', () => {
      useProductionStore.getState().loadChallenge(makeChallenge());

      useProductionStore.getState().setLayerVolume('kick', -30);
      useProductionStore.getState().setLayerSolo('bass', true);

      useProductionStore.getState().retry();

      const layers = useProductionStore.getState().layerStates;
      expect(layers[0]!.volume).toBe(-6); // initialVolume
      expect(layers[1]!.solo).toBe(false);
      expect(useProductionStore.getState().currentAttempt).toBe(2);
    });

    it('resets transient state', () => {
      useProductionStore.getState().loadChallenge(makeChallenge());
      useProductionStore.setState({ hintsRevealed: 2, isScoring: true, lastResult: makeResult() });

      useProductionStore.getState().retry();

      const state = useProductionStore.getState();
      expect(state.hintsRevealed).toBe(0);
      expect(state.isScoring).toBe(false);
      expect(state.lastResult).toBeNull();
    });

    it('is a no-op when no challenge', () => {
      useProductionStore.getState().retry();
      expect(useProductionStore.getState().currentAttempt).toBe(0);
    });
  });

  // ─── exitChallenge ─────────────────────────────────────────────────

  describe('exitChallenge', () => {
    it('clears all transient state and layers', () => {
      useProductionStore.getState().loadChallenge(makeChallenge());
      useProductionStore.getState().exitChallenge();

      const state = useProductionStore.getState();
      expect(state.currentChallenge).toBeNull();
      expect(state.currentAttempt).toBe(0);
      expect(state.layerStates).toHaveLength(0);
    });
  });

  // ─── progress queries ──────────────────────────────────────────────

  describe('progress queries', () => {
    it('getChallengeProgress returns entry', () => {
      const entry: ChallengeProgress = {
        challengeId: 'p1-01',
        bestScore: 85,
        stars: 3,
        attempts: 2,
        completed: true,
      };
      useProductionStore.setState({ progress: { 'p1-01': entry } });
      expect(useProductionStore.getState().getChallengeProgress('p1-01')).toBe(entry);
    });

    it('getChallengeProgress returns undefined for unknown', () => {
      expect(useProductionStore.getState().getChallengeProgress('nope')).toBeUndefined();
    });

    it('getModuleProgress counts completed + stars', () => {
      const allChallenges = [
        makeChallenge({ id: 'p1-01', module: 'P1' }),
        makeChallenge({ id: 'p1-02', module: 'P1' }),
        makeChallenge({ id: 'p2-01', module: 'P2' }),
      ];

      useProductionStore.setState({
        progress: {
          'p1-01': { challengeId: 'p1-01', bestScore: 90, stars: 3, attempts: 1, completed: true },
          'p1-02': { challengeId: 'p1-02', bestScore: 60, stars: 1, attempts: 1, completed: true },
        },
      });

      const mp = useProductionStore.getState().getModuleProgress('P1', allChallenges);
      expect(mp.completed).toBe(2);
      expect(mp.total).toBe(2);
      expect(mp.stars).toBe(4);
    });
  });
});
