/**
 * Hash Routing Tests — Concepts View
 * Tests for the new #/concepts and #/concepts/{id} routes.
 */

import { describe, it, expect } from 'vitest';
import {
  parseHash,
  buildHash,
  SANDBOX_HASHES,
  HASH_TO_SANDBOX,
} from '../../../ui/hooks/hash-routing.ts';

// ---------------------------------------------------------------------------
// parseHash — concepts
// ---------------------------------------------------------------------------

describe('parseHash — concepts', () => {
  it('parses #/concepts as concepts view', () => {
    const route = parseHash('#/concepts');
    expect(route.view).toBe('concepts');
    expect(route.conceptId).toBeUndefined();
  });

  it('parses #/concepts/filter-cutoff as concepts with conceptId', () => {
    const route = parseHash('#/concepts/filter-cutoff');
    expect(route.view).toBe('concepts');
    expect(route.conceptId).toBe('filter-cutoff');
  });

  it('parses #/concepts/amplitude-envelope as concepts with conceptId', () => {
    const route = parseHash('#/concepts/amplitude-envelope');
    expect(route.view).toBe('concepts');
    expect(route.conceptId).toBe('amplitude-envelope');
  });

  it('parses deep-link with multi-word slug', () => {
    const route = parseHash('#/concepts/fm-synthesis');
    expect(route.view).toBe('concepts');
    expect(route.conceptId).toBe('fm-synthesis');
  });

  it('does not treat #/concepts as a challenge', () => {
    const route = parseHash('#/concepts');
    expect(route.challengeId).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// buildHash — concepts
// ---------------------------------------------------------------------------

describe('buildHash — concepts', () => {
  it('builds #/concepts for concepts view without conceptId', () => {
    expect(buildHash('concepts')).toBe('#/concepts');
  });

  it('builds #/concepts/{id} for concepts view with conceptId', () => {
    expect(buildHash('concepts', undefined, 'filter-cutoff')).toBe('#/concepts/filter-cutoff');
  });

  it('builds #/concepts/{id} for deep-link', () => {
    expect(buildHash('concepts', undefined, 'amplitude-envelope')).toBe('#/concepts/amplitude-envelope');
  });
});

// ---------------------------------------------------------------------------
// Round-trips
// ---------------------------------------------------------------------------

describe('concepts round-trips', () => {
  it('concepts view round-trips through parse and build', () => {
    const hash = buildHash('concepts');
    const route = parseHash(hash);
    expect(route.view).toBe('concepts');
  });

  it('concepts deep-link round-trips through parse and build', () => {
    const hash = buildHash('concepts', undefined, 'reverb');
    const route = parseHash(hash);
    expect(route.view).toBe('concepts');
    expect(route.conceptId).toBe('reverb');
  });
});

// ---------------------------------------------------------------------------
// SANDBOX_HASHES and HASH_TO_SANDBOX include concepts
// ---------------------------------------------------------------------------

describe('concepts in lookup tables', () => {
  it('SANDBOX_HASHES includes concepts', () => {
    expect(SANDBOX_HASHES['concepts']).toBe('#/concepts');
  });

  it('HASH_TO_SANDBOX includes /concepts', () => {
    expect(HASH_TO_SANDBOX['/concepts']).toBe('concepts');
  });
});

// ---------------------------------------------------------------------------
// Existing routes still work
// ---------------------------------------------------------------------------

describe('existing routes unaffected by concepts', () => {
  it('menu still works', () => {
    expect(parseHash('#/').view).toBe('menu');
  });

  it('sandbox still works', () => {
    expect(parseHash('#/sandbox').view).toBe('sandbox');
  });

  it('challenge still works', () => {
    const route = parseHash('#/challenge/sd1-01-pure-tone');
    expect(route.view).toBe('challenge');
    expect(route.challengeId).toBe('sd1-01-pure-tone');
  });

  it('mixing challenge still works', () => {
    const route = parseHash('#/challenge/f1-01');
    expect(route.view).toBe('mixing-challenge');
    expect(route.challengeId).toBe('f1-01');
  });
});
