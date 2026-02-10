import { describe, it, expect } from 'vitest';
import {
  getTrackFromId,
  parseHash,
  buildHash,
  SANDBOX_HASHES,
  type View,
} from '../../../ui/hooks/hash-routing.ts';

// ---------------------------------------------------------------------------
// getTrackFromId
// ---------------------------------------------------------------------------

describe('getTrackFromId', () => {
  it('routes sd1 to sound design', () => {
    expect(getTrackFromId('sd1-01')).toBe('sd');
  });

  it('routes sd8 (FM) to sound design', () => {
    expect(getTrackFromId('sd8-01')).toBe('sd');
  });

  it('routes sd17 to sound design', () => {
    expect(getTrackFromId('sd17-06')).toBe('sd');
  });

  it('routes sm to sampling (NOT mixing) — order-sensitive', () => {
    expect(getTrackFromId('sm1-01')).toBe('sampling');
  });

  it('routes sm6 to sampling', () => {
    expect(getTrackFromId('sm6-04')).toBe('sampling');
  });

  it('routes ds to drum-sequencing', () => {
    expect(getTrackFromId('ds1-01')).toBe('drum-sequencing');
  });

  it('routes ds6 to drum-sequencing', () => {
    expect(getTrackFromId('ds6-04')).toBe('drum-sequencing');
  });

  it('routes p to production', () => {
    expect(getTrackFromId('p1-01')).toBe('production');
  });

  it('routes p5 to production', () => {
    expect(getTrackFromId('p5-04')).toBe('production');
  });

  it('routes f (fundamentals) to mixing', () => {
    expect(getTrackFromId('f1-01')).toBe('mixing');
  });

  it('routes i (intermediate) to mixing', () => {
    expect(getTrackFromId('i1-01')).toBe('mixing');
  });

  it('routes a (advanced) to mixing', () => {
    expect(getTrackFromId('a1-01')).toBe('mixing');
  });

  it('routes m (mastery) to mixing', () => {
    expect(getTrackFromId('m1-01')).toBe('mixing');
  });

  // Case insensitive
  it('handles uppercase SD', () => {
    expect(getTrackFromId('SD1-01')).toBe('sd');
  });

  it('handles uppercase SM', () => {
    expect(getTrackFromId('SM1-01')).toBe('sampling');
  });

  it('handles mixed case Ds', () => {
    expect(getTrackFromId('Ds3-02')).toBe('drum-sequencing');
  });

  // Fallback
  it('falls back to sd for unknown prefix', () => {
    expect(getTrackFromId('x99-01')).toBe('sd');
  });

  it('falls back to sd for empty string', () => {
    expect(getTrackFromId('')).toBe('sd');
  });
});

// ---------------------------------------------------------------------------
// parseHash
// ---------------------------------------------------------------------------

describe('parseHash', () => {
  it('parses empty string as menu', () => {
    expect(parseHash('')).toEqual({ view: 'menu' });
  });

  it('parses #/ as menu', () => {
    expect(parseHash('#/')).toEqual({ view: 'menu' });
  });

  it('parses / (no hash prefix) as menu', () => {
    expect(parseHash('/')).toEqual({ view: 'menu' });
  });

  // Sandbox routes
  it('parses #/sandbox', () => {
    expect(parseHash('#/sandbox')).toEqual({ view: 'sandbox' });
  });

  it('parses #/fm-sandbox', () => {
    expect(parseHash('#/fm-sandbox')).toEqual({ view: 'fm-sandbox' });
  });

  it('parses #/additive-sandbox', () => {
    expect(parseHash('#/additive-sandbox')).toEqual({ view: 'additive-sandbox' });
  });

  it('parses #/sampler', () => {
    expect(parseHash('#/sampler')).toEqual({ view: 'sampler' });
  });

  it('parses #/drum-sequencer', () => {
    expect(parseHash('#/drum-sequencer')).toEqual({ view: 'drum-sequencer' });
  });

  // Challenge routes — each track type
  it('parses SD challenge', () => {
    expect(parseHash('#/challenge/sd1-01-pure-tone')).toEqual({
      view: 'challenge',
      challengeId: 'sd1-01-pure-tone',
    });
  });

  it('parses SM challenge as sampling', () => {
    expect(parseHash('#/challenge/sm1-01-basic-chop')).toEqual({
      view: 'sampling-challenge',
      challengeId: 'sm1-01-basic-chop',
    });
  });

  it('parses DS challenge as drum-sequencer', () => {
    expect(parseHash('#/challenge/ds3-02-swing-groove')).toEqual({
      view: 'drum-sequencer-challenge',
      challengeId: 'ds3-02-swing-groove',
    });
  });

  it('parses P challenge as production', () => {
    expect(parseHash('#/challenge/p2-03-layer-bass')).toEqual({
      view: 'production-challenge',
      challengeId: 'p2-03-layer-bass',
    });
  });

  it('parses F challenge as mixing', () => {
    expect(parseHash('#/challenge/f1-01-eq-basics')).toEqual({
      view: 'mixing-challenge',
      challengeId: 'f1-01-eq-basics',
    });
  });

  it('parses I challenge as mixing', () => {
    expect(parseHash('#/challenge/i3-02')).toEqual({
      view: 'mixing-challenge',
      challengeId: 'i3-02',
    });
  });

  it('parses A challenge as mixing', () => {
    expect(parseHash('#/challenge/a1-01')).toEqual({
      view: 'mixing-challenge',
      challengeId: 'a1-01',
    });
  });

  it('parses M challenge as mixing', () => {
    expect(parseHash('#/challenge/m4-04')).toEqual({
      view: 'mixing-challenge',
      challengeId: 'm4-04',
    });
  });

  // Without # prefix (path only)
  it('parses sandbox path without # prefix', () => {
    expect(parseHash('/sandbox')).toEqual({ view: 'sandbox' });
  });

  it('parses challenge path without # prefix', () => {
    expect(parseHash('/challenge/sd1-01')).toEqual({
      view: 'challenge',
      challengeId: 'sd1-01',
    });
  });

  // Unknown path
  it('falls back to menu for unknown path', () => {
    expect(parseHash('#/unknown/thing')).toEqual({ view: 'menu' });
  });

  it('falls back to menu for gibberish', () => {
    expect(parseHash('#/xyzzy')).toEqual({ view: 'menu' });
  });
});

// ---------------------------------------------------------------------------
// buildHash
// ---------------------------------------------------------------------------

describe('buildHash', () => {
  it('builds menu hash', () => {
    expect(buildHash('menu')).toBe('#/');
  });

  it('builds sandbox hash', () => {
    expect(buildHash('sandbox')).toBe('#/sandbox');
  });

  it('builds fm-sandbox hash', () => {
    expect(buildHash('fm-sandbox')).toBe('#/fm-sandbox');
  });

  it('builds additive-sandbox hash', () => {
    expect(buildHash('additive-sandbox')).toBe('#/additive-sandbox');
  });

  it('builds sampler hash', () => {
    expect(buildHash('sampler')).toBe('#/sampler');
  });

  it('builds drum-sequencer hash', () => {
    expect(buildHash('drum-sequencer')).toBe('#/drum-sequencer');
  });

  it('builds challenge hash with ID', () => {
    expect(buildHash('challenge', 'sd1-01-pure-tone')).toBe('#/challenge/sd1-01-pure-tone');
  });

  it('builds mixing-challenge hash with ID', () => {
    expect(buildHash('mixing-challenge', 'f1-01')).toBe('#/challenge/f1-01');
  });

  it('falls back to #/ for challenge view without ID', () => {
    expect(buildHash('challenge')).toBe('#/');
  });
});

// ---------------------------------------------------------------------------
// Round-trip: parseHash(buildHash(view, id)) === original
// ---------------------------------------------------------------------------

describe('round-trip', () => {
  it('round-trips menu', () => {
    const hash = buildHash('menu');
    expect(parseHash(hash)).toEqual({ view: 'menu' });
  });

  const sandboxViews: View[] = ['sandbox', 'fm-sandbox', 'additive-sandbox', 'sampler', 'drum-sequencer'];
  for (const view of sandboxViews) {
    it(`round-trips ${view}`, () => {
      const hash = buildHash(view);
      expect(parseHash(hash)).toEqual({ view });
    });
  }

  it('round-trips SD challenge', () => {
    const hash = buildHash('challenge', 'sd1-01-pure-tone');
    expect(parseHash(hash)).toEqual({ view: 'challenge', challengeId: 'sd1-01-pure-tone' });
  });

  it('round-trips mixing challenge', () => {
    const hash = buildHash('mixing-challenge', 'f3-02-eq-sweep');
    expect(parseHash(hash)).toEqual({ view: 'mixing-challenge', challengeId: 'f3-02-eq-sweep' });
  });

  it('round-trips sampling challenge', () => {
    const hash = buildHash('sampling-challenge', 'sm2-01-pitch-shift');
    expect(parseHash(hash)).toEqual({ view: 'sampling-challenge', challengeId: 'sm2-01-pitch-shift' });
  });

  it('round-trips drum-sequencing challenge', () => {
    const hash = buildHash('drum-sequencer-challenge', 'ds4-03-velocity');
    expect(parseHash(hash)).toEqual({ view: 'drum-sequencer-challenge', challengeId: 'ds4-03-velocity' });
  });

  it('round-trips production challenge', () => {
    const hash = buildHash('production-challenge', 'p1-02-freq-stack');
    expect(parseHash(hash)).toEqual({ view: 'production-challenge', challengeId: 'p1-02-freq-stack' });
  });
});
