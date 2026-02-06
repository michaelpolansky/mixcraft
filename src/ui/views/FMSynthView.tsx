/**
 * FM Synthesizer View
 * Complete FM synthesis interface with real-time spectrum analysis
 */

import { useEffect, useCallback } from 'react';
import { useFMSynthStore } from '../stores/fm-synth-store.ts';
import {
  SpectrumAnalyzer,
  FMSynthPanel,
  PianoKeyboard,
  InfoPanel,
} from '../components/index.ts';
import { InfoPanelProvider } from '../context/InfoPanelContext.tsx';

/**
 * Section wrapper component for consistent styling
 */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: '#141414',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid #2a2a2a',
      }}
    >
      <h3
        style={{
          margin: '0 0 12px 0',
          fontSize: '11px',
          fontWeight: 600,
          color: '#666',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

export function FMSynthView() {
  const {
    params,
    engine,
    isInitialized,
    initEngine,
    startAudio,
    playNote,
    stopNote,
    setHarmonicity,
    setHarmonicityPreset,
    setModulationIndex,
    setCarrierType,
    setModulatorType,
    setModulationEnvelopeAmount,
    setAmplitudeAttack,
    setAmplitudeDecay,
    setAmplitudeSustain,
    setAmplitudeRelease,
    setVolume,
    resetToDefaults,
  } = useFMSynthStore();

  // Initialize engine on mount
  useEffect(() => {
    initEngine();
  }, [initEngine]);

  // Handle audio context start (requires user gesture)
  const handleStartAudio = useCallback(async () => {
    await startAudio();
  }, [startAudio]);

  // Handle first interaction for Web Audio API
  const handleFirstInteraction = useCallback(async () => {
    if (!isInitialized) {
      await startAudio();
    }
  }, [isInitialized, startAudio]);

  // Note handlers
  const handleNoteOn = useCallback(
    async (note: string) => {
      await handleFirstInteraction();
      playNote(note);
    },
    [handleFirstInteraction, playNote]
  );

  const handleNoteOff = useCallback(() => {
    stopNote();
  }, [stopNote]);

  // Get analyser for spectrum visualization
  const getAnalyser = useCallback(() => {
    return engine?.getAnalyser() ?? null;
  }, [engine]);

  // Not initialized - show start button
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
            fontSize: '32px',
            fontWeight: 300,
            marginBottom: '8px',
            color: '#f97316',
          }}
        >
          MIXCRAFT
        </h1>
        <p
          style={{
            color: '#666',
            marginBottom: '32px',
          }}
        >
          FM Synthesizer
        </p>
        <button
          onClick={handleStartAudio}
          style={{
            padding: '16px 48px',
            fontSize: '16px',
            background: 'linear-gradient(145deg, #f97316, #ea580c)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
            transition: 'transform 0.1s ease',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Start Audio Engine
        </button>
        <p
          style={{
            color: '#444',
            fontSize: '12px',
            marginTop: '16px',
          }}
        >
          Click to enable audio (browser requirement)
        </p>
      </div>
    );
  }

  return (
    <InfoPanelProvider>
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
    <div style={{ padding: '24px', flex: 1 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 300,
              margin: 0,
              color: '#f97316',
            }}
          >
            MIXCRAFT
          </h1>
          <span
            style={{
              fontSize: '12px',
              color: '#666',
            }}
          >
            FM Synthesizer
          </span>
        </div>

        <button
          onClick={resetToDefaults}
          style={{
            padding: '8px 16px',
            background: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '4px',
            color: '#888',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Reset
        </button>
      </div>

      {/* Main Layout */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        {/* Spectrum Analyzer */}
        <Section title="Spectrum Analyzer">
          <SpectrumAnalyzer
            getAnalyser={getAnalyser}
            width={720}
            height={150}
            barCount={80}
          />
        </Section>

        {/* FM Controls */}
        <FMSynthPanel
          params={params}
          onHarmonicityChange={setHarmonicity}
          onHarmonicityPreset={setHarmonicityPreset}
          onModulationIndexChange={setModulationIndex}
          onCarrierTypeChange={setCarrierType}
          onModulatorTypeChange={setModulatorType}
          onModEnvAmountChange={setModulationEnvelopeAmount}
          onAttackChange={setAmplitudeAttack}
          onDecayChange={setAmplitudeDecay}
          onSustainChange={setAmplitudeSustain}
          onReleaseChange={setAmplitudeRelease}
          onVolumeChange={setVolume}
        />

        {/* Piano Keyboard */}
        <Section title="Keyboard">
          <PianoKeyboard
            onNoteOn={handleNoteOn}
            onNoteOff={handleNoteOff}
            octave={3}
            octaves={3}
          />
        </Section>
      </div>
    </div>
    <InfoPanel accentColor="#f97316" />
    </div>
    </InfoPanelProvider>
  );
}
