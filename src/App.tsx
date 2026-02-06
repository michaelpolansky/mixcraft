/**
 * MIXCRAFT Application Entry Point
 */

import { useState, useEffect, lazy, Suspense } from 'react';

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
import { useSynthStore } from './ui/stores/synth-store.ts';
import { useChallengeStore } from './ui/stores/challenge-store.ts';
import { useMixingStore } from './ui/stores/mixing-store.ts';
import { useProductionStore } from './ui/stores/production-store.ts';
import { allChallenges, modules } from './data/challenges/index.ts';
import { allMixingChallenges, mixingModules, getMixingChallenge, getNextMixingChallenge } from './data/challenges/mixing/index.ts';
import { allProductionChallenges, productionModules, getProductionChallenge, getNextProductionChallenge } from './data/challenges/production/index.ts';
import { useIsMobile } from './ui/hooks/useMediaQuery.ts';
import type { MixingChallenge, ProductionChallenge, SamplingChallenge } from './core/types.ts';

// Loading fallback for lazy-loaded views
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

type View = 'menu' | 'sandbox' | 'fm-sandbox' | 'additive-sandbox' | 'sampler' | 'challenge' | 'mixing-challenge' | 'production-challenge' | 'sampling-challenge';

export function App() {
  const [view, setView] = useState<View>('menu');
  const { initEngine, startAudio, isInitialized } = useSynthStore();
  const { loadChallenge, currentChallenge, exitChallenge, getChallengeProgress, getTotalProgress, getModuleProgress } = useChallengeStore();
  const { getChallengeProgress: getMixingProgress, getModuleProgress: getMixingModuleProgress } = useMixingStore();
  const { getChallengeProgress: getProductionProgress, getModuleProgress: getProductionModuleProgress } = useProductionStore();
  const [currentMixingChallenge, setCurrentMixingChallenge] = useState<MixingChallenge | null>(null);
  const [currentProductionChallenge, setCurrentProductionChallenge] = useState<ProductionChallenge | null>(null);
  const [currentSamplingChallenge, setCurrentSamplingChallenge] = useState<SamplingChallenge | null>(null);
  const isMobile = useIsMobile();

  // Onboarding state - show for first-time users
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem('mixcraft-onboarding-seen');
  });

  const dismissOnboarding = () => {
    localStorage.setItem('mixcraft-onboarding-seen', 'true');
    setShowOnboarding(false);
  };

  // Initialize synth engine on mount
  useEffect(() => {
    initEngine();
  }, [initEngine]);

  // Handle starting audio (requires user gesture)
  const handleStart = async () => {
    await startAudio();
  };

  // Start a sound design challenge
  const handleStartChallenge = (challengeId: string) => {
    loadChallenge(challengeId);
    setView('challenge');
  };

  // Start a mixing challenge
  const handleStartMixingChallenge = (challengeId: string) => {
    const challenge = getMixingChallenge(challengeId);
    if (challenge) {
      setCurrentMixingChallenge(challenge);
      setView('mixing-challenge');
    }
  };

  // Handle next mixing challenge
  const handleNextMixingChallenge = () => {
    if (currentMixingChallenge) {
      const next = getNextMixingChallenge(currentMixingChallenge.id);
      if (next) {
        setCurrentMixingChallenge(next);
      } else {
        setCurrentMixingChallenge(null);
        setView('menu');
      }
    }
  };

  // Start a production challenge
  const handleStartProductionChallenge = (challengeId: string) => {
    const challenge = getProductionChallenge(challengeId);
    if (challenge) {
      setCurrentProductionChallenge(challenge);
      setView('production-challenge');
    }
  };

  // Handle next production challenge
  const handleNextProductionChallenge = () => {
    if (currentProductionChallenge) {
      const next = getNextProductionChallenge(currentProductionChallenge.id);
      if (next) {
        setCurrentProductionChallenge(next);
      } else {
        setCurrentProductionChallenge(null);
        setView('menu');
      }
    }
  };

  // Exit challenge
  const handleExitChallenge = () => {
    exitChallenge();
    setCurrentMixingChallenge(null);
    setCurrentProductionChallenge(null);
    setCurrentSamplingChallenge(null);
    setView('menu');
  };

  // Start a sampling challenge
  const handleStartSamplingChallenge = (challenge: SamplingChallenge) => {
    setCurrentSamplingChallenge(challenge);
    setView('sampling-challenge');
  };

  // Handle next sampling challenge (placeholder - will be implemented with challenge data)
  const handleNextSamplingChallenge = () => {
    // For now, just go back to menu
    // TODO: Implement getNextSamplingChallenge when challenges are created
    setCurrentSamplingChallenge(null);
    setView('menu');
  };

  // Not initialized - show start screen
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
        <h1
          style={{
            fontSize: '48px',
            fontWeight: 300,
            marginBottom: '8px',
            color: '#4ade80',
          }}
        >
          MIXCRAFT
        </h1>
        <p style={{ color: '#666', marginBottom: '32px' }}>
          Learn Sound Design Through Play
        </p>
        <button
          onClick={handleStart}
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

  // Sound design challenge view
  if (view === 'challenge' && currentChallenge) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <ChallengeView onExit={handleExitChallenge} />
      </Suspense>
    );
  }

  // Mixing challenge view
  if (view === 'mixing-challenge' && currentMixingChallenge) {
    const hasNext = !!getNextMixingChallenge(currentMixingChallenge.id);
    const isMultiTrack = !!currentMixingChallenge.tracks && currentMixingChallenge.tracks.length > 0;

    return (
      <Suspense fallback={<LoadingFallback />}>
        {isMultiTrack ? (
          <MultiTrackMixingView
            challenge={currentMixingChallenge}
            onExit={handleExitChallenge}
            onNext={handleNextMixingChallenge}
            hasNext={hasNext}
          />
        ) : (
          <MixingChallengeView
            challenge={currentMixingChallenge}
            onExit={handleExitChallenge}
            onNext={handleNextMixingChallenge}
            hasNext={hasNext}
          />
        )}
      </Suspense>
    );
  }

  // Production challenge view
  if (view === 'production-challenge' && currentProductionChallenge) {
    const hasNext = !!getNextProductionChallenge(currentProductionChallenge.id);
    return (
      <Suspense fallback={<LoadingFallback />}>
        <ProductionChallengeView
          challenge={currentProductionChallenge}
          onExit={handleExitChallenge}
          onNext={handleNextProductionChallenge}
          hasNext={hasNext}
        />
      </Suspense>
    );
  }

  // Sampling challenge view
  if (view === 'sampling-challenge' && currentSamplingChallenge) {
    // TODO: hasNext will be calculated from sampling challenge data when created
    const hasNext = false;
    return (
      <Suspense fallback={<LoadingFallback />}>
        <SamplerChallengeView
          challenge={currentSamplingChallenge}
          onExit={handleExitChallenge}
          onNext={handleNextSamplingChallenge}
          hasNext={hasNext}
        />
      </Suspense>
    );
  }

  // Sandbox view
  if (view === 'sandbox') {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <div>
          <div
            style={{
              position: 'fixed',
              top: '16px',
              left: '16px',
              zIndex: 100,
            }}
          >
            <button
              onClick={() => setView('menu')}
              style={{
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '4px',
                color: '#888',
                cursor: 'pointer',
                padding: '8px 16px',
                fontSize: '13px',
              }}
            >
              ← Menu
            </button>
          </div>
          <SynthView />
        </div>
      </Suspense>
    );
  }

  // FM Sandbox view
  if (view === 'fm-sandbox') {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <div>
          <div
            style={{
              position: 'fixed',
              top: '16px',
              left: '16px',
              zIndex: 100,
            }}
          >
            <button
              onClick={() => setView('menu')}
              style={{
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '4px',
                color: '#888',
                cursor: 'pointer',
                padding: '8px 16px',
                fontSize: '13px',
              }}
            >
              ← Menu
            </button>
          </div>
          <FMSynthView />
        </div>
      </Suspense>
    );
  }

  // Additive Sandbox view
  if (view === 'additive-sandbox') {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <div>
          <div
            style={{
              position: 'fixed',
              top: '16px',
              left: '16px',
              zIndex: 100,
            }}
          >
            <button
              onClick={() => setView('menu')}
              style={{
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '4px',
                color: '#888',
                cursor: 'pointer',
                padding: '8px 16px',
                fontSize: '13px',
              }}
            >
              ← Menu
            </button>
          </div>
          <AdditiveSynthView />
        </div>
      </Suspense>
    );
  }

  // Sampler Sandbox view
  if (view === 'sampler') {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <SamplerView onBack={() => setView('menu')} />
      </Suspense>
    );
  }

  // Main menu
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: isMobile ? '24px 16px' : '48px',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <h1
          style={{
            fontSize: '36px',
            fontWeight: 300,
            color: '#4ade80',
            marginBottom: '8px',
          }}
        >
          MIXCRAFT
        </h1>
        <p style={{ color: '#666', marginBottom: '24px' }}>
          Learn Sound Design Through Play
        </p>

        {/* Progress Stats */}
        {(() => {
          const { completed, total, stars } = getTotalProgress();
          const maxStars = total * 3;
          const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

          if (completed === 0 && stars === 0) return null;

          return (
            <div
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'stretch' : 'center',
                gap: isMobile ? '16px' : '24px',
                padding: isMobile ? '16px' : '16px 20px',
                background: '#141414',
                borderRadius: '12px',
                border: '1px solid #2a2a2a',
                marginBottom: '32px',
              }}
            >
              {/* Stars and Progress Row on Mobile */}
              <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '16px' : '24px', flex: isMobile ? undefined : 'none' }}>
                {/* Stars */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#eab308', fontSize: '20px' }}>★</span>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 600 }}>{stars}</div>
                    <div style={{ fontSize: '11px', color: '#666' }}>of {maxStars} stars</div>
                  </div>
                </div>

                {/* Divider - hide on mobile */}
                {!isMobile && <div style={{ width: '1px', height: '32px', background: '#333' }} />}

                {/* Percentage badge - inline on mobile */}
                {isMobile && (
                  <div
                    style={{
                      marginLeft: 'auto',
                      padding: '6px 12px',
                      background: percentage === 100 ? '#22c55e' : '#1a1a1a',
                      borderRadius: '16px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: percentage === 100 ? '#000' : '#fff',
                    }}
                  >
                    {percentage}%
                  </div>
                )}
              </div>

              {/* Completion */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: '#888' }}>Progress</span>
                  <span style={{ fontSize: '13px', fontWeight: 500 }}>{completed}/{total} challenges</span>
                </div>
                <div
                  style={{
                    height: '6px',
                    background: '#222',
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${percentage}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #22c55e, #4ade80)',
                      borderRadius: '3px',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>

              {/* Percentage badge - desktop only */}
              {!isMobile && (
                <div
                  style={{
                    padding: '6px 12px',
                    background: percentage === 100 ? '#22c55e' : '#1a1a1a',
                    borderRadius: '16px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: percentage === 100 ? '#000' : '#fff',
                  }}
                >
                  {percentage}%
                </div>
              )}
            </div>
          );
        })()}

        {/* Mode Selection */}
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '16px', marginBottom: isMobile ? '32px' : '48px' }}>
          {/* Continue Button - shows only if there's progress */}
          {(() => {
            const { completed, total } = getTotalProgress();
            if (completed === 0 || completed === total) return null;

            // Find first incomplete challenge
            const nextChallenge = allChallenges.find(
              c => !getChallengeProgress(c.id)?.completed
            );
            if (!nextChallenge) return null;

            return (
              <button
                onClick={() => handleStartChallenge(nextChallenge.id)}
                style={{
                  padding: '20px 32px',
                  background: 'linear-gradient(145deg, #22c55e, #16a34a)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  flex: 1,
                  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                }}
              >
                <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>
                  Continue
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
                  {nextChallenge.title}
                </div>
              </button>
            );
          })()}

          <button
            onClick={() => setView('sandbox')}
            style={{
              padding: '20px 32px',
              background: '#141414',
              border: '1px solid #2a2a2a',
              borderRadius: '12px',
              color: '#fff',
              cursor: 'pointer',
              textAlign: 'left',
              flex: 1,
            }}
          >
            <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>
              Sandbox
            </div>
            <div style={{ fontSize: '13px', color: '#666' }}>
              Free play with the synthesizer
            </div>
          </button>

          <button
            onClick={() => setView('fm-sandbox')}
            style={{
              padding: '20px 32px',
              background: '#141414',
              border: '1px solid #ff8800',
              borderRadius: '12px',
              color: '#fff',
              cursor: 'pointer',
              textAlign: 'left',
              flex: 1,
            }}
          >
            <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px', color: '#ff8800' }}>
              FM Sandbox
            </div>
            <div style={{ fontSize: '13px', color: '#666' }}>
              Explore FM synthesis bells & basses
            </div>
          </button>

          <button
            onClick={() => setView('additive-sandbox')}
            style={{
              padding: '20px 32px',
              background: '#141414',
              border: '1px solid #06b6d4',
              borderRadius: '12px',
              color: '#fff',
              cursor: 'pointer',
              textAlign: 'left',
              flex: 1,
            }}
          >
            <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px', color: '#06b6d4' }}>
              Additive Sandbox
            </div>
            <div style={{ fontSize: '13px', color: '#666' }}>
              Build sounds from harmonics
            </div>
          </button>

          <button
            onClick={() => setView('sampler')}
            style={{
              padding: '20px 32px',
              background: '#141414',
              border: '1px solid #a855f7',
              borderRadius: '12px',
              color: '#fff',
              cursor: 'pointer',
              textAlign: 'left',
              flex: 1,
            }}
          >
            <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px', color: '#a855f7' }}>
              Sampler Sandbox
            </div>
            <div style={{ fontSize: '13px', color: '#666' }}>
              Load and manipulate samples
            </div>
          </button>
        </div>

        {/* Challenges */}
        <h2
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '16px',
          }}
        >
          Challenges
        </h2>

        {/* Onboarding tooltip - first-time users */}
        {showOnboarding && (
          <div
            style={{
              background: 'linear-gradient(145deg, #1e3a2f, #14532d)',
              border: '1px solid #22c55e',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '16px',
              position: 'relative',
            }}
          >
            <button
              onClick={dismissOnboarding}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'none',
                border: 'none',
                color: '#4ade80',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '4px',
                lineHeight: 1,
              }}
              aria-label="Dismiss"
            >
              ×
            </button>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>🎹</span>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600, color: '#4ade80' }}>
                  Welcome to MIXCRAFT!
                </h3>
                <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#a7f3d0', lineHeight: 1.5 }}>
                  Learn sound design by ear. Each challenge plays a target sound - your goal is to recreate it using the synthesizer controls.
                </p>
                <div style={{ fontSize: '13px', color: '#86efac' }}>
                  <strong>How to play:</strong> Listen to the target → Adjust knobs → Compare → Match the sound!
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Module: SD1 */}
        <div
          style={{
            background: '#141414',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #2a2a2a',
            marginBottom: '16px',
          }}
        >
          {(() => {
            const mp = getModuleProgress('SD1');
            const pct = mp.total > 0 ? Math.round((mp.completed / mp.total) * 100) : 0;
            return (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                    {modules.SD1.title}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
                    {modules.SD1.description}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: '#eab308', fontSize: '13px' }}>
                    {'★'.repeat(mp.stars)}<span style={{ color: '#333' }}>{'★'.repeat(mp.total * 3 - mp.stars)}</span>
                  </div>
                  <div
                    style={{
                      padding: '4px 10px',
                      background: pct === 100 ? '#22c55e' : '#222',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: pct === 100 ? '#000' : '#888',
                    }}
                  >
                    {mp.completed}/{mp.total}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Challenge List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {allChallenges
              .filter((c) => c.module === 'SD1')
              .map((challenge) => {
                const progress = getChallengeProgress(challenge.id);
                const stars = progress?.stars ?? 0;

                return (
                  <button
                    key={challenge.id}
                    onClick={() => handleStartChallenge(challenge.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: '#0a0a0a',
                      border: '1px solid #222',
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>
                        {challenge.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {'★'.repeat(challenge.difficulty)}
                        {'☆'.repeat(3 - challenge.difficulty)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {/* Progress stars */}
                      <div style={{ color: '#eab308', fontSize: '14px' }}>
                        {'★'.repeat(stars)}
                        <span style={{ color: '#333' }}>{'★'.repeat(3 - stars)}</span>
                      </div>

                      {/* Completed check */}
                      {progress?.completed && (
                        <span style={{ color: '#22c55e', fontSize: '16px' }}>✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Module: SD2 */}
        <div
          style={{
            background: '#141414',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #2a2a2a',
            marginBottom: '16px',
          }}
        >
          {(() => {
            const mp = getModuleProgress('SD2');
            const pct = mp.total > 0 ? Math.round((mp.completed / mp.total) * 100) : 0;
            return (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                    {modules.SD2.title}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
                    {modules.SD2.description}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: '#eab308', fontSize: '13px' }}>
                    {'★'.repeat(mp.stars)}<span style={{ color: '#333' }}>{'★'.repeat(mp.total * 3 - mp.stars)}</span>
                  </div>
                  <div
                    style={{
                      padding: '4px 10px',
                      background: pct === 100 ? '#22c55e' : '#222',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: pct === 100 ? '#000' : '#888',
                    }}
                  >
                    {mp.completed}/{mp.total}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Challenge List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {allChallenges
              .filter((c) => c.module === 'SD2')
              .map((challenge) => {
                const progress = getChallengeProgress(challenge.id);
                const stars = progress?.stars ?? 0;

                return (
                  <button
                    key={challenge.id}
                    onClick={() => handleStartChallenge(challenge.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: '#0a0a0a',
                      border: '1px solid #222',
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>
                        {challenge.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {'★'.repeat(challenge.difficulty)}
                        {'☆'.repeat(3 - challenge.difficulty)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {/* Progress stars */}
                      <div style={{ color: '#eab308', fontSize: '14px' }}>
                        {'★'.repeat(stars)}
                        <span style={{ color: '#333' }}>{'★'.repeat(3 - stars)}</span>
                      </div>

                      {/* Completed check */}
                      {progress?.completed && (
                        <span style={{ color: '#22c55e', fontSize: '16px' }}>✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Module: SD3 */}
        <div
          style={{
            background: '#141414',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #2a2a2a',
            marginBottom: '16px',
          }}
        >
          {(() => {
            const mp = getModuleProgress('SD3');
            const pct = mp.total > 0 ? Math.round((mp.completed / mp.total) * 100) : 0;
            return (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                    {modules.SD3.title}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
                    {modules.SD3.description}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: '#eab308', fontSize: '13px' }}>
                    {'★'.repeat(mp.stars)}<span style={{ color: '#333' }}>{'★'.repeat(mp.total * 3 - mp.stars)}</span>
                  </div>
                  <div
                    style={{
                      padding: '4px 10px',
                      background: pct === 100 ? '#22c55e' : '#222',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: pct === 100 ? '#000' : '#888',
                    }}
                  >
                    {mp.completed}/{mp.total}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Challenge List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {allChallenges
              .filter((c) => c.module === 'SD3')
              .map((challenge) => {
                const progress = getChallengeProgress(challenge.id);
                const stars = progress?.stars ?? 0;

                return (
                  <button
                    key={challenge.id}
                    onClick={() => handleStartChallenge(challenge.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: '#0a0a0a',
                      border: '1px solid #222',
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>
                        {challenge.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {'★'.repeat(challenge.difficulty)}
                        {'☆'.repeat(3 - challenge.difficulty)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {/* Progress stars */}
                      <div style={{ color: '#eab308', fontSize: '14px' }}>
                        {'★'.repeat(stars)}
                        <span style={{ color: '#333' }}>{'★'.repeat(3 - stars)}</span>
                      </div>

                      {/* Completed check */}
                      {progress?.completed && (
                        <span style={{ color: '#22c55e', fontSize: '16px' }}>✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Module: SD4 */}
        <div
          style={{
            background: '#141414',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #2a2a2a',
            marginBottom: '16px',
          }}
        >
          {(() => {
            const mp = getModuleProgress('SD4');
            const pct = mp.total > 0 ? Math.round((mp.completed / mp.total) * 100) : 0;
            return (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                    {modules.SD4.title}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
                    {modules.SD4.description}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: '#eab308', fontSize: '13px' }}>
                    {'★'.repeat(mp.stars)}<span style={{ color: '#333' }}>{'★'.repeat(mp.total * 3 - mp.stars)}</span>
                  </div>
                  <div
                    style={{
                      padding: '4px 10px',
                      background: pct === 100 ? '#22c55e' : '#222',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: pct === 100 ? '#000' : '#888',
                    }}
                  >
                    {mp.completed}/{mp.total}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Challenge List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {allChallenges
              .filter((c) => c.module === 'SD4')
              .map((challenge) => {
                const progress = getChallengeProgress(challenge.id);
                const stars = progress?.stars ?? 0;

                return (
                  <button
                    key={challenge.id}
                    onClick={() => handleStartChallenge(challenge.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: '#0a0a0a',
                      border: '1px solid #222',
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>
                        {challenge.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {'★'.repeat(challenge.difficulty)}
                        {'☆'.repeat(3 - challenge.difficulty)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {/* Progress stars */}
                      <div style={{ color: '#eab308', fontSize: '14px' }}>
                        {'★'.repeat(stars)}
                        <span style={{ color: '#333' }}>{'★'.repeat(3 - stars)}</span>
                      </div>

                      {/* Completed check */}
                      {progress?.completed && (
                        <span style={{ color: '#22c55e', fontSize: '16px' }}>✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Module: SD5 */}
        <div
          style={{
            background: '#141414',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #2a2a2a',
            marginBottom: '16px',
          }}
        >
          {(() => {
            const mp = getModuleProgress('SD5');
            const pct = mp.total > 0 ? Math.round((mp.completed / mp.total) * 100) : 0;
            return (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                    {modules.SD5.title}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
                    {modules.SD5.description}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: '#eab308', fontSize: '13px' }}>
                    {'★'.repeat(mp.stars)}<span style={{ color: '#333' }}>{'★'.repeat(mp.total * 3 - mp.stars)}</span>
                  </div>
                  <div
                    style={{
                      padding: '4px 10px',
                      background: pct === 100 ? '#22c55e' : '#222',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: pct === 100 ? '#000' : '#888',
                    }}
                  >
                    {mp.completed}/{mp.total}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Challenge List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {allChallenges
              .filter((c) => c.module === 'SD5')
              .map((challenge) => {
                const progress = getChallengeProgress(challenge.id);
                const stars = progress?.stars ?? 0;

                return (
                  <button
                    key={challenge.id}
                    onClick={() => handleStartChallenge(challenge.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: '#0a0a0a',
                      border: '1px solid #222',
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>
                        {challenge.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {'★'.repeat(challenge.difficulty)}
                        {'☆'.repeat(3 - challenge.difficulty)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {/* Progress stars */}
                      <div style={{ color: '#eab308', fontSize: '14px' }}>
                        {'★'.repeat(stars)}
                        <span style={{ color: '#333' }}>{'★'.repeat(3 - stars)}</span>
                      </div>

                      {/* Completed check */}
                      {progress?.completed && (
                        <span style={{ color: '#22c55e', fontSize: '16px' }}>✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Module: SD6 */}
        <div
          style={{
            background: '#141414',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #2a2a2a',
            marginBottom: '16px',
          }}
        >
          {(() => {
            const mp = getModuleProgress('SD6');
            const pct = mp.total > 0 ? Math.round((mp.completed / mp.total) * 100) : 0;
            return (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                    {modules.SD6.title}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
                    {modules.SD6.description}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: '#eab308', fontSize: '13px' }}>
                    {'★'.repeat(mp.stars)}<span style={{ color: '#333' }}>{'★'.repeat(mp.total * 3 - mp.stars)}</span>
                  </div>
                  <div
                    style={{
                      padding: '4px 10px',
                      background: pct === 100 ? '#22c55e' : '#222',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: pct === 100 ? '#000' : '#888',
                    }}
                  >
                    {mp.completed}/{mp.total}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Challenge List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {allChallenges
              .filter((c) => c.module === 'SD6')
              .map((challenge) => {
                const progress = getChallengeProgress(challenge.id);
                const stars = progress?.stars ?? 0;

                return (
                  <button
                    key={challenge.id}
                    onClick={() => handleStartChallenge(challenge.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: '#0a0a0a',
                      border: '1px solid #222',
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>
                        {challenge.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {'★'.repeat(challenge.difficulty)}
                        {'☆'.repeat(3 - challenge.difficulty)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {/* Progress stars */}
                      <div style={{ color: '#eab308', fontSize: '14px' }}>
                        {'★'.repeat(stars)}
                        <span style={{ color: '#333' }}>{'★'.repeat(3 - stars)}</span>
                      </div>

                      {/* Completed check */}
                      {progress?.completed && (
                        <span style={{ color: '#22c55e', fontSize: '16px' }}>✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Module: SD7 */}
        <div
          style={{
            background: '#141414',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #2a2a2a',
            marginBottom: '16px',
          }}
        >
          {(() => {
            const mp = getModuleProgress('SD7');
            const pct = mp.total > 0 ? Math.round((mp.completed / mp.total) * 100) : 0;
            return (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                    {modules.SD7.title}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
                    {modules.SD7.description}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: '#eab308', fontSize: '13px' }}>
                    {'★'.repeat(mp.stars)}<span style={{ color: '#333' }}>{'★'.repeat(mp.total * 3 - mp.stars)}</span>
                  </div>
                  <div
                    style={{
                      padding: '4px 10px',
                      background: pct === 100 ? '#22c55e' : '#222',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: pct === 100 ? '#000' : '#888',
                    }}
                  >
                    {mp.completed}/{mp.total}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Challenge List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {allChallenges
              .filter((c) => c.module === 'SD7')
              .map((challenge) => {
                const progress = getChallengeProgress(challenge.id);
                const stars = progress?.stars ?? 0;

                return (
                  <button
                    key={challenge.id}
                    onClick={() => handleStartChallenge(challenge.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      background: '#1a1a1a',
                      border: '1px solid #222',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      color: '#fff',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#222';
                      e.currentTarget.style.borderColor = '#333';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#1a1a1a';
                      e.currentTarget.style.borderColor = '#222';
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 500, marginBottom: '2px' }}>
                        {challenge.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {'●'.repeat(challenge.difficulty)}
                        <span style={{ color: '#333' }}>
                          {'●'.repeat(3 - challenge.difficulty)}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {/* Progress stars */}
                      <div style={{ color: '#eab308', fontSize: '14px' }}>
                        {'★'.repeat(stars)}
                        <span style={{ color: '#333' }}>{'★'.repeat(3 - stars)}</span>
                      </div>

                      {/* Completed check */}
                      {progress?.completed && (
                        <span style={{ color: '#22c55e', fontSize: '16px' }}>✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Mixing Fundamentals Section */}
        <h2
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#3b82f6',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '16px',
            marginTop: '32px',
          }}
        >
          Mixing Fundamentals
        </h2>

        {/* Module: F1 - Frequency Basics */}
        <div
          style={{
            background: '#141414',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #2a2a2a',
            marginBottom: '16px',
          }}
        >
          {(() => {
            const mp = getMixingModuleProgress('F1', allMixingChallenges);
            const pct = mp.total > 0 ? Math.round((mp.completed / mp.total) * 100) : 0;
            return (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                    {mixingModules.F1.title}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
                    {mixingModules.F1.description}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: '#eab308', fontSize: '13px' }}>
                    {'★'.repeat(mp.stars)}<span style={{ color: '#333' }}>{'★'.repeat(mp.total * 3 - mp.stars)}</span>
                  </div>
                  <div
                    style={{
                      padding: '4px 10px',
                      background: pct === 100 ? '#22c55e' : '#222',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: pct === 100 ? '#000' : '#888',
                    }}
                  >
                    {mp.completed}/{mp.total}
                  </div>
                </div>
              </div>
            );
          })()}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {allMixingChallenges
              .filter((c) => c.module === 'F1')
              .map((challenge) => {
                const progress = getMixingProgress(challenge.id);
                const stars = progress?.stars ?? 0;

                return (
                  <button
                    key={challenge.id}
                    onClick={() => handleStartMixingChallenge(challenge.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: '#0a0a0a',
                      border: '1px solid #222',
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>
                        {challenge.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {'★'.repeat(challenge.difficulty)}
                        {'☆'.repeat(3 - challenge.difficulty)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ color: '#eab308', fontSize: '14px' }}>
                        {'★'.repeat(stars)}
                        <span style={{ color: '#333' }}>{'★'.repeat(3 - stars)}</span>
                      </div>
                      {progress?.completed && (
                        <span style={{ color: '#22c55e', fontSize: '16px' }}>✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Module: F2 - EQ Shaping */}
        <div
          style={{
            background: '#141414',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #2a2a2a',
            marginBottom: '16px',
          }}
        >
          {(() => {
            const mp = getMixingModuleProgress('F2', allMixingChallenges);
            const pct = mp.total > 0 ? Math.round((mp.completed / mp.total) * 100) : 0;
            return (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                    {mixingModules.F2.title}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
                    {mixingModules.F2.description}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: '#eab308', fontSize: '13px' }}>
                    {'★'.repeat(mp.stars)}<span style={{ color: '#333' }}>{'★'.repeat(mp.total * 3 - mp.stars)}</span>
                  </div>
                  <div
                    style={{
                      padding: '4px 10px',
                      background: pct === 100 ? '#22c55e' : '#222',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: pct === 100 ? '#000' : '#888',
                    }}
                  >
                    {mp.completed}/{mp.total}
                  </div>
                </div>
              </div>
            );
          })()}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {allMixingChallenges
              .filter((c) => c.module === 'F2')
              .map((challenge) => {
                const progress = getMixingProgress(challenge.id);
                const stars = progress?.stars ?? 0;

                return (
                  <button
                    key={challenge.id}
                    onClick={() => handleStartMixingChallenge(challenge.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: '#0a0a0a',
                      border: '1px solid #222',
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>
                        {challenge.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {'★'.repeat(challenge.difficulty)}
                        {'☆'.repeat(3 - challenge.difficulty)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ color: '#eab308', fontSize: '14px' }}>
                        {'★'.repeat(stars)}
                        <span style={{ color: '#333' }}>{'★'.repeat(3 - stars)}</span>
                      </div>
                      {progress?.completed && (
                        <span style={{ color: '#22c55e', fontSize: '16px' }}>✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Module: F3 - EQ Repair */}
        <div
          style={{
            background: '#141414',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #2a2a2a',
            marginBottom: '16px',
          }}
        >
          {(() => {
            const mp = getMixingModuleProgress('F3', allMixingChallenges);
            const pct = mp.total > 0 ? Math.round((mp.completed / mp.total) * 100) : 0;
            return (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                    {mixingModules.F3.title}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
                    {mixingModules.F3.description}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: '#eab308', fontSize: '13px' }}>
                    {'★'.repeat(mp.stars)}<span style={{ color: '#333' }}>{'★'.repeat(mp.total * 3 - mp.stars)}</span>
                  </div>
                  <div
                    style={{
                      padding: '4px 10px',
                      background: pct === 100 ? '#22c55e' : '#222',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: pct === 100 ? '#000' : '#888',
                    }}
                  >
                    {mp.completed}/{mp.total}
                  </div>
                </div>
              </div>
            );
          })()}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {allMixingChallenges
              .filter((c) => c.module === 'F3')
              .map((challenge) => {
                const progress = getMixingProgress(challenge.id);
                const stars = progress?.stars ?? 0;

                return (
                  <button
                    key={challenge.id}
                    onClick={() => handleStartMixingChallenge(challenge.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: '#0a0a0a',
                      border: '1px solid #222',
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>
                        {challenge.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {'★'.repeat(challenge.difficulty)}
                        {'☆'.repeat(3 - challenge.difficulty)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ color: '#eab308', fontSize: '14px' }}>
                        {'★'.repeat(stars)}
                        <span style={{ color: '#333' }}>{'★'.repeat(3 - stars)}</span>
                      </div>
                      {progress?.completed && (
                        <span style={{ color: '#22c55e', fontSize: '16px' }}>✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Module: F4 - Compression Basics */}
        <div
          style={{
            background: '#141414',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #2a2a2a',
            marginBottom: '16px',
          }}
        >
          {(() => {
            const mp = getMixingModuleProgress('F4', allMixingChallenges);
            const pct = mp.total > 0 ? Math.round((mp.completed / mp.total) * 100) : 0;
            return (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                    {mixingModules.F4.title}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
                    {mixingModules.F4.description}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: '#eab308', fontSize: '13px' }}>
                    {'★'.repeat(mp.stars)}<span style={{ color: '#333' }}>{'★'.repeat(mp.total * 3 - mp.stars)}</span>
                  </div>
                  <div
                    style={{
                      padding: '4px 10px',
                      background: pct === 100 ? '#22c55e' : '#222',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: pct === 100 ? '#000' : '#888',
                    }}
                  >
                    {mp.completed}/{mp.total}
                  </div>
                </div>
              </div>
            );
          })()}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {allMixingChallenges
              .filter((c) => c.module === 'F4')
              .map((challenge) => {
                const progress = getMixingProgress(challenge.id);
                const stars = progress?.stars ?? 0;

                return (
                  <button
                    key={challenge.id}
                    onClick={() => handleStartMixingChallenge(challenge.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: '#0a0a0a',
                      border: '1px solid #222',
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>
                        {challenge.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {'★'.repeat(challenge.difficulty)}
                        {'☆'.repeat(3 - challenge.difficulty)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ color: '#eab308', fontSize: '14px' }}>
                        {'★'.repeat(stars)}
                        <span style={{ color: '#333' }}>{'★'.repeat(3 - stars)}</span>
                      </div>
                      {progress?.completed && (
                        <span style={{ color: '#22c55e', fontSize: '16px' }}>✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Module: F5 - Advanced Compression */}
        <div
          style={{
            background: '#141414',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #2a2a2a',
            marginBottom: '16px',
          }}
        >
          {(() => {
            const mp = getMixingModuleProgress('F5', allMixingChallenges);
            const pct = mp.total > 0 ? Math.round((mp.completed / mp.total) * 100) : 0;
            return (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                    {mixingModules.F5.title}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
                    {mixingModules.F5.description}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: '#eab308', fontSize: '13px' }}>
                    {'★'.repeat(mp.stars)}<span style={{ color: '#333' }}>{'★'.repeat(mp.total * 3 - mp.stars)}</span>
                  </div>
                  <div
                    style={{
                      padding: '4px 10px',
                      background: pct === 100 ? '#22c55e' : '#222',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: pct === 100 ? '#000' : '#888',
                    }}
                  >
                    {mp.completed}/{mp.total}
                  </div>
                </div>
              </div>
            );
          })()}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {allMixingChallenges
              .filter((c) => c.module === 'F5')
              .map((challenge) => {
                const progress = getMixingProgress(challenge.id);
                const stars = progress?.stars ?? 0;

                return (
                  <button
                    key={challenge.id}
                    onClick={() => handleStartMixingChallenge(challenge.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: '#0a0a0a',
                      border: '1px solid #222',
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>
                        {challenge.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {'★'.repeat(challenge.difficulty)}
                        {'☆'.repeat(3 - challenge.difficulty)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ color: '#eab308', fontSize: '14px' }}>
                        {'★'.repeat(stars)}
                        <span style={{ color: '#333' }}>{'★'.repeat(3 - stars)}</span>
                      </div>
                      {progress?.completed && (
                        <span style={{ color: '#22c55e', fontSize: '16px' }}>✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Module: F6 - Combined Processing */}
        <div
          style={{
            background: '#141414',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #2a2a2a',
            marginBottom: '16px',
          }}
        >
          {(() => {
            const mp = getMixingModuleProgress('F6', allMixingChallenges);
            const pct = mp.total > 0 ? Math.round((mp.completed / mp.total) * 100) : 0;
            return (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                    {mixingModules.F6.title}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
                    {mixingModules.F6.description}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: '#eab308', fontSize: '13px' }}>
                    {'★'.repeat(mp.stars)}<span style={{ color: '#333' }}>{'★'.repeat(mp.total * 3 - mp.stars)}</span>
                  </div>
                  <div
                    style={{
                      padding: '4px 10px',
                      background: pct === 100 ? '#22c55e' : '#222',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: pct === 100 ? '#000' : '#888',
                    }}
                  >
                    {mp.completed}/{mp.total}
                  </div>
                </div>
              </div>
            );
          })()}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {allMixingChallenges
              .filter((c) => c.module === 'F6')
              .map((challenge) => {
                const progress = getMixingProgress(challenge.id);
                const stars = progress?.stars ?? 0;

                return (
                  <button
                    key={challenge.id}
                    onClick={() => handleStartMixingChallenge(challenge.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: '#0a0a0a',
                      border: '1px solid #222',
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>
                        {challenge.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {'★'.repeat(challenge.difficulty)}
                        {'☆'.repeat(3 - challenge.difficulty)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ color: '#eab308', fontSize: '14px' }}>
                        {'★'.repeat(stars)}
                        <span style={{ color: '#333' }}>{'★'.repeat(3 - stars)}</span>
                      </div>
                      {progress?.completed && (
                        <span style={{ color: '#22c55e', fontSize: '16px' }}>✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Module: F7 - Problem Solving */}
        <div
          style={{
            background: '#141414',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #2a2a2a',
            marginBottom: '16px',
          }}
        >
          {(() => {
            const mp = getMixingModuleProgress('F7', allMixingChallenges);
            const pct = mp.total > 0 ? Math.round((mp.completed / mp.total) * 100) : 0;
            return (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                    {mixingModules.F7.title}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
                    {mixingModules.F7.description}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: '#eab308', fontSize: '13px' }}>
                    {'★'.repeat(mp.stars)}<span style={{ color: '#333' }}>{'★'.repeat(mp.total * 3 - mp.stars)}</span>
                  </div>
                  <div
                    style={{
                      padding: '4px 10px',
                      background: pct === 100 ? '#22c55e' : '#222',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: pct === 100 ? '#000' : '#888',
                    }}
                  >
                    {mp.completed}/{mp.total}
                  </div>
                </div>
              </div>
            );
          })()}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {allMixingChallenges
              .filter((c) => c.module === 'F7')
              .map((challenge) => {
                const progress = getMixingProgress(challenge.id);
                const stars = progress?.stars ?? 0;

                return (
                  <button
                    key={challenge.id}
                    onClick={() => handleStartMixingChallenge(challenge.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: '#0a0a0a',
                      border: '1px solid #222',
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>
                        {challenge.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {'★'.repeat(challenge.difficulty)}
                        {'☆'.repeat(3 - challenge.difficulty)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ color: '#eab308', fontSize: '14px' }}>
                        {'★'.repeat(stars)}
                        <span style={{ color: '#333' }}>{'★'.repeat(3 - stars)}</span>
                      </div>
                      {progress?.completed && (
                        <span style={{ color: '#22c55e', fontSize: '16px' }}>✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Module: F8 - Mix Balance */}
        <div
          style={{
            background: '#141414',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #2a2a2a',
            marginBottom: '24px',
          }}
        >
          {(() => {
            const mp = getMixingModuleProgress('F8', allMixingChallenges);
            const pct = mp.total > 0 ? Math.round((mp.completed / mp.total) * 100) : 0;
            return (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                    {mixingModules.F8.title}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
                    {mixingModules.F8.description}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: '#eab308', fontSize: '13px' }}>
                    {'★'.repeat(mp.stars)}<span style={{ color: '#333' }}>{'★'.repeat(mp.total * 3 - mp.stars)}</span>
                  </div>
                  <div
                    style={{
                      padding: '4px 10px',
                      background: pct === 100 ? '#22c55e' : '#222',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: pct === 100 ? '#000' : '#888',
                    }}
                  >
                    {mp.completed}/{mp.total}
                  </div>
                </div>
              </div>
            );
          })()}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {allMixingChallenges
              .filter((c) => c.module === 'F8')
              .map((challenge) => {
                const progress = getMixingProgress(challenge.id);
                const stars = progress?.stars ?? 0;

                return (
                  <button
                    key={challenge.id}
                    onClick={() => handleStartMixingChallenge(challenge.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: '#0a0a0a',
                      border: '1px solid #222',
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>
                        {challenge.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {'★'.repeat(challenge.difficulty)}
                        {'☆'.repeat(3 - challenge.difficulty)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ color: '#eab308', fontSize: '14px' }}>
                        {'★'.repeat(stars)}
                        <span style={{ color: '#333' }}>{'★'.repeat(3 - stars)}</span>
                      </div>
                      {progress?.completed && (
                        <span style={{ color: '#22c55e', fontSize: '16px' }}>✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Production Section */}
        <h2
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#a855f7',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '16px',
            marginTop: '32px',
          }}
        >
          Production
        </h2>

        {/* Module: P1 - Frequency Stacking */}
        <div
          style={{
            background: '#141414',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #2a2a2a',
            marginBottom: '16px',
          }}
        >
          {(() => {
            const mp = getProductionModuleProgress('P1', allProductionChallenges);
            const pct = mp.total > 0 ? Math.round((mp.completed / mp.total) * 100) : 0;
            return (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                    {productionModules.P1.title}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
                    {productionModules.P1.description}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: '#eab308', fontSize: '13px' }}>
                    {'★'.repeat(mp.stars)}<span style={{ color: '#333' }}>{'★'.repeat(mp.total * 3 - mp.stars)}</span>
                  </div>
                  <div
                    style={{
                      padding: '4px 10px',
                      background: pct === 100 ? '#22c55e' : '#222',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: pct === 100 ? '#000' : '#888',
                    }}
                  >
                    {mp.completed}/{mp.total}
                  </div>
                </div>
              </div>
            );
          })()}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {allProductionChallenges
              .filter((c) => c.module === 'P1')
              .map((challenge) => {
                const progress = getProductionProgress(challenge.id);
                const stars = progress?.stars ?? 0;

                return (
                  <button
                    key={challenge.id}
                    onClick={() => handleStartProductionChallenge(challenge.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: '#0a0a0a',
                      border: '1px solid #222',
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>
                        {challenge.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {'★'.repeat(challenge.difficulty)}
                        {'☆'.repeat(3 - challenge.difficulty)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ color: '#eab308', fontSize: '14px' }}>
                        {'★'.repeat(stars)}
                        <span style={{ color: '#333' }}>{'★'.repeat(3 - stars)}</span>
                      </div>
                      {progress?.completed && (
                        <span style={{ color: '#22c55e', fontSize: '16px' }}>✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Module: P2 - Layering */}
        <div
          style={{
            background: '#141414',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #2a2a2a',
            marginBottom: '16px',
          }}
        >
          {(() => {
            const mp = getProductionModuleProgress('P2', allProductionChallenges);
            const pct = mp.total > 0 ? Math.round((mp.completed / mp.total) * 100) : 0;
            return (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                    {productionModules.P2.title}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
                    {productionModules.P2.description}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: '#eab308', fontSize: '13px' }}>
                    {'★'.repeat(mp.stars)}<span style={{ color: '#333' }}>{'★'.repeat(mp.total * 3 - mp.stars)}</span>
                  </div>
                  <div
                    style={{
                      padding: '4px 10px',
                      background: pct === 100 ? '#22c55e' : '#222',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: pct === 100 ? '#000' : '#888',
                    }}
                  >
                    {mp.completed}/{mp.total}
                  </div>
                </div>
              </div>
            );
          })()}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {allProductionChallenges
              .filter((c) => c.module === 'P2')
              .map((challenge) => {
                const progress = getProductionProgress(challenge.id);
                const stars = progress?.stars ?? 0;

                return (
                  <button
                    key={challenge.id}
                    onClick={() => handleStartProductionChallenge(challenge.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: '#0a0a0a',
                      border: '1px solid #222',
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>
                        {challenge.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {'★'.repeat(challenge.difficulty)}
                        {'☆'.repeat(3 - challenge.difficulty)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ color: '#eab308', fontSize: '14px' }}>
                        {'★'.repeat(stars)}
                        <span style={{ color: '#333' }}>{'★'.repeat(3 - stars)}</span>
                      </div>
                      {progress?.completed && (
                        <span style={{ color: '#22c55e', fontSize: '16px' }}>✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Module: P3 - Arrangement Energy */}
        <div
          style={{
            background: '#141414',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #2a2a2a',
            marginBottom: '16px',
          }}
        >
          {(() => {
            const mp = getProductionModuleProgress('P3', allProductionChallenges);
            const pct = mp.total > 0 ? Math.round((mp.completed / mp.total) * 100) : 0;
            return (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                    {productionModules.P3.title}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
                    {productionModules.P3.description}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: '#eab308', fontSize: '13px' }}>
                    {'★'.repeat(mp.stars)}<span style={{ color: '#333' }}>{'★'.repeat(mp.total * 3 - mp.stars)}</span>
                  </div>
                  <div
                    style={{
                      padding: '4px 10px',
                      background: pct === 100 ? '#22c55e' : '#222',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: pct === 100 ? '#000' : '#888',
                    }}
                  >
                    {mp.completed}/{mp.total}
                  </div>
                </div>
              </div>
            );
          })()}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {allProductionChallenges
              .filter((c) => c.module === 'P3')
              .map((challenge) => {
                const progress = getProductionProgress(challenge.id);
                const stars = progress?.stars ?? 0;

                return (
                  <button
                    key={challenge.id}
                    onClick={() => handleStartProductionChallenge(challenge.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: '#0a0a0a',
                      border: '1px solid #222',
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>
                        {challenge.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {'★'.repeat(challenge.difficulty)}
                        {'☆'.repeat(3 - challenge.difficulty)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ color: '#eab308', fontSize: '14px' }}>
                        {'★'.repeat(stars)}
                        <span style={{ color: '#333' }}>{'★'.repeat(3 - stars)}</span>
                      </div>
                      {progress?.completed && (
                        <span style={{ color: '#22c55e', fontSize: '16px' }}>✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Module: P4 - Rhythm and Groove */}
        <div
          style={{
            background: '#141414',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #2a2a2a',
            marginBottom: '16px',
          }}
        >
          {(() => {
            const mp = getProductionModuleProgress('P4', allProductionChallenges);
            const pct = mp.total > 0 ? Math.round((mp.completed / mp.total) * 100) : 0;
            return (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                    {productionModules.P4.title}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
                    {productionModules.P4.description}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: '#eab308', fontSize: '13px' }}>
                    {'★'.repeat(mp.stars)}<span style={{ color: '#333' }}>{'★'.repeat(mp.total * 3 - mp.stars)}</span>
                  </div>
                  <div
                    style={{
                      padding: '4px 10px',
                      background: pct === 100 ? '#22c55e' : '#222',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: pct === 100 ? '#000' : '#888',
                    }}
                  >
                    {mp.completed}/{mp.total}
                  </div>
                </div>
              </div>
            );
          })()}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {allProductionChallenges
              .filter((c) => c.module === 'P4')
              .map((challenge) => {
                const progress = getProductionProgress(challenge.id);
                const stars = progress?.stars ?? 0;

                return (
                  <button
                    key={challenge.id}
                    onClick={() => handleStartProductionChallenge(challenge.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: '#0a0a0a',
                      border: '1px solid #222',
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>
                        {challenge.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {'★'.repeat(challenge.difficulty)}
                        {'☆'.repeat(3 - challenge.difficulty)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ color: '#eab308', fontSize: '14px' }}>
                        {'★'.repeat(stars)}
                        <span style={{ color: '#333' }}>{'★'.repeat(3 - stars)}</span>
                      </div>
                      {progress?.completed && (
                        <span style={{ color: '#22c55e', fontSize: '16px' }}>✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Module: P5 - Space and Depth */}
        <div
          style={{
            background: '#141414',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #2a2a2a',
            marginBottom: '24px',
          }}
        >
          {(() => {
            const mp = getProductionModuleProgress('P5', allProductionChallenges);
            const pct = mp.total > 0 ? Math.round((mp.completed / mp.total) * 100) : 0;
            return (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                    {productionModules.P5.title}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
                    {productionModules.P5.description}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: '#eab308', fontSize: '13px' }}>
                    {'★'.repeat(mp.stars)}<span style={{ color: '#333' }}>{'★'.repeat(mp.total * 3 - mp.stars)}</span>
                  </div>
                  <div
                    style={{
                      padding: '4px 10px',
                      background: pct === 100 ? '#22c55e' : '#222',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: pct === 100 ? '#000' : '#888',
                    }}
                  >
                    {mp.completed}/{mp.total}
                  </div>
                </div>
              </div>
            );
          })()}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {allProductionChallenges
              .filter((c) => c.module === 'P5')
              .map((challenge) => {
                const progress = getProductionProgress(challenge.id);
                const stars = progress?.stars ?? 0;

                return (
                  <button
                    key={challenge.id}
                    onClick={() => handleStartProductionChallenge(challenge.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: '#0a0a0a',
                      border: '1px solid #222',
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>
                        {challenge.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {'★'.repeat(challenge.difficulty)}
                        {'☆'.repeat(3 - challenge.difficulty)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ color: '#eab308', fontSize: '14px' }}>
                        {'★'.repeat(stars)}
                        <span style={{ color: '#333' }}>{'★'.repeat(3 - stars)}</span>
                      </div>
                      {progress?.completed && (
                        <span style={{ color: '#22c55e', fontSize: '16px' }}>✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
