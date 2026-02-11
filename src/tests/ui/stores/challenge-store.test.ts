/**
 * Challenge Store Tests
 * Tests for lazy-loaded challenge management, progress persistence, and breakdown routing.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Challenge, ChallengeProgress, ScoreBreakdownData } from '../../../core/types.ts';
import type { ScoreResult, ScoreBreakdown } from '../../../core/sound-comparison.ts';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockGetChallenge = vi.fn();
const mockGetNextChallenge = vi.fn();

vi.mock('../../../data/challenges/index.ts', () => ({
  getChallenge: (...args: unknown[]) => mockGetChallenge(...args),
  getNextChallenge: (...args: unknown[]) => mockGetNextChallenge(...args),
}));

const mockExtractSD = vi.fn<(r: ScoreResult) => ScoreBreakdownData>(() => ({ brightness: 80, attack: 70 }));
const mockExtractFM = vi.fn<(r: ScoreResult) => ScoreBreakdownData>(() => ({ harmonicity: 90 }));
const mockExtractAdditive = vi.fn<(r: ScoreResult) => ScoreBreakdownData>(() => ({ brightness: 60 }));

vi.mock('../../../core/player-model.ts', () => ({
  extractSDBreakdown: (...args: unknown[]) => mockExtractSD(...(args as [ScoreResult])),
  extractFMBreakdown: (...args: unknown[]) => mockExtractFM(...(args as [ScoreResult])),
  extractAdditiveBreakdown: (...args: unknown[]) => mockExtractAdditive(...(args as [ScoreResult])),
}));

vi.mock('../../../data/challenges/menu-metadata.ts', () => ({
  sdMenuChallenges: [
    { id: 'sd1-01', title: 'Test 1', difficulty: 1, module: 'SD1' },
    { id: 'sd1-02', title: 'Test 2', difficulty: 1, module: 'SD1' },
    { id: 'sd2-01', title: 'Test 3', difficulty: 1, module: 'SD2' },
  ],
}));

// Import store AFTER mocks
import { useChallengeStore } from '../../../ui/stores/challenge-store.ts';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeChallenge(overrides: Partial<Challenge> = {}): Challenge {
  return {
    id: 'sd1-01',
    title: 'Pure Tone',
    description: 'Create a pure tone',
    difficulty: 1,
    synthesisType: 'subtractive',
    targetParams: {} as Challenge['targetParams'],
    hints: ['Hint 1', 'Hint 2', 'Hint 3'],
    module: 'SD1',
    testNote: 'C4',
    ...overrides,
  };
}

function makeScoreResult(overrides: Partial<ScoreResult> = {}): ScoreResult {
  const breakdown: ScoreBreakdown = {
    brightness: { score: 80, feedback: '' },
    attack: { score: 70, feedback: '' },
    filter: { score: 90, feedback: '' },
    envelope: { score: 85, feedback: '' },
  };
  return {
    overall: 81,
    stars: 2,
    breakdown,
    passed: true,
    ...overrides,
  };
}

const initialState = {
  currentChallenge: null,
  currentAttempt: 0,
  hintsRevealed: 0,
  isScoring: false,
  lastResult: null,
  progress: {} as Record<string, ChallengeProgress>,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ChallengeStore', () => {
  beforeEach(() => {
    useChallengeStore.setState(initialState);
    vi.clearAllMocks();
  });

  // ─── loadChallenge ─────────────────────────────────────────────────

  describe('loadChallenge', () => {
    it('loads challenge by ID and sets currentChallenge + attempt', async () => {
      const challenge = makeChallenge();
      mockGetChallenge.mockReturnValue(challenge);

      useChallengeStore.getState().loadChallenge('sd1-01');
      await vi.waitFor(() => {
        expect(useChallengeStore.getState().currentChallenge).toBe(challenge);
      });
      expect(useChallengeStore.getState().currentAttempt).toBe(1);
    });

    it('increments attempt from existing progress', async () => {
      const challenge = makeChallenge();
      mockGetChallenge.mockReturnValue(challenge);

      useChallengeStore.setState({
        progress: {
          'sd1-01': {
            challengeId: 'sd1-01',
            bestScore: 50,
            stars: 1,
            attempts: 3,
            completed: false,
          },
        },
      });

      useChallengeStore.getState().loadChallenge('sd1-01');
      await vi.waitFor(() => {
        expect(useChallengeStore.getState().currentAttempt).toBe(4);
      });
    });

    it('resets hints/scoring/result on load', async () => {
      const challenge = makeChallenge();
      mockGetChallenge.mockReturnValue(challenge);

      useChallengeStore.setState({
        hintsRevealed: 2,
        isScoring: true,
        lastResult: makeScoreResult(),
      });

      useChallengeStore.getState().loadChallenge('sd1-01');
      await vi.waitFor(() => {
        expect(useChallengeStore.getState().currentChallenge).toBe(challenge);
      });

      const state = useChallengeStore.getState();
      expect(state.hintsRevealed).toBe(0);
      expect(state.isScoring).toBe(false);
      expect(state.lastResult).toBeNull();
    });

    it('handles missing challenge without crashing', async () => {
      mockGetChallenge.mockReturnValue(undefined);
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      useChallengeStore.getState().loadChallenge('nonexistent');
      await vi.waitFor(() => {
        expect(spy).toHaveBeenCalledWith('Challenge not found: nonexistent');
      });
      expect(useChallengeStore.getState().currentChallenge).toBeNull();
      spy.mockRestore();
    });
  });

  // ─── exitChallenge ─────────────────────────────────────────────────

  describe('exitChallenge', () => {
    it('clears all transient state', () => {
      useChallengeStore.setState({
        currentChallenge: makeChallenge(),
        currentAttempt: 3,
        hintsRevealed: 2,
        isScoring: true,
        lastResult: makeScoreResult(),
      });

      useChallengeStore.getState().exitChallenge();

      const state = useChallengeStore.getState();
      expect(state.currentChallenge).toBeNull();
      expect(state.currentAttempt).toBe(0);
      expect(state.hintsRevealed).toBe(0);
      expect(state.isScoring).toBe(false);
      expect(state.lastResult).toBeNull();
    });
  });

  // ─── revealHint ────────────────────────────────────────────────────

  describe('revealHint', () => {
    it('increments hintsRevealed', () => {
      useChallengeStore.setState({
        currentChallenge: makeChallenge(),
        hintsRevealed: 0,
      });

      useChallengeStore.getState().revealHint();
      expect(useChallengeStore.getState().hintsRevealed).toBe(1);
    });

    it('does not exceed max hints', () => {
      useChallengeStore.setState({
        currentChallenge: makeChallenge({ hints: ['H1', 'H2'] }),
        hintsRevealed: 2,
      });

      useChallengeStore.getState().revealHint();
      expect(useChallengeStore.getState().hintsRevealed).toBe(2);
    });

    it('is a no-op when no challenge loaded', () => {
      useChallengeStore.setState({ currentChallenge: null, hintsRevealed: 0 });

      useChallengeStore.getState().revealHint();
      expect(useChallengeStore.getState().hintsRevealed).toBe(0);
    });
  });

  // ─── submitResult ──────────────────────────────────────────────────

  describe('submitResult', () => {
    it('creates new progress on first attempt', () => {
      useChallengeStore.setState({
        currentChallenge: makeChallenge(),
        isScoring: true,
      });

      const result = makeScoreResult({ overall: 75, stars: 2, passed: true });
      useChallengeStore.getState().submitResult(result);

      const progress = useChallengeStore.getState().progress['sd1-01']!;
      expect(progress.bestScore).toBe(75);
      expect(progress.stars).toBe(2);
      expect(progress.attempts).toBe(1);
      expect(progress.completed).toBe(true);
    });

    it('keeps best score (higher wins)', () => {
      useChallengeStore.setState({
        currentChallenge: makeChallenge(),
        progress: {
          'sd1-01': { challengeId: 'sd1-01', bestScore: 80, stars: 2, attempts: 1, completed: true },
        },
      });

      useChallengeStore.getState().submitResult(makeScoreResult({ overall: 60, stars: 1, passed: true }));
      expect(useChallengeStore.getState().progress['sd1-01']!.bestScore).toBe(80);
    });

    it('keeps best stars only from passed attempts', () => {
      useChallengeStore.setState({
        currentChallenge: makeChallenge(),
        progress: {
          'sd1-01': { challengeId: 'sd1-01', bestScore: 70, stars: 2, attempts: 1, completed: true },
        },
      });

      // Fail with stars=0 should not decrease
      useChallengeStore.getState().submitResult(makeScoreResult({ overall: 40, stars: 0, passed: false }));
      expect(useChallengeStore.getState().progress['sd1-01']!.stars).toBe(2);
    });

    it('increments attempts count', () => {
      useChallengeStore.setState({
        currentChallenge: makeChallenge(),
        progress: {
          'sd1-01': { challengeId: 'sd1-01', bestScore: 50, stars: 1, attempts: 5, completed: true },
        },
      });

      useChallengeStore.getState().submitResult(makeScoreResult());
      expect(useChallengeStore.getState().progress['sd1-01']!.attempts).toBe(6);
    });

    it('completed stays true after later fails', () => {
      useChallengeStore.setState({
        currentChallenge: makeChallenge(),
        progress: {
          'sd1-01': { challengeId: 'sd1-01', bestScore: 70, stars: 2, attempts: 1, completed: true },
        },
      });

      useChallengeStore.getState().submitResult(makeScoreResult({ overall: 30, stars: 0, passed: false }));
      expect(useChallengeStore.getState().progress['sd1-01']!.completed).toBe(true);
    });

    it('routes to extractSDBreakdown for subtractive', () => {
      useChallengeStore.setState({
        currentChallenge: makeChallenge({ synthesisType: 'subtractive' }),
      });

      useChallengeStore.getState().submitResult(makeScoreResult());
      expect(mockExtractSD).toHaveBeenCalled();
      expect(mockExtractFM).not.toHaveBeenCalled();
      expect(mockExtractAdditive).not.toHaveBeenCalled();
    });

    it('routes to extractFMBreakdown for FM', () => {
      useChallengeStore.setState({
        currentChallenge: makeChallenge({ synthesisType: 'fm' }),
      });

      useChallengeStore.getState().submitResult(makeScoreResult());
      expect(mockExtractFM).toHaveBeenCalled();
      expect(mockExtractSD).not.toHaveBeenCalled();
    });

    it('routes to extractAdditiveBreakdown for additive', () => {
      useChallengeStore.setState({
        currentChallenge: makeChallenge({ synthesisType: 'additive' }),
      });

      useChallengeStore.getState().submitResult(makeScoreResult());
      expect(mockExtractAdditive).toHaveBeenCalled();
      expect(mockExtractSD).not.toHaveBeenCalled();
    });

    it('stores breakdown only on new best score', () => {
      const oldBreakdown: ScoreBreakdownData = { brightness: 50 };
      useChallengeStore.setState({
        currentChallenge: makeChallenge(),
        progress: {
          'sd1-01': { challengeId: 'sd1-01', bestScore: 90, stars: 3, attempts: 1, completed: true, breakdown: oldBreakdown },
        },
      });

      useChallengeStore.getState().submitResult(makeScoreResult({ overall: 70 }));
      // Score 70 < 90 — old breakdown should be kept
      expect(useChallengeStore.getState().progress['sd1-01']!.breakdown).toBe(oldBreakdown);
    });

    it('replaces breakdown when score ties (>=)', () => {
      mockExtractSD.mockReturnValue({ brightness: 99 });
      useChallengeStore.setState({
        currentChallenge: makeChallenge(),
        progress: {
          'sd1-01': { challengeId: 'sd1-01', bestScore: 81, stars: 2, attempts: 1, completed: true, breakdown: { brightness: 50 } },
        },
      });

      useChallengeStore.getState().submitResult(makeScoreResult({ overall: 81 }));
      expect(useChallengeStore.getState().progress['sd1-01']!.breakdown).toEqual({ brightness: 99 });
    });

    it('clears isScoring and sets lastResult', () => {
      useChallengeStore.setState({
        currentChallenge: makeChallenge(),
        isScoring: true,
      });

      const result = makeScoreResult();
      useChallengeStore.getState().submitResult(result);

      const state = useChallengeStore.getState();
      expect(state.isScoring).toBe(false);
      expect(state.lastResult).toBe(result);
    });

    it('is a no-op when no challenge loaded', () => {
      useChallengeStore.setState({ currentChallenge: null });
      useChallengeStore.getState().submitResult(makeScoreResult());
      expect(Object.keys(useChallengeStore.getState().progress)).toHaveLength(0);
    });
  });

  // ─── retry ─────────────────────────────────────────────────────────

  describe('retry', () => {
    it('increments attempt and resets transient state', () => {
      useChallengeStore.setState({
        currentChallenge: makeChallenge(),
        currentAttempt: 2,
        hintsRevealed: 3,
        isScoring: true,
        lastResult: makeScoreResult(),
      });

      useChallengeStore.getState().retry();

      const state = useChallengeStore.getState();
      expect(state.currentAttempt).toBe(3);
      expect(state.hintsRevealed).toBe(0);
      expect(state.isScoring).toBe(false);
      expect(state.lastResult).toBeNull();
    });

    it('is a no-op when no challenge', () => {
      useChallengeStore.setState({ currentChallenge: null, currentAttempt: 0 });
      useChallengeStore.getState().retry();
      expect(useChallengeStore.getState().currentAttempt).toBe(0);
    });
  });

  // ─── nextChallenge ─────────────────────────────────────────────────

  describe('nextChallenge', () => {
    it('loads next challenge via lazy import', async () => {
      const current = makeChallenge({ id: 'sd1-01' });
      const next = makeChallenge({ id: 'sd1-02' });
      mockGetNextChallenge.mockReturnValue(next);
      mockGetChallenge.mockReturnValue(next);

      useChallengeStore.setState({ currentChallenge: current });
      useChallengeStore.getState().nextChallenge();

      await vi.waitFor(() => {
        expect(mockGetNextChallenge).toHaveBeenCalledWith('sd1-01');
      });
    });

    it('exits when no next challenge', async () => {
      mockGetNextChallenge.mockReturnValue(undefined);

      useChallengeStore.setState({ currentChallenge: makeChallenge() });
      useChallengeStore.getState().nextChallenge();

      await vi.waitFor(() => {
        expect(useChallengeStore.getState().currentChallenge).toBeNull();
      });
    });

    it('is a no-op when no current challenge', () => {
      useChallengeStore.setState({ currentChallenge: null });
      useChallengeStore.getState().nextChallenge();
      expect(mockGetNextChallenge).not.toHaveBeenCalled();
    });
  });

  // ─── startScoring ──────────────────────────────────────────────────

  describe('startScoring', () => {
    it('sets isScoring to true', () => {
      useChallengeStore.getState().startScoring();
      expect(useChallengeStore.getState().isScoring).toBe(true);
    });
  });

  // ─── progress queries ──────────────────────────────────────────────

  describe('progress queries', () => {
    it('getChallengeProgress returns entry', () => {
      const progress: ChallengeProgress = {
        challengeId: 'sd1-01',
        bestScore: 85,
        stars: 3,
        attempts: 2,
        completed: true,
      };
      useChallengeStore.setState({ progress: { 'sd1-01': progress } });
      expect(useChallengeStore.getState().getChallengeProgress('sd1-01')).toBe(progress);
    });

    it('getChallengeProgress returns undefined for unknown', () => {
      expect(useChallengeStore.getState().getChallengeProgress('nonexistent')).toBeUndefined();
    });

    it('getModuleProgress counts completed + stars', () => {
      useChallengeStore.setState({
        progress: {
          'sd1-01': { challengeId: 'sd1-01', bestScore: 90, stars: 3, attempts: 1, completed: true },
          'sd1-02': { challengeId: 'sd1-02', bestScore: 40, stars: 0, attempts: 1, completed: false },
        },
      });

      const mp = useChallengeStore.getState().getModuleProgress('SD1');
      expect(mp.completed).toBe(1);
      expect(mp.total).toBe(2); // sd1-01, sd1-02 from mock metadata
      expect(mp.stars).toBe(3);
    });

    it('getTotalProgress aggregates all SD challenges', () => {
      useChallengeStore.setState({
        progress: {
          'sd1-01': { challengeId: 'sd1-01', bestScore: 90, stars: 3, attempts: 1, completed: true },
          'sd2-01': { challengeId: 'sd2-01', bestScore: 70, stars: 2, attempts: 1, completed: true },
        },
      });

      const tp = useChallengeStore.getState().getTotalProgress();
      expect(tp.completed).toBe(2);
      expect(tp.total).toBe(3); // 3 entries in mock metadata
      expect(tp.stars).toBe(5);
    });
  });
});
