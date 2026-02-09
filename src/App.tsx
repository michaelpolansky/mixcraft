/**
 * MIXCRAFT Application Entry Point
 */

import { useEffect, lazy, Suspense } from 'react';

// Lazy load heavy view components for code splitting
const SynthView = lazy(() => import('./ui/views/SynthView.tsx').then(m => ({ default: m.SynthView })));
const ChallengeView = lazy(() => import('./ui/views/ChallengeView.tsx').then(m => ({ default: m.ChallengeView })));
const MixingChallengeView = lazy(() => import('./ui/views/MixingChallengeView.tsx').then(m => ({ default: m.MixingChallengeView })));
const MultiTrackMixingView = lazy(() => import('./ui/views/MultiTrackMixingView.tsx').then(m => ({ default: m.MultiTrackMixingView })));
const ProductionChallengeView = lazy(() => import('./ui/views/ProductionChallengeView.tsx').then(m => ({ default: m.ProductionChallengeView })));
const FMSynthView = lazy(() => import('./ui/views/FMSynthView.tsx').then(m => ({ default: m.FMSynthView })));
const AdditiveSynthView = lazy(() => import('./ui/views/AdditiveSynthView.tsx').then(m => ({ default: m.AdditiveSynthView })));
const SamplerView = lazy(() => import('./ui/views/SamplerView.tsx').then(m => ({ default: m.SamplerView })));
const SamplerChallengeView = lazy(() => import('./ui/views/SamplerChallengeView.tsx').then(m => ({ default: m.SamplerChallengeView })));
const DrumSequencerView = lazy(() => import('./ui/views/DrumSequencerView.tsx').then(m => ({ default: m.DrumSequencerView })));
const DrumSequencerChallengeView = lazy(() => import('./ui/views/DrumSequencerChallengeView.tsx').then(m => ({ default: m.DrumSequencerChallengeView })));
import { useSynthStore } from './ui/stores/synth-store.ts';
import { useAuthStore } from './ui/stores/auth-store.ts';
import { useProgressSync } from './ui/hooks/useProgressSync.ts';
import { useNavigation } from './ui/hooks/useNavigation.ts';
import { BackButton } from './ui/components/Button.tsx';
import { ToastProvider } from './ui/components/Toast.tsx';
import { MenuView } from './ui/views/MenuView.tsx';
import { getNextMixingChallenge } from './data/challenges/mixing/index.ts';
import { getNextProductionChallenge } from './data/challenges/production/index.ts';
import { getNextSamplingChallenge, getNextDrumSequencingChallenge } from './data/challenges/index.ts';

function LoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#4ade80',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            border: '3px solid #333',
            borderTopColor: '#4ade80',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: '#666', fontSize: '14px' }}>Loading...</p>
      </div>
    </div>
  );
}

function AppContent() {
  const { initEngine, startAudio, isInitialized } = useSynthStore();
  const initializeAuth = useAuthStore((s) => s.initialize);
  const nav = useNavigation();

  useEffect(() => {
    initEngine();
    initializeAuth();
  }, [initEngine, initializeAuth]);

  useProgressSync();

  // Start screen — requires user gesture for audio
  if (!isInitialized) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#0a0a0a',
          color: '#fff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <h1 style={{ fontSize: '48px', fontWeight: 300, marginBottom: '8px', color: '#4ade80' }}>
          MIXCRAFT
        </h1>
        <p style={{ color: '#666', marginBottom: '32px' }}>
          Learn Sound Design Through Play
        </p>
        <button
          onClick={() => startAudio()}
          style={{
            padding: '16px 48px',
            fontSize: '16px',
            background: 'linear-gradient(145deg, #22c55e, #16a34a)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
          }}
        >
          Start
        </button>
        <p style={{ color: '#444', fontSize: '12px', marginTop: '16px' }}>
          Click to enable audio (browser requirement)
        </p>
      </div>
    );
  }

  // Challenge views
  if (nav.view === 'challenge' && nav.currentChallenge) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <ChallengeView onExit={nav.handleExitChallenge} />
      </Suspense>
    );
  }

  if (nav.view === 'mixing-challenge' && nav.currentMixingChallenge) {
    const hasNext = !!getNextMixingChallenge(nav.currentMixingChallenge.id);
    const isMultiTrack = !!nav.currentMixingChallenge.tracks && nav.currentMixingChallenge.tracks.length > 0;
    return (
      <Suspense fallback={<LoadingFallback />}>
        {isMultiTrack ? (
          <MultiTrackMixingView
            challenge={nav.currentMixingChallenge}
            onExit={nav.handleExitChallenge}
            onNext={nav.handleNextMixingChallenge}
            hasNext={hasNext}
          />
        ) : (
          <MixingChallengeView
            challenge={nav.currentMixingChallenge}
            onExit={nav.handleExitChallenge}
            onNext={nav.handleNextMixingChallenge}
            hasNext={hasNext}
          />
        )}
      </Suspense>
    );
  }

  if (nav.view === 'production-challenge' && nav.currentProductionChallenge) {
    const hasNext = !!getNextProductionChallenge(nav.currentProductionChallenge.id);
    return (
      <Suspense fallback={<LoadingFallback />}>
        <ProductionChallengeView
          challenge={nav.currentProductionChallenge}
          onExit={nav.handleExitChallenge}
          onNext={nav.handleNextProductionChallenge}
          hasNext={hasNext}
        />
      </Suspense>
    );
  }

  if (nav.view === 'sampling-challenge' && nav.currentSamplingChallenge) {
    const hasNext = !!getNextSamplingChallenge(nav.currentSamplingChallenge.id);
    return (
      <Suspense fallback={<LoadingFallback />}>
        <SamplerChallengeView
          challenge={nav.currentSamplingChallenge}
          onExit={nav.handleExitChallenge}
          onNext={nav.handleNextSamplingChallenge}
          hasNext={hasNext}
        />
      </Suspense>
    );
  }

  if (nav.view === 'drum-sequencer-challenge' && nav.currentDrumSequencingChallenge) {
    const hasNext = !!getNextDrumSequencingChallenge(nav.currentDrumSequencingChallenge.id);
    return (
      <Suspense fallback={<LoadingFallback />}>
        <DrumSequencerChallengeView
          challenge={nav.currentDrumSequencingChallenge}
          onExit={nav.handleExitChallenge}
          onNext={nav.handleNextDrumSequencingChallenge}
          hasNext={hasNext}
        />
      </Suspense>
    );
  }

  // Sandbox views
  if (nav.view === 'sandbox') {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <div>
          <div style={{ position: 'fixed', top: '16px', left: '16px', zIndex: 100 }}>
            <BackButton onClick={() => nav.setView('menu')} />
          </div>
          <SynthView />
        </div>
      </Suspense>
    );
  }

  if (nav.view === 'fm-sandbox') {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <div>
          <div style={{ position: 'fixed', top: '16px', left: '16px', zIndex: 100 }}>
            <BackButton onClick={() => nav.setView('menu')} />
          </div>
          <FMSynthView />
        </div>
      </Suspense>
    );
  }

  if (nav.view === 'additive-sandbox') {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <div>
          <div style={{ position: 'fixed', top: '16px', left: '16px', zIndex: 100 }}>
            <BackButton onClick={() => nav.setView('menu')} />
          </div>
          <AdditiveSynthView />
        </div>
      </Suspense>
    );
  }

  if (nav.view === 'sampler') {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <SamplerView onBack={() => nav.setView('menu')} />
      </Suspense>
    );
  }

  if (nav.view === 'drum-sequencer') {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <DrumSequencerView onBack={() => nav.setView('menu')} />
      </Suspense>
    );
  }

  // Main menu (default)
  return (
    <MenuView
      onNavigate={(v) => nav.setView(v as ReturnType<typeof useNavigation>['view'])}
      onStartChallenge={nav.handleStartChallenge}
      onStartMixingChallenge={nav.handleStartMixingChallenge}
      onStartProductionChallenge={nav.handleStartProductionChallenge}
      onStartSamplingChallenge={nav.handleStartSamplingChallenge}
      onStartDrumSequencingChallenge={nav.handleStartDrumSequencingChallenge}
    />
  );
}

export function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
