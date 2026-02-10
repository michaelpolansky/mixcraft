import { useState, useRef, useCallback, useEffect } from 'react';
import { useChallengeStore } from '../stores/challenge-store.ts';
import type { MixingChallenge, ProductionChallenge, SamplingChallenge, DrumSequencingChallenge } from '../../core/types.ts';

export type View =
  | 'menu'
  | 'sandbox'
  | 'fm-sandbox'
  | 'additive-sandbox'
  | 'sampler'
  | 'drum-sequencer'
  | 'challenge'
  | 'mixing-challenge'
  | 'production-challenge'
  | 'sampling-challenge'
  | 'drum-sequencer-challenge';

/**
 * Lazy-loaded challenge data modules.
 * These are loaded on first challenge navigation, not on page load.
 * This keeps ~300KB of challenge data out of the initial bundle.
 */
type MixingModule = typeof import('../../data/challenges/mixing/index.ts');
type ProductionModule = typeof import('../../data/challenges/production/index.ts');
type MainModule = typeof import('../../data/challenges/index.ts');

let mixingModule: MixingModule | null = null;
let productionModule: ProductionModule | null = null;
let mainModule: MainModule | null = null;

async function getMixingModule(): Promise<MixingModule> {
  if (!mixingModule) {
    mixingModule = await import('../../data/challenges/mixing/index.ts');
  }
  return mixingModule;
}

async function getProductionModule(): Promise<ProductionModule> {
  if (!productionModule) {
    productionModule = await import('../../data/challenges/production/index.ts');
  }
  return productionModule;
}

async function getMainModule(): Promise<MainModule> {
  if (!mainModule) {
    mainModule = await import('../../data/challenges/index.ts');
  }
  return mainModule;
}

// ---------------------------------------------------------------------------
// Hash routing utilities
// ---------------------------------------------------------------------------

type SandboxView = 'sandbox' | 'fm-sandbox' | 'additive-sandbox' | 'sampler' | 'drum-sequencer';

const SANDBOX_HASHES: Record<SandboxView, string> = {
  'sandbox': '#/sandbox',
  'fm-sandbox': '#/fm-sandbox',
  'additive-sandbox': '#/additive-sandbox',
  'sampler': '#/sampler',
  'drum-sequencer': '#/drum-sequencer',
};

const HASH_TO_SANDBOX: Record<string, SandboxView> = {
  '/sandbox': 'sandbox',
  '/fm-sandbox': 'fm-sandbox',
  '/additive-sandbox': 'additive-sandbox',
  '/sampler': 'sampler',
  '/drum-sequencer': 'drum-sequencer',
};

type ChallengeTrack = 'sd' | 'mixing' | 'production' | 'sampling' | 'drum-sequencing';

/** Determine which track a challenge ID belongs to. Order matters: sm before m. */
function getTrackFromId(id: string): ChallengeTrack {
  const lower = id.toLowerCase();
  if (lower.startsWith('sm')) return 'sampling';
  if (lower.startsWith('ds')) return 'drum-sequencing';
  if (lower.startsWith('sd')) return 'sd';
  if (lower.startsWith('p')) return 'production';
  if (/^[fiam]/.test(lower)) return 'mixing';
  return 'sd'; // fallback
}

interface ParsedRoute {
  view: View;
  challengeId?: string;
}

function parseHash(hash: string): ParsedRoute {
  // Strip leading '#'
  const path = hash.startsWith('#') ? hash.slice(1) : hash;

  if (!path || path === '/') return { view: 'menu' };

  // Sandbox views
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

function buildHash(view: View, challengeId?: string): string {
  if (view === 'menu') return '#/';
  if (view in SANDBOX_HASHES) return SANDBOX_HASHES[view as SandboxView];
  if (challengeId) return `#/challenge/${challengeId}`;
  return '#/';
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useNavigation() {
  const [view, setView] = useState<View>('menu');
  const { loadChallenge, currentChallenge, exitChallenge } = useChallengeStore();
  const [currentMixingChallenge, setCurrentMixingChallenge] = useState<MixingChallenge | null>(null);
  const [currentProductionChallenge, setCurrentProductionChallenge] = useState<ProductionChallenge | null>(null);
  const [currentSamplingChallenge, setCurrentSamplingChallenge] = useState<SamplingChallenge | null>(null);
  const [currentDrumSequencingChallenge, setCurrentDrumSequencingChallenge] = useState<DrumSequencingChallenge | null>(null);

  // Cache module references after first load for synchronous hasNext checks
  const mixingModRef = useRef<MixingModule | null>(mixingModule);
  const productionModRef = useRef<ProductionModule | null>(productionModule);
  const mainModRef = useRef<MainModule | null>(mainModule);

  // Hash suppression: prevent hashchange listener from firing when we push
  const suppressHashChangeRef = useRef(false);

  function pushHash(newView: View, challengeId?: string) {
    const hash = buildHash(newView, challengeId);
    suppressHashChangeRef.current = true;
    window.location.hash = hash;
    // Reset suppression after synchronous hashchange dispatch
    queueMicrotask(() => { suppressHashChangeRef.current = false; });
  }

  // --- Internal loaders (state-only, no hash push) ---

  const _loadSDChallenge = useCallback((challengeId: string) => {
    loadChallenge(challengeId);
    setView('challenge');
  }, [loadChallenge]);

  const _loadMixingChallenge = useCallback(async (challengeId: string) => {
    const mod = await getMixingModule();
    mixingModRef.current = mod;
    const challenge = mod.getMixingChallenge(challengeId);
    if (challenge) {
      setCurrentMixingChallenge(challenge);
      setView('mixing-challenge');
    }
  }, []);

  const _loadProductionChallenge = useCallback(async (challengeId: string) => {
    const mod = await getProductionModule();
    productionModRef.current = mod;
    const challenge = mod.getProductionChallenge(challengeId);
    if (challenge) {
      setCurrentProductionChallenge(challenge);
      setView('production-challenge');
    }
  }, []);

  const _loadSamplingChallenge = useCallback(async (challengeId: string) => {
    const mod = await getMainModule();
    mainModRef.current = mod;
    const challenge = mod.getSamplingChallenge(challengeId);
    if (challenge) {
      setCurrentSamplingChallenge(challenge);
      setView('sampling-challenge');
    }
  }, []);

  const _loadDrumSequencingChallenge = useCallback(async (challengeId: string) => {
    const mod = await getMainModule();
    mainModRef.current = mod;
    const challenge = mod.getDrumSequencingChallenge(challengeId);
    if (challenge) {
      setCurrentDrumSequencingChallenge(challenge);
      setView('drum-sequencer-challenge');
    }
  }, []);

  const _exitToMenu = useCallback(() => {
    exitChallenge();
    setCurrentMixingChallenge(null);
    setCurrentProductionChallenge(null);
    setCurrentSamplingChallenge(null);
    setCurrentDrumSequencingChallenge(null);
    setView('menu');
  }, [exitChallenge]);

  // --- Public navigation functions (state + hash push) ---

  const navigate = useCallback((newView: View) => {
    setView(newView);
    pushHash(newView);
  }, []);

  const handleStartChallenge = useCallback((challengeId: string) => {
    _loadSDChallenge(challengeId);
    pushHash('challenge', challengeId);
  }, [_loadSDChallenge]);

  const handleStartMixingChallenge = useCallback(async (challengeId: string) => {
    await _loadMixingChallenge(challengeId);
    pushHash('mixing-challenge', challengeId);
  }, [_loadMixingChallenge]);

  const handleNextMixingChallenge = useCallback(async () => {
    if (currentMixingChallenge) {
      const mod = await getMixingModule();
      mixingModRef.current = mod;
      const next = mod.getNextMixingChallenge(currentMixingChallenge.id);
      if (next) {
        setCurrentMixingChallenge(next);
        pushHash('mixing-challenge', next.id);
      } else {
        _exitToMenu();
        pushHash('menu');
      }
    }
  }, [currentMixingChallenge, _exitToMenu]);

  const handleStartProductionChallenge = useCallback(async (challengeId: string) => {
    await _loadProductionChallenge(challengeId);
    pushHash('production-challenge', challengeId);
  }, [_loadProductionChallenge]);

  const handleNextProductionChallenge = useCallback(async () => {
    if (currentProductionChallenge) {
      const mod = await getProductionModule();
      productionModRef.current = mod;
      const next = mod.getNextProductionChallenge(currentProductionChallenge.id);
      if (next) {
        setCurrentProductionChallenge(next);
        pushHash('production-challenge', next.id);
      } else {
        _exitToMenu();
        pushHash('menu');
      }
    }
  }, [currentProductionChallenge, _exitToMenu]);

  const handleStartSamplingChallenge = useCallback(async (challengeId: string) => {
    await _loadSamplingChallenge(challengeId);
    pushHash('sampling-challenge', challengeId);
  }, [_loadSamplingChallenge]);

  const handleNextSamplingChallenge = useCallback(async () => {
    if (currentSamplingChallenge) {
      const mod = await getMainModule();
      mainModRef.current = mod;
      const next = mod.getNextSamplingChallenge(currentSamplingChallenge.id);
      if (next) {
        setCurrentSamplingChallenge(next);
        pushHash('sampling-challenge', next.id);
      } else {
        _exitToMenu();
        pushHash('menu');
      }
    }
  }, [currentSamplingChallenge, _exitToMenu]);

  const handleStartDrumSequencingChallenge = useCallback(async (challengeId: string) => {
    await _loadDrumSequencingChallenge(challengeId);
    pushHash('drum-sequencer-challenge', challengeId);
  }, [_loadDrumSequencingChallenge]);

  const handleNextDrumSequencingChallenge = useCallback(async () => {
    if (currentDrumSequencingChallenge) {
      const mod = await getMainModule();
      mainModRef.current = mod;
      const next = mod.getNextDrumSequencingChallenge(currentDrumSequencingChallenge.id);
      if (next) {
        setCurrentDrumSequencingChallenge(next);
        pushHash('drum-sequencer-challenge', next.id);
      } else {
        _exitToMenu();
        pushHash('menu');
      }
    }
  }, [currentDrumSequencingChallenge, _exitToMenu]);

  // SD next challenge — delegates to the main challenge module
  const handleNextSDChallenge = useCallback(async () => {
    if (!currentChallenge) return;
    const mod = await getMainModule();
    mainModRef.current = mod;
    const next = mod.getNextChallenge(currentChallenge.id);
    if (next) {
      loadChallenge(next.id);
      pushHash('challenge', next.id);
    } else {
      _exitToMenu();
      pushHash('menu');
    }
  }, [currentChallenge, loadChallenge, _exitToMenu]);

  const handleExitChallenge = useCallback(() => {
    _exitToMenu();
    pushHash('menu');
  }, [_exitToMenu]);

  // hasNext flags — use cached module refs (available after first challenge load)
  const hasNextMixingChallenge = currentMixingChallenge && mixingModRef.current
    ? !!mixingModRef.current.getNextMixingChallenge(currentMixingChallenge.id)
    : false;
  const hasNextProductionChallenge = currentProductionChallenge && productionModRef.current
    ? !!productionModRef.current.getNextProductionChallenge(currentProductionChallenge.id)
    : false;
  const hasNextSamplingChallenge = currentSamplingChallenge && mainModRef.current
    ? !!mainModRef.current.getNextSamplingChallenge(currentSamplingChallenge.id)
    : false;
  const hasNextDrumSequencingChallenge = currentDrumSequencingChallenge && mainModRef.current
    ? !!mainModRef.current.getNextDrumSequencingChallenge(currentDrumSequencingChallenge.id)
    : false;
  const hasNextSDChallenge = currentChallenge && mainModRef.current
    ? !!mainModRef.current.getNextChallenge(currentChallenge.id)
    : false;

  // --- Hashchange listener + initial route parse ---

  // Store handlers in a ref so the hashchange effect has stable [] deps
  const handlersRef = useRef({
    _loadSDChallenge,
    _loadMixingChallenge,
    _loadProductionChallenge,
    _loadSamplingChallenge,
    _loadDrumSequencingChallenge,
    _exitToMenu,
    navigate,
  });
  handlersRef.current = {
    _loadSDChallenge,
    _loadMixingChallenge,
    _loadProductionChallenge,
    _loadSamplingChallenge,
    _loadDrumSequencingChallenge,
    _exitToMenu,
    navigate,
  };

  useEffect(() => {
    function applyRoute(hash: string) {
      const route = parseHash(hash);
      const h = handlersRef.current;

      if (route.challengeId) {
        const track = getTrackFromId(route.challengeId);
        switch (track) {
          case 'sd': h._loadSDChallenge(route.challengeId); break;
          case 'mixing': h._loadMixingChallenge(route.challengeId); break;
          case 'production': h._loadProductionChallenge(route.challengeId); break;
          case 'sampling': h._loadSamplingChallenge(route.challengeId); break;
          case 'drum-sequencing': h._loadDrumSequencingChallenge(route.challengeId); break;
        }
      } else if (route.view === 'menu') {
        h._exitToMenu();
      } else {
        // Sandbox view
        setView(route.view);
      }
    }

    // Parse initial hash on mount
    if (window.location.hash && window.location.hash !== '#/') {
      applyRoute(window.location.hash);
    }

    function onHashChange() {
      if (suppressHashChangeRef.current) return;
      applyRoute(window.location.hash);
    }

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return {
    view,
    setView: navigate,
    currentChallenge,
    currentMixingChallenge,
    currentProductionChallenge,
    currentSamplingChallenge,
    currentDrumSequencingChallenge,
    handleStartChallenge,
    handleStartMixingChallenge,
    handleNextMixingChallenge,
    hasNextMixingChallenge,
    handleStartProductionChallenge,
    handleNextProductionChallenge,
    hasNextProductionChallenge,
    handleStartSamplingChallenge,
    handleNextSamplingChallenge,
    hasNextSamplingChallenge,
    handleStartDrumSequencingChallenge,
    handleNextDrumSequencingChallenge,
    hasNextDrumSequencingChallenge,
    handleNextSDChallenge,
    hasNextSDChallenge,
    handleExitChallenge,
  };
}
