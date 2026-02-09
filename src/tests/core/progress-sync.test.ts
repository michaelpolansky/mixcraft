/**
 * Progress Sync Tests
 * Tests for merge logic, store reading, and store distribution.
 */

import { describe, it, expect } from 'vitest';
import { mergeProgress } from '../../core/progress-sync.ts';
import type { ChallengeProgress } from '../../core/types.ts';

// Helper to create a ChallengeProgress record
function p(id: string, overrides: Partial<ChallengeProgress> = {}): ChallengeProgress {
  return {
    challengeId: id,
    bestScore: 0,
    stars: 0,
    attempts: 0,
    completed: false,
    ...overrides,
  };
}

describe('mergeProgress', () => {
  it('returns empty for two empty records', () => {
    const result = mergeProgress({}, {});
    expect(result).toEqual({});
  });

  it('returns local-only entries when cloud is empty', () => {
    const local = {
      'SD1-1': p('SD1-1', { bestScore: 80, stars: 2, attempts: 3, completed: true }),
      'SD1-2': p('SD1-2', { bestScore: 50, stars: 1, attempts: 1, completed: true }),
    };

    const result = mergeProgress(local, {});
    expect(result).toEqual(local);
  });

  it('returns cloud-only entries when local is empty', () => {
    const cloud = {
      'F1-1': p('F1-1', { bestScore: 90, stars: 3, attempts: 5, completed: true }),
    };

    const result = mergeProgress({}, cloud);
    expect(result).toEqual(cloud);
  });

  it('takes best score when both exist — local better', () => {
    const local = { 'SD1-1': p('SD1-1', { bestScore: 90, stars: 3, attempts: 5, completed: true }) };
    const cloud = { 'SD1-1': p('SD1-1', { bestScore: 70, stars: 2, attempts: 3, completed: true }) };

    const result = mergeProgress(local, cloud);
    expect(result['SD1-1']!.bestScore).toBe(90);
    expect(result['SD1-1']!.stars).toBe(3);
    expect(result['SD1-1']!.attempts).toBe(5);
    expect(result['SD1-1']!.completed).toBe(true);
  });

  it('takes best score when both exist — cloud better', () => {
    const local = { 'SD1-1': p('SD1-1', { bestScore: 60, stars: 1, attempts: 2, completed: true }) };
    const cloud = { 'SD1-1': p('SD1-1', { bestScore: 95, stars: 3, attempts: 10, completed: true }) };

    const result = mergeProgress(local, cloud);
    expect(result['SD1-1']!.bestScore).toBe(95);
    expect(result['SD1-1']!.stars).toBe(3);
    expect(result['SD1-1']!.attempts).toBe(10);
  });

  it('takes mixed best from each — score from local, stars from cloud', () => {
    const local = { 'SD1-1': p('SD1-1', { bestScore: 85, stars: 2, attempts: 4, completed: false }) };
    const cloud = { 'SD1-1': p('SD1-1', { bestScore: 70, stars: 3, attempts: 2, completed: true }) };

    const result = mergeProgress(local, cloud);
    expect(result['SD1-1']!.bestScore).toBe(85); // local wins
    expect(result['SD1-1']!.stars).toBe(3);      // cloud wins
    expect(result['SD1-1']!.attempts).toBe(4);   // local wins
    expect(result['SD1-1']!.completed).toBe(true); // cloud wins (OR)
  });

  it('merges completed with OR — true if either is true', () => {
    const local = { 'SD1-1': p('SD1-1', { completed: false }) };
    const cloud = { 'SD1-1': p('SD1-1', { completed: true }) };

    expect(mergeProgress(local, cloud)['SD1-1']!.completed).toBe(true);
    expect(mergeProgress(cloud, local)['SD1-1']!.completed).toBe(true);
  });

  it('merges disjoint sets correctly', () => {
    const local = {
      'SD1-1': p('SD1-1', { bestScore: 80 }),
      'SD1-2': p('SD1-2', { bestScore: 60 }),
    };
    const cloud = {
      'F1-1': p('F1-1', { bestScore: 90 }),
      'SD1-2': p('SD1-2', { bestScore: 70 }),
    };

    const result = mergeProgress(local, cloud);
    expect(Object.keys(result).sort()).toEqual(['F1-1', 'SD1-1', 'SD1-2']);
    expect(result['SD1-1']!.bestScore).toBe(80);
    expect(result['F1-1']!.bestScore).toBe(90);
    expect(result['SD1-2']!.bestScore).toBe(70); // cloud wins
  });

  it('is commutative — merge(A, B) === merge(B, A)', () => {
    const a = {
      'SD1-1': p('SD1-1', { bestScore: 80, stars: 2, attempts: 3, completed: true }),
      'F1-1': p('F1-1', { bestScore: 50, stars: 1, attempts: 1, completed: false }),
    };
    const b = {
      'SD1-1': p('SD1-1', { bestScore: 70, stars: 3, attempts: 5, completed: false }),
      'P1-1': p('P1-1', { bestScore: 90, stars: 3, attempts: 2, completed: true }),
    };

    const ab = mergeProgress(a, b);
    const ba = mergeProgress(b, a);

    expect(ab).toEqual(ba);
  });

  it('is idempotent — merge(A, merge(A, B)) === merge(A, B)', () => {
    const a = {
      'SD1-1': p('SD1-1', { bestScore: 80, stars: 2, attempts: 3, completed: true }),
    };
    const b = {
      'SD1-1': p('SD1-1', { bestScore: 70, stars: 3, attempts: 5, completed: false }),
    };

    const ab = mergeProgress(a, b);
    const aab = mergeProgress(a, ab);

    expect(aab).toEqual(ab);
  });

  it('handles all five track prefixes', () => {
    const local = {
      'SD1-1': p('SD1-1', { bestScore: 80 }),
      'F1-1': p('F1-1', { bestScore: 70 }),
      'P1-1': p('P1-1', { bestScore: 60 }),
      'SM1-1': p('SM1-1', { bestScore: 50 }),
      'DS1-1': p('DS1-1', { bestScore: 40 }),
    };

    const result = mergeProgress(local, {});
    expect(Object.keys(result).length).toBe(5);
  });
});

describe('getStoreForChallenge', () => {
  // Import the function
  let getStoreForChallenge: (id: string) => string;

  it('should be importable', async () => {
    const mod = await import('../../core/progress-sync.ts');
    getStoreForChallenge = mod.getStoreForChallenge;
    expect(typeof getStoreForChallenge).toBe('function');
  });

  it('routes SD challenges to challenge store', async () => {
    const mod = await import('../../core/progress-sync.ts');
    expect(mod.getStoreForChallenge('SD1-1')).toBe('challenge');
    expect(mod.getStoreForChallenge('SD17-4')).toBe('challenge');
  });

  it('routes mixing challenges to mixing store', async () => {
    const mod = await import('../../core/progress-sync.ts');
    expect(mod.getStoreForChallenge('F1-1')).toBe('mixing');
    expect(mod.getStoreForChallenge('I3-2')).toBe('mixing');
    expect(mod.getStoreForChallenge('A1-1')).toBe('mixing');
    expect(mod.getStoreForChallenge('M2-3')).toBe('mixing');
  });

  it('routes production challenges to production store', async () => {
    const mod = await import('../../core/progress-sync.ts');
    expect(mod.getStoreForChallenge('P1-1')).toBe('production');
    expect(mod.getStoreForChallenge('P5-4')).toBe('production');
  });

  it('routes sampling challenges to sampler store', async () => {
    const mod = await import('../../core/progress-sync.ts');
    expect(mod.getStoreForChallenge('SM1-1')).toBe('sampler');
    expect(mod.getStoreForChallenge('SM6-4')).toBe('sampler');
  });

  it('routes drum sequencing challenges to drum-sequencer store', async () => {
    const mod = await import('../../core/progress-sync.ts');
    expect(mod.getStoreForChallenge('DS1-1')).toBe('drum-sequencer');
    expect(mod.getStoreForChallenge('DS6-4')).toBe('drum-sequencer');
  });

  it('SM prefix takes priority over M prefix', async () => {
    const mod = await import('../../core/progress-sync.ts');
    // SM1-1 should go to sampler, not mixing (which handles M prefix)
    expect(mod.getStoreForChallenge('SM1-1')).toBe('sampler');
  });
});
