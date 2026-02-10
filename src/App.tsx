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
const ConceptLibraryView = lazy(() => import('./ui/views/ConceptLibraryView.tsx').then(m => ({ default: m.ConceptLibraryView })));
import { useSynthStore } from './ui/stores/synth-store.ts';
import { useAuthStore } from './ui/stores/auth-store.ts';
import { useProgressSync } from './ui/hooks/useProgressSync.ts';
import { useNavigation } from './ui/hooks/useNavigation.ts';
import { BackButton } from './ui/components/Button.tsx';
import { ToastProvider } from './ui/components/Toast.tsx';
import { ErrorBoundary } from './ui/components/ErrorBoundary.tsx';
import { ConceptModalProvider } from './ui/context/ConceptModalContext.tsx';
import { ConceptDetailModal } from './ui/components/concepts/ConceptDetailModal.tsx';
import { MenuView } from './ui/views/MenuView.tsx';

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

function AppErrorFallback() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0a0a0a',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        textAlign: 'center',
        padding: '32px',
      }}
    >
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>!</div>
      <h1 style={{ color: '#ffffff', fontSize: '24px', fontWeight: 600, margin: '0 0 8px' }}>
        Something went wrong
      </h1>
      <p style={{ color: '#888888', fontSize: '14px', margin: '0 0 24px', lineHeight: 1.5 }}>
        An unexpected error occurred. Your progress has been saved.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: '12px 32px',
          fontSize: '16px',
          background: 'linear-gradient(145deg, #22c55e, #16a34a)',
          border: 'none',
          borderRadius: '8px',
          color: '#ffffff',
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        Reload
      </button>
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
  if (nav.view === 'challenge') {
    if (!nav.currentChallenge) return <LoadingFallback />;
    return (
      <ErrorBoundary onReset={() => nav.setView('menu')}>
        <Suspense fallback={<LoadingFallback />}>
          <ChallengeView
            onExit={nav.handleExitChallenge}
            onNext={nav.handleNextSDChallenge}
            hasNext={nav.hasNextSDChallenge}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (nav.view === 'mixing-challenge') {
    if (!nav.currentMixingChallenge) return <LoadingFallback />;
    const hasNext = nav.hasNextMixingChallenge;
    const isMultiTrack = !!nav.currentMixingChallenge.tracks && nav.currentMixingChallenge.tracks.length > 0;
    return (
      <ErrorBoundary onReset={() => nav.setView('menu')}>
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
      </ErrorBoundary>
    );
  }

  if (nav.view === 'production-challenge') {
    if (!nav.currentProductionChallenge) return <LoadingFallback />;
    const hasNext = nav.hasNextProductionChallenge;
    return (
      <ErrorBoundary onReset={() => nav.setView('menu')}>
        <Suspense fallback={<LoadingFallback />}>
          <ProductionChallengeView
            challenge={nav.currentProductionChallenge}
            onExit={nav.handleExitChallenge}
            onNext={nav.handleNextProductionChallenge}
            hasNext={hasNext}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (nav.view === 'sampling-challenge') {
    if (!nav.currentSamplingChallenge) return <LoadingFallback />;
    const hasNext = nav.hasNextSamplingChallenge;
    return (
      <ErrorBoundary onReset={() => nav.setView('menu')}>
        <Suspense fallback={<LoadingFallback />}>
          <SamplerChallengeView
            challenge={nav.currentSamplingChallenge}
            onExit={nav.handleExitChallenge}
            onNext={nav.handleNextSamplingChallenge}
            hasNext={hasNext}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (nav.view === 'drum-sequencer-challenge') {
    if (!nav.currentDrumSequencingChallenge) return <LoadingFallback />;
    const hasNext = nav.hasNextDrumSequencingChallenge;
    return (
      <ErrorBoundary onReset={() => nav.setView('menu')}>
        <Suspense fallback={<LoadingFallback />}>
          <DrumSequencerChallengeView
            challenge={nav.currentDrumSequencingChallenge}
            onExit={nav.handleExitChallenge}
            onNext={nav.handleNextDrumSequencingChallenge}
            hasNext={hasNext}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }

  // Concept Library
  if (nav.view === 'concepts') {
    return (
      <ErrorBoundary onReset={() => nav.setView('menu')}>
        <Suspense fallback={<LoadingFallback />}>
          <ConceptLibraryView
            onBack={() => nav.setView('menu')}
            initialConceptId={nav.conceptId}
            onStartChallenge={nav.handleStartChallenge}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }

  // Sandbox views
  if (nav.view === 'sandbox') {
    return (
      <ErrorBoundary onReset={() => nav.setView('menu')}>
        <Suspense fallback={<LoadingFallback />}>
          <div>
            <div style={{ position: 'fixed', top: '16px', left: '16px', zIndex: 100 }}>
              <BackButton onClick={() => nav.setView('menu')} />
            </div>
            <SynthView />
          </div>
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (nav.view === 'fm-sandbox') {
    return (
      <ErrorBoundary onReset={() => nav.setView('menu')}>
        <Suspense fallback={<LoadingFallback />}>
          <div>
            <div style={{ position: 'fixed', top: '16px', left: '16px', zIndex: 100 }}>
              <BackButton onClick={() => nav.setView('menu')} />
            </div>
            <FMSynthView />
          </div>
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (nav.view === 'additive-sandbox') {
    return (
      <ErrorBoundary onReset={() => nav.setView('menu')}>
        <Suspense fallback={<LoadingFallback />}>
          <div>
            <div style={{ position: 'fixed', top: '16px', left: '16px', zIndex: 100 }}>
              <BackButton onClick={() => nav.setView('menu')} />
            </div>
            <AdditiveSynthView />
          </div>
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (nav.view === 'sampler') {
    return (
      <ErrorBoundary onReset={() => nav.setView('menu')}>
        <Suspense fallback={<LoadingFallback />}>
          <SamplerView onBack={() => nav.setView('menu')} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (nav.view === 'drum-sequencer') {
    return (
      <ErrorBoundary onReset={() => nav.setView('menu')}>
        <Suspense fallback={<LoadingFallback />}>
          <DrumSequencerView onBack={() => nav.setView('menu')} />
        </Suspense>
      </ErrorBoundary>
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
      <ConceptModalProvider>
        <ErrorBoundary fallback={<AppErrorFallback />}>
          <AppContent />
          <ConceptDetailModal />
        </ErrorBoundary>
      </ConceptModalProvider>
    </ToastProvider>
  );
}
