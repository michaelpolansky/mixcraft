/**
 * Hash routing utilities — pure functions for URL ↔ view mapping.
 *
 * Extracted from useNavigation so they can be unit-tested without React/jsdom.
 */

export type View =
  | 'menu'
  | 'sandbox'
  | 'fm-sandbox'
  | 'additive-sandbox'
  | 'sampler'
  | 'drum-sequencer'
  | 'concepts'
  | 'challenge'
  | 'mixing-challenge'
  | 'production-challenge'
  | 'sampling-challenge'
  | 'drum-sequencer-challenge';

export type SandboxView = 'sandbox' | 'fm-sandbox' | 'additive-sandbox' | 'sampler' | 'drum-sequencer' | 'concepts';
export type ChallengeTrack = 'sd' | 'mixing' | 'production' | 'sampling' | 'drum-sequencing';

export interface ParsedRoute {
  view: View;
  challengeId?: string;
  conceptId?: string;
}

export const SANDBOX_HASHES: Record<SandboxView, string> = {
  'sandbox': '#/sandbox',
  'fm-sandbox': '#/fm-sandbox',
  'additive-sandbox': '#/additive-sandbox',
  'sampler': '#/sampler',
  'drum-sequencer': '#/drum-sequencer',
  'concepts': '#/concepts',
};

export const HASH_TO_SANDBOX: Record<string, SandboxView> = {
  '/sandbox': 'sandbox',
  '/fm-sandbox': 'fm-sandbox',
  '/additive-sandbox': 'additive-sandbox',
  '/sampler': 'sampler',
  '/drum-sequencer': 'drum-sequencer',
  '/concepts': 'concepts',
};

/** Determine which track a challenge ID belongs to. Order matters: sm before m. */
export function getTrackFromId(id: string): ChallengeTrack {
  const lower = id.toLowerCase();
  if (lower.startsWith('sm')) return 'sampling';
  if (lower.startsWith('ds')) return 'drum-sequencing';
  if (lower.startsWith('sd')) return 'sd';
  if (lower.startsWith('p')) return 'production';
  if (/^[fiam]/.test(lower)) return 'mixing';
  return 'sd'; // fallback
}

export function parseHash(hash: string): ParsedRoute {
  // Strip leading '#'
  const path = hash.startsWith('#') ? hash.slice(1) : hash;

  if (!path || path === '/') return { view: 'menu' };

  // Concepts deep-link: #/concepts/{conceptId}
  const conceptMatch = path.match(/^\/concepts\/(.+)$/);
  if (conceptMatch) {
    return { view: 'concepts', conceptId: conceptMatch[1]! };
  }

  // Sandbox views (includes #/concepts without deep-link)
  const sandbox = HASH_TO_SANDBOX[path];
  if (sandbox) return { view: sandbox };

  // Challenge: #/challenge/{id}
  const challengeMatch = path.match(/^\/challenge\/(.+)$/);
  if (challengeMatch) {
    const challengeId = challengeMatch[1]!;
    const track = getTrackFromId(challengeId);
    const viewMap: Record<ChallengeTrack, View> = {
      'sd': 'challenge',
      'mixing': 'mixing-challenge',
      'production': 'production-challenge',
      'sampling': 'sampling-challenge',
      'drum-sequencing': 'drum-sequencer-challenge',
    };
    return { view: viewMap[track], challengeId };
  }

  return { view: 'menu' };
}

export function buildHash(view: View, challengeId?: string, conceptId?: string): string {
  if (view === 'menu') return '#/';
  if (view === 'concepts' && conceptId) return `#/concepts/${conceptId}`;
  if (view in SANDBOX_HASHES) return SANDBOX_HASHES[view as SandboxView];
  if (challengeId) return `#/challenge/${challengeId}`;
  return '#/';
}
