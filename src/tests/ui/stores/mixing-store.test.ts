/**
 * Mixing Store Tests
 * Tests for multi-track mixing state, EQ, parametric EQ, compressor, bus processing, and progress.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { MixingChallenge, ChallengeProgress } from '../../../core/types.ts';
import { DEFAULT_EQ, DEFAULT_COMPRESSOR, DEFAULT_PARAMETRIC_BANDS } from '../../../core/mixing-effects.ts';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('../../../core/player-model.ts', () => ({
  extractMixingBreakdown: vi.fn(() => ({ eqLow: 80, eqMid: 70, eqHigh: 90 })),
}));

import { useMixingStore, type MixingScoreResult, type TrackEQParams } from '../../../ui/stores/mixing-store.ts';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeChallenge(overrides: Partial<MixingChallenge> = {}): MixingChallenge {
  return {
    id: 'f1-01',
    title: 'Test Mix',
    description: 'Test mixing challenge',
    difficulty: 1,
    module: 'F1',
    hints: ['Hint 1', 'Hint 2'],
    target: { type: 'match_eq', low: 3, mid: 0, high: -2 },
    controls: { eq: 'simple', compressor: false },
    ...overrides,
  } as MixingChallenge;
}

function makeMultiTrackChallenge(eqType: 'simple' | 'parametric' = 'simple'): MixingChallenge {
  return makeChallenge({
    id: 'i1-01',
    module: 'I1',
    tracks: [
      { id: 'kick', name: 'Kick', sourceConfig: { type: 'drum' }, initialVolume: -3, initialPan: 0 },
      { id: 'bass', name: 'Bass', sourceConfig: { type: 'bass' }, initialVolume: -6, initialPan: 0.2 },
    ],
    controls: { eq: eqType, compressor: false, volume: true, pan: true },
  });
}

function makeResult(overrides: Partial<MixingScoreResult> = {}): MixingScoreResult {
  return {
    overall: 75,
    stars: 2,
    passed: true,
    breakdown: {},
    feedback: ['Good work'],
    ...overrides,
  };
}

const DEFAULT_TRACK: TrackEQParams = {
  low: 0, mid: 0, high: 0,
  volume: 0, pan: 0,
  reverbMix: 0, reverbSize: 50,
  compressorThreshold: 0, compressorAmount: 0,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('MixingStore', () => {
  beforeEach(() => {
    useMixingStore.setState({
      currentChallenge: null,
      currentAttempt: 0,
      hintsRevealed: 0,
      isScoring: false,
      lastResult: null,
      eqParams: { ...DEFAULT_EQ },
      compressorParams: { ...DEFAULT_COMPRESSOR },
      trackParams: {},
      parametricEQ: { bands: DEFAULT_PARAMETRIC_BANDS.map(b => ({ ...b })) as typeof DEFAULT_PARAMETRIC_BANDS },
      trackParametricEQ: {},
      busEQParams: { ...DEFAULT_EQ },
      progress: {},
    });
    vi.clearAllMocks();
  });

  // ─── loadChallenge ─────────────────────────────────────────────────

  describe('loadChallenge', () => {
    it('sets challenge and initializes attempt', () => {
      const ch = makeChallenge();
      useMixingStore.getState().loadChallenge(ch);

      const state = useMixingStore.getState();
      expect(state.currentChallenge).toBe(ch);
      expect(state.currentAttempt).toBe(1);
      expect(state.hintsRevealed).toBe(0);
    });

    it('increments attempt from existing progress', () => {
      useMixingStore.setState({
        progress: {
          'i1-01': { challengeId: 'i1-01', bestScore: 50, stars: 1, attempts: 4, completed: false },
        },
      });

      useMixingStore.getState().loadChallenge(makeMultiTrackChallenge());
      expect(useMixingStore.getState().currentAttempt).toBe(5);
    });

    it('initializes track params from config', () => {
      useMixingStore.getState().loadChallenge(makeMultiTrackChallenge());

      const tracks = useMixingStore.getState().trackParams;
      expect(tracks['kick']!.volume).toBe(-3);
      expect(tracks['kick']!.pan).toBe(0);
      expect(tracks['bass']!.volume).toBe(-6);
      expect(tracks['bass']!.pan).toBe(0.2);
    });

    it('initializes parametric EQ per-track when eq=parametric', () => {
      useMixingStore.getState().loadChallenge(makeMultiTrackChallenge('parametric'));

      const peq = useMixingStore.getState().trackParametricEQ;
      expect(peq['kick']).toBeDefined();
      expect(peq['bass']).toBeDefined();
      expect(peq['kick']!.bands).toHaveLength(4);
      expect(peq['kick']!.bands[0]!.frequency).toBe(200);
    });

    it('does NOT init parametric for simple EQ', () => {
      useMixingStore.getState().loadChallenge(makeMultiTrackChallenge('simple'));

      const peq = useMixingStore.getState().trackParametricEQ;
      expect(Object.keys(peq)).toHaveLength(0);
    });

    it('resets EQ + compressor to defaults', () => {
      useMixingStore.setState({
        eqParams: { low: 5, mid: -3, high: 2 },
        compressorParams: { threshold: -20, amount: 50, attack: 0.1, release: 0.5 },
        busEQParams: { low: 4, mid: -2, high: 1 },
      });

      useMixingStore.getState().loadChallenge(makeChallenge());

      const state = useMixingStore.getState();
      expect(state.eqParams).toEqual(DEFAULT_EQ);
      expect(state.compressorParams).toEqual(DEFAULT_COMPRESSOR);
      expect(state.busEQParams).toEqual(DEFAULT_EQ);
    });
  });

  // ─── EQ (single-track) ────────────────────────────────────────────

  describe('EQ (single-track)', () => {
    it('setEQLow updates eqParams', () => {
      useMixingStore.getState().setEQLow(5);
      expect(useMixingStore.getState().eqParams.low).toBe(5);
    });

    it('setEQMid updates eqParams', () => {
      useMixingStore.getState().setEQMid(-3);
      expect(useMixingStore.getState().eqParams.mid).toBe(-3);
    });

    it('setEQHigh updates eqParams', () => {
      useMixingStore.getState().setEQHigh(8);
      expect(useMixingStore.getState().eqParams.high).toBe(8);
    });

    it('resetEQ returns to defaults', () => {
      useMixingStore.setState({ eqParams: { low: 10, mid: -5, high: 3 } });
      useMixingStore.getState().resetEQ();
      expect(useMixingStore.getState().eqParams).toEqual(DEFAULT_EQ);
    });
  });

  // ─── Track params (multi-track) ───────────────────────────────────

  describe('Track params (multi-track)', () => {
    beforeEach(() => {
      useMixingStore.getState().loadChallenge(makeMultiTrackChallenge());
    });

    it('setTrackEQLow updates specific track', () => {
      useMixingStore.getState().setTrackEQLow('kick', 4);
      expect(useMixingStore.getState().trackParams['kick']!.low).toBe(4);
      expect(useMixingStore.getState().trackParams['bass']!.low).toBe(0);
    });

    it('setTrackEQMid updates specific track', () => {
      useMixingStore.getState().setTrackEQMid('bass', -2);
      expect(useMixingStore.getState().trackParams['bass']!.mid).toBe(-2);
    });

    it('setTrackEQHigh updates specific track', () => {
      useMixingStore.getState().setTrackEQHigh('kick', 6);
      expect(useMixingStore.getState().trackParams['kick']!.high).toBe(6);
    });

    it('setTrackVolume updates specific track', () => {
      useMixingStore.getState().setTrackVolume('kick', -10);
      expect(useMixingStore.getState().trackParams['kick']!.volume).toBe(-10);
    });

    it('setTrackPan updates specific track', () => {
      useMixingStore.getState().setTrackPan('bass', -0.5);
      expect(useMixingStore.getState().trackParams['bass']!.pan).toBe(-0.5);
    });

    it('setTrackReverbMix updates specific track', () => {
      useMixingStore.getState().setTrackReverbMix('kick', 40);
      expect(useMixingStore.getState().trackParams['kick']!.reverbMix).toBe(40);
    });

    it('setTrackReverbSize updates specific track', () => {
      useMixingStore.getState().setTrackReverbSize('bass', 80);
      expect(useMixingStore.getState().trackParams['bass']!.reverbSize).toBe(80);
    });

    it('setTrackCompressorThreshold updates specific track', () => {
      useMixingStore.getState().setTrackCompressorThreshold('kick', -24);
      expect(useMixingStore.getState().trackParams['kick']!.compressorThreshold).toBe(-24);
    });

    it('setTrackCompressorAmount updates specific track', () => {
      useMixingStore.getState().setTrackCompressorAmount('bass', 60);
      expect(useMixingStore.getState().trackParams['bass']!.compressorAmount).toBe(60);
    });

    it('defaults to DEFAULT_TRACK_EQ for unknown track', () => {
      useMixingStore.getState().setTrackEQLow('unknown', 5);
      const unknown = useMixingStore.getState().trackParams['unknown']!;
      expect(unknown.low).toBe(5);
      expect(unknown.volume).toBe(DEFAULT_TRACK.volume);
      expect(unknown.reverbSize).toBe(DEFAULT_TRACK.reverbSize);
    });

    it('resetTrackEQ preserves initialVolume/Pan', () => {
      useMixingStore.getState().setTrackEQLow('kick', 10);
      useMixingStore.getState().setTrackVolume('kick', -20);

      useMixingStore.getState().resetTrackEQ('kick');

      const kick = useMixingStore.getState().trackParams['kick']!;
      expect(kick.low).toBe(0);
      expect(kick.volume).toBe(-3); // initialVolume from config
      expect(kick.pan).toBe(0);     // initialPan from config
    });
  });

  // ─── Parametric EQ ────────────────────────────────────────────────

  describe('Parametric EQ', () => {
    it('setParametricBand updates single band by index', () => {
      useMixingStore.getState().setParametricBand(1, { gain: 6 });
      const bands = useMixingStore.getState().parametricEQ.bands;
      expect(bands[1]!.gain).toBe(6);
      expect(bands[0]!.gain).toBe(0); // unchanged
    });

    it('setTrackParametricBand updates specific track band', () => {
      useMixingStore.getState().loadChallenge(makeMultiTrackChallenge('parametric'));

      useMixingStore.getState().setTrackParametricBand('kick', 2, { frequency: 4000, gain: -3 });
      const kickBands = useMixingStore.getState().trackParametricEQ['kick']!.bands;
      expect(kickBands[2]!.frequency).toBe(4000);
      expect(kickBands[2]!.gain).toBe(-3);
      // bass should be unchanged
      const bassBands = useMixingStore.getState().trackParametricEQ['bass']!.bands;
      expect(bassBands[2]!.frequency).toBe(3000); // default
    });

    it('setTrackParametricBand is no-op for uninitialized track', () => {
      // No parametric initialized
      useMixingStore.getState().setTrackParametricBand('nonexistent', 0, { gain: 10 });
      expect(useMixingStore.getState().trackParametricEQ['nonexistent']).toBeUndefined();
    });
  });

  // ─── Bus compressor ───────────────────────────────────────────────

  describe('Bus compressor', () => {
    it('setCompressorThreshold updates threshold', () => {
      useMixingStore.getState().setCompressorThreshold(-18);
      expect(useMixingStore.getState().compressorParams.threshold).toBe(-18);
    });

    it('setCompressorAmount updates amount', () => {
      useMixingStore.getState().setCompressorAmount(60);
      expect(useMixingStore.getState().compressorParams.amount).toBe(60);
    });

    it('setCompressorAttack updates attack', () => {
      useMixingStore.getState().setCompressorAttack(0.1);
      expect(useMixingStore.getState().compressorParams.attack).toBe(0.1);
    });

    it('setCompressorRelease updates release', () => {
      useMixingStore.getState().setCompressorRelease(0.5);
      expect(useMixingStore.getState().compressorParams.release).toBe(0.5);
    });

    it('resetCompressor returns to defaults', () => {
      useMixingStore.setState({
        compressorParams: { threshold: -30, amount: 80, attack: 0.5, release: 0.8 },
      });
      useMixingStore.getState().resetCompressor();
      expect(useMixingStore.getState().compressorParams).toEqual(DEFAULT_COMPRESSOR);
    });
  });

  // ─── Bus EQ ───────────────────────────────────────────────────────

  describe('Bus EQ', () => {
    it('setBusEQLow updates busEQParams', () => {
      useMixingStore.getState().setBusEQLow(3);
      expect(useMixingStore.getState().busEQParams.low).toBe(3);
    });

    it('setBusEQMid updates busEQParams', () => {
      useMixingStore.getState().setBusEQMid(-4);
      expect(useMixingStore.getState().busEQParams.mid).toBe(-4);
    });

    it('setBusEQHigh updates busEQParams', () => {
      useMixingStore.getState().setBusEQHigh(2);
      expect(useMixingStore.getState().busEQParams.high).toBe(2);
    });

    it('resetBusEQ returns to defaults', () => {
      useMixingStore.setState({ busEQParams: { low: 5, mid: -3, high: 2 } });
      useMixingStore.getState().resetBusEQ();
      expect(useMixingStore.getState().busEQParams).toEqual(DEFAULT_EQ);
    });
  });

  // ─── revealHint ────────────────────────────────────────────────────

  describe('revealHint', () => {
    it('increments hintsRevealed', () => {
      useMixingStore.setState({ currentChallenge: makeChallenge(), hintsRevealed: 0 });
      useMixingStore.getState().revealHint();
      expect(useMixingStore.getState().hintsRevealed).toBe(1);
    });

    it('does not exceed max hints', () => {
      useMixingStore.setState({
        currentChallenge: makeChallenge({ hints: ['H1'] }),
        hintsRevealed: 1,
      });
      useMixingStore.getState().revealHint();
      expect(useMixingStore.getState().hintsRevealed).toBe(1);
    });

    it('is a no-op when no challenge loaded', () => {
      useMixingStore.getState().revealHint();
      expect(useMixingStore.getState().hintsRevealed).toBe(0);
    });
  });

  // ─── submitResult + retry ─────────────────────────────────────────

  describe('submitResult', () => {
    it('creates progress with best-wins logic', () => {
      useMixingStore.setState({ currentChallenge: makeChallenge() });

      useMixingStore.getState().submitResult(makeResult({ overall: 80, stars: 2, passed: true }));

      const progress = useMixingStore.getState().progress['f1-01']!;
      expect(progress.bestScore).toBe(80);
      expect(progress.stars).toBe(2);
      expect(progress.attempts).toBe(1);
      expect(progress.completed).toBe(true);
    });

    it('keeps higher best score', () => {
      useMixingStore.setState({
        currentChallenge: makeChallenge(),
        progress: {
          'f1-01': { challengeId: 'f1-01', bestScore: 90, stars: 3, attempts: 1, completed: true },
        },
      });

      useMixingStore.getState().submitResult(makeResult({ overall: 70, stars: 2, passed: true }));
      expect(useMixingStore.getState().progress['f1-01']!.bestScore).toBe(90);
    });

    it('clears isScoring and sets lastResult', () => {
      useMixingStore.setState({ currentChallenge: makeChallenge(), isScoring: true });

      const result = makeResult();
      useMixingStore.getState().submitResult(result);
      expect(useMixingStore.getState().isScoring).toBe(false);
      expect(useMixingStore.getState().lastResult).toBe(result);
    });

    it('is a no-op when no challenge loaded', () => {
      useMixingStore.getState().submitResult(makeResult());
      expect(Object.keys(useMixingStore.getState().progress)).toHaveLength(0);
    });
  });

  describe('retry', () => {
    it('resets all params including track + parametric', () => {
      const ch = makeMultiTrackChallenge('parametric');
      useMixingStore.getState().loadChallenge(ch);

      // Modify some state
      useMixingStore.getState().setTrackVolume('kick', -20);
      useMixingStore.getState().setTrackParametricBand('kick', 0, { gain: 10 });
      useMixingStore.getState().setEQLow(8);

      useMixingStore.getState().retry();

      const state = useMixingStore.getState();
      expect(state.trackParams['kick']!.volume).toBe(-3); // reset to initial
      expect(state.eqParams).toEqual(DEFAULT_EQ);
      expect(state.trackParametricEQ['kick']!.bands[0]!.gain).toBe(0); // reset
      expect(state.currentAttempt).toBe(2); // incremented
    });

    it('is a no-op when no challenge', () => {
      useMixingStore.getState().retry();
      expect(useMixingStore.getState().currentAttempt).toBe(0);
    });
  });

  // ─── exitChallenge ─────────────────────────────────────────────────

  describe('exitChallenge', () => {
    it('clears transient state', () => {
      useMixingStore.setState({
        currentChallenge: makeChallenge(),
        currentAttempt: 3,
        hintsRevealed: 2,
        isScoring: true,
        lastResult: makeResult(),
      });

      useMixingStore.getState().exitChallenge();

      const state = useMixingStore.getState();
      expect(state.currentChallenge).toBeNull();
      expect(state.currentAttempt).toBe(0);
      expect(state.hintsRevealed).toBe(0);
      expect(state.isScoring).toBe(false);
      expect(state.lastResult).toBeNull();
    });
  });

  // ─── progress queries ──────────────────────────────────────────────

  describe('progress queries', () => {
    it('getChallengeProgress returns entry', () => {
      const entry: ChallengeProgress = {
        challengeId: 'f1-01',
        bestScore: 85,
        stars: 3,
        attempts: 2,
        completed: true,
      };
      useMixingStore.setState({ progress: { 'f1-01': entry } });
      expect(useMixingStore.getState().getChallengeProgress('f1-01')).toBe(entry);
    });

    it('getChallengeProgress returns undefined for unknown', () => {
      expect(useMixingStore.getState().getChallengeProgress('nope')).toBeUndefined();
    });

    it('getModuleProgress counts completed + stars', () => {
      const allChallenges = [
        makeChallenge({ id: 'f1-01', module: 'F1' }),
        makeChallenge({ id: 'f1-02', module: 'F1' }),
        makeChallenge({ id: 'f2-01', module: 'F2' }),
      ];

      useMixingStore.setState({
        progress: {
          'f1-01': { challengeId: 'f1-01', bestScore: 90, stars: 3, attempts: 1, completed: true },
          'f1-02': { challengeId: 'f1-02', bestScore: 40, stars: 0, attempts: 1, completed: false },
        },
      });

      const mp = useMixingStore.getState().getModuleProgress('F1', allChallenges);
      expect(mp.completed).toBe(1);
      expect(mp.total).toBe(2);
      expect(mp.stars).toBe(3);
    });
  });
});
