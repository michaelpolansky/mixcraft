/**
 * SamplerChallengeView
 * Main view for sampling challenges - manipulate samples to match targets
 */

import { useEffect, useCallback, useState } from 'react';
import { useSamplerStore } from '../stores/sampler-store.ts';
import {
  Knob,
  WaveformEditor,
  SpectrumAnalyzer,
  InfoPanel,
} from '../components/index.ts';
import { InfoPanelProvider } from '../context/InfoPanelContext.tsx';
import { evaluateSamplingChallenge } from '../../core/sampling-evaluation.ts';
import type { SamplingChallenge } from '../../core/types.ts';
import { SAMPLER_PARAM_RANGES } from '../../core/types.ts';
import type { SamplingScoreResult } from '../../core/sampling-evaluation.ts';

interface SamplerChallengeViewProps {
  challenge: SamplingChallenge;
  onExit: () => void;
  onNext?: () => void;
  hasNext?: boolean;
}

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

export function SamplerChallengeView({
  challenge,
  onExit,
  onNext,
  hasNext = false,
}: SamplerChallengeViewProps) {
  const {
    params,
    isInitialized,
    isPlaying,
    isLoading,
    currentAttempt,
    hintsRevealed,
    isScoring,
    lastResult,
    initEngine,
    loadChallenge,
    loadSample,
    play,
    stop,
    triggerSlice,
    setPitch,
    setTimeStretch,
    setStartPoint,
    setEndPoint,
    setLoop,
    setReverse,
    setVolume,
    autoSlice,
    setSelectedSlice,
    addSlice,
    revealHint,
    startScoring,
    submitResult,
    retry,
    getAnalyser,
    getWaveformData,
  } = useSamplerStore();

  // Track whether we've loaded the source sample
  const [sourceLoaded, setSourceLoaded] = useState(false);

  // Initialize engine and load challenge on mount
  useEffect(() => {
    initEngine();
    loadChallenge(challenge);
  }, [initEngine, loadChallenge, challenge]);

  // Load source sample when challenge changes
  useEffect(() => {
    async function loadSource() {
      if (challenge.sourceSampleUrl) {
        await loadSample(challenge.sourceSampleUrl, 'Source Sample');
        setSourceLoaded(true);
      }
    }
    loadSource();
  }, [challenge.sourceSampleUrl, loadSample]);

  // Handle submit
  const handleSubmit = useCallback(() => {
    startScoring();
    const result = evaluateSamplingChallenge(challenge, params);
    submitResult(result);
  }, [challenge, params, startScoring, submitResult]);

  // Handle retry
  const handleRetry = useCallback(() => {
    stop();
    retry();
    // Reload the source sample after reset
    if (challenge.sourceSampleUrl) {
      loadSample(challenge.sourceSampleUrl, 'Source Sample');
    }
  }, [retry, stop, loadSample, challenge.sourceSampleUrl]);

  // Handle exit
  const handleExit = useCallback(() => {
    stop();
    onExit();
  }, [onExit, stop]);

  // Format helpers
  const formatSemitones = (value: number) =>
    value >= 0 ? `+${value}` : `${value}`;
  const formatPercent = (value: number) => `${Math.round(value * 100)}%`;
  const formatDb = (value: number) => `${value.toFixed(1)}dB`;

  // Accent color for sampler (purple/magenta theme)
  const accentColor = '#a855f7';

  return (
    <InfoPanelProvider>
      <div
        style={{
          minHeight: '100vh',
          background: '#0a0a0a',
          color: '#fff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '24px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '24px',
          }}
        >
          <div>
            <button
              onClick={handleExit}
              style={{
                background: 'none',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                fontSize: '14px',
                marginBottom: '8px',
                padding: 0,
              }}
            >
              ← Back
            </button>
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 600,
                margin: 0,
                color: '#fff',
              }}
            >
              {challenge.title}
            </h1>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#666', fontSize: '12px' }}>
              Attempt {currentAttempt}
            </div>
            <div style={{ color: '#eab308', fontSize: '18px' }}>
              {'★'.repeat(challenge.difficulty)}
              {'☆'.repeat(3 - challenge.difficulty)}
            </div>
          </div>
        </div>

        {/* Main Layout - Two Columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 300px',
            gap: '24px',
            maxWidth: '1200px',
          }}
        >
          {/* Left Column - Main Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {/* Waveform Editor */}
            <Section title="Waveform">
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <WaveformEditor
                  waveformData={getWaveformData()}
                  duration={params.duration}
                  startPoint={params.startPoint}
                  endPoint={params.endPoint}
                  slices={params.slices}
                  selectedSlice={params.selectedSlice}
                  width={600}
                  height={150}
                  accentColor={accentColor}
                  onStartPointChange={setStartPoint}
                  onEndPointChange={setEndPoint}
                  onSliceSelect={setSelectedSlice}
                  onAddSlice={addSlice}
                />

                {/* Transport Controls */}
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                  }}
                >
                  <button
                    onClick={isPlaying ? stop : play}
                    disabled={!isInitialized || params.duration === 0}
                    style={{
                      padding: '10px 24px',
                      background: isPlaying
                        ? '#ef4444'
                        : `linear-gradient(145deg, ${accentColor}, #9333ea)`,
                      border: 'none',
                      borderRadius: '6px',
                      color: '#fff',
                      cursor:
                        !isInitialized || params.duration === 0
                          ? 'not-allowed'
                          : 'pointer',
                      fontSize: '14px',
                      fontWeight: 600,
                      minWidth: '100px',
                      opacity:
                        !isInitialized || params.duration === 0 ? 0.5 : 1,
                    }}
                  >
                    {isPlaying ? 'Stop' : 'Play'}
                  </button>

                  <button
                    onClick={() => autoSlice(8)}
                    disabled={!isInitialized || params.duration === 0}
                    style={{
                      padding: '10px 20px',
                      background: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '6px',
                      color: '#aaa',
                      cursor:
                        !isInitialized || params.duration === 0
                          ? 'not-allowed'
                          : 'pointer',
                      fontSize: '13px',
                      opacity:
                        !isInitialized || params.duration === 0 ? 0.5 : 1,
                    }}
                  >
                    Auto-Slice (8)
                  </button>

                  {isLoading && (
                    <span style={{ color: '#666', fontSize: '13px' }}>
                      Loading...
                    </span>
                  )}

                  <div
                    style={{
                      marginLeft: 'auto',
                      color: '#666',
                      fontSize: '12px',
                    }}
                  >
                    {params.slices.length > 0 && (
                      <span>{params.slices.length} slices</span>
                    )}
                  </div>
                </div>
              </div>
            </Section>

            {/* Pitch & Time Controls */}
            <Section title="Pitch & Time">
              <div style={{ display: 'flex', gap: '32px' }}>
                <Knob
                  label="Pitch"
                  value={params.pitch}
                  min={SAMPLER_PARAM_RANGES.pitch.min}
                  max={SAMPLER_PARAM_RANGES.pitch.max}
                  step={SAMPLER_PARAM_RANGES.pitch.step}
                  onChange={setPitch}
                  formatValue={formatSemitones}
                  paramId="sampler.pitch"
                />
                <Knob
                  label="Time Stretch"
                  value={params.timeStretch}
                  min={SAMPLER_PARAM_RANGES.timeStretch.min}
                  max={SAMPLER_PARAM_RANGES.timeStretch.max}
                  step={SAMPLER_PARAM_RANGES.timeStretch.step}
                  onChange={setTimeStretch}
                  formatValue={formatPercent}
                  paramId="sampler.timeStretch"
                />
                <Knob
                  label="Volume"
                  value={params.volume}
                  min={SAMPLER_PARAM_RANGES.volume.min}
                  max={SAMPLER_PARAM_RANGES.volume.max}
                  step={SAMPLER_PARAM_RANGES.volume.step}
                  onChange={setVolume}
                  formatValue={formatDb}
                  size={56}
                  paramId="sampler.volume"
                />
              </div>
            </Section>

            {/* Options */}
            <Section title="Options">
              <div style={{ display: 'flex', gap: '24px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    color: '#aaa',
                    fontSize: '13px',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={params.loop}
                    onChange={(e) => setLoop(e.target.checked)}
                    style={{
                      width: '16px',
                      height: '16px',
                      accentColor: accentColor,
                      cursor: 'pointer',
                    }}
                  />
                  Loop
                </label>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    color: '#aaa',
                    fontSize: '13px',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={params.reverse}
                    onChange={(e) => setReverse(e.target.checked)}
                    style={{
                      width: '16px',
                      height: '16px',
                      accentColor: accentColor,
                      cursor: 'pointer',
                    }}
                  />
                  Reverse
                </label>
              </div>
            </Section>

            {/* Slice Pads */}
            <Section title="Slice Pads">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(8, 1fr)',
                  gap: '8px',
                }}
              >
                {Array.from({ length: 8 }).map((_, index) => {
                  const hasSlice = index < params.slices.length;
                  const isSelected = params.selectedSlice === index;

                  return (
                    <button
                      key={index}
                      onClick={() => hasSlice && triggerSlice(index)}
                      disabled={!hasSlice}
                      style={{
                        aspectRatio: '1',
                        background: isSelected
                          ? accentColor + '40'
                          : hasSlice
                            ? '#1a1a1a'
                            : '#0a0a0a',
                        border: `2px solid ${isSelected ? accentColor : hasSlice ? '#333' : '#1a1a1a'}`,
                        borderRadius: '8px',
                        color: isSelected
                          ? accentColor
                          : hasSlice
                            ? '#fff'
                            : '#333',
                        cursor: hasSlice ? 'pointer' : 'default',
                        fontSize: '18px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.1s ease',
                      }}
                      onMouseDown={(e) => {
                        if (hasSlice) {
                          e.currentTarget.style.transform = 'scale(0.95)';
                        }
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </Section>
          </div>

          {/* Right Column - Info & Submit */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {/* Challenge Description */}
            <Section title="Challenge">
              <p
                style={{
                  color: '#ccc',
                  fontSize: '13px',
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {challenge.description}
              </p>
              {challenge.targetKey && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    background: '#0a0a0a',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#888',
                  }}
                >
                  Target Key: <strong style={{ color: accentColor }}>{challenge.targetKey}</strong>
                </div>
              )}
              {challenge.targetBpm && (
                <div
                  style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    background: '#0a0a0a',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#888',
                  }}
                >
                  Target BPM: <strong style={{ color: accentColor }}>{challenge.targetBpm}</strong>
                </div>
              )}
              {challenge.expectedSlices && (
                <div
                  style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    background: '#0a0a0a',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#888',
                  }}
                >
                  Expected Slices: <strong style={{ color: accentColor }}>{challenge.expectedSlices}</strong>
                </div>
              )}
            </Section>

            {/* Hints */}
            <Section title="Hints">
              <div style={{ minHeight: '60px' }}>
                {challenge.hints.slice(0, hintsRevealed).map((hint, i) => (
                  <div
                    key={i}
                    style={{
                      color: '#888',
                      fontSize: '12px',
                      marginBottom: '8px',
                      paddingLeft: '12px',
                      borderLeft: `2px solid ${accentColor}44`,
                    }}
                  >
                    {hint}
                  </div>
                ))}

                {hintsRevealed < challenge.hints.length && (
                  <button
                    onClick={revealHint}
                    style={{
                      background: 'none',
                      border: '1px solid #333',
                      borderRadius: '4px',
                      color: '#666',
                      cursor: 'pointer',
                      fontSize: '11px',
                      padding: '6px 12px',
                    }}
                  >
                    Reveal Hint ({hintsRevealed + 1}/{challenge.hints.length})
                  </button>
                )}
              </div>
            </Section>

            {/* Spectrum Analyzer */}
            <Section title="Spectrum">
              <SpectrumAnalyzer
                getAnalyser={getAnalyser}
                width={260}
                height={120}
                barCount={32}
              />
            </Section>

            {/* Submit */}
            <div style={{ marginTop: 'auto' }}>
              <button
                onClick={handleSubmit}
                disabled={isScoring || !sourceLoaded}
                style={{
                  width: '100%',
                  padding: '16px 32px',
                  background:
                    isScoring || !sourceLoaded
                      ? '#333'
                      : `linear-gradient(145deg, ${accentColor}, #9333ea)`,
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  cursor: isScoring || !sourceLoaded ? 'wait' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 600,
                }}
              >
                {isScoring ? 'Scoring...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>

        {/* Results Modal */}
        {lastResult && (
          <SamplingResultsModal
            result={lastResult}
            challenge={challenge}
            attemptNumber={currentAttempt - 1}
            onRetry={handleRetry}
            onNext={onNext}
            hasNext={hasNext}
          />
        )}

        <InfoPanel accentColor={accentColor} />
      </div>
    </InfoPanelProvider>
  );
}

/**
 * Results Modal for sampling challenges
 */
interface SamplingResultsModalProps {
  result: SamplingScoreResult;
  challenge: SamplingChallenge;
  attemptNumber: number;
  onRetry: () => void;
  onNext?: () => void;
  hasNext?: boolean;
}

function SamplingResultsModal({
  result,
  challenge,
  attemptNumber,
  onRetry,
  onNext,
  hasNext,
}: SamplingResultsModalProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: '#1a1a1a',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '450px',
          width: '90%',
          border: '1px solid #333',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              fontSize: '48px',
              marginBottom: '8px',
              color: result.passed ? '#22c55e' : '#666',
            }}
          >
            {'★'.repeat(result.stars)}
            {'☆'.repeat(3 - result.stars)}
          </div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>
            {result.passed ? 'Nice Sample Work!' : 'Keep Tweaking'}
          </h2>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#fff' }}>
            {result.overall}%
          </div>
        </div>

        {/* Breakdown */}
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              fontSize: '11px',
              color: '#666',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            Score Breakdown
          </div>

          {result.breakdown.pitchScore !== undefined && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px',
              }}
            >
              <span style={{ color: '#888', fontSize: '13px' }}>Pitch</span>
              <span
                style={{
                  color:
                    result.breakdown.pitchScore >= 80
                      ? '#22c55e'
                      : result.breakdown.pitchScore >= 60
                        ? '#eab308'
                        : '#ef4444',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                {Math.round(result.breakdown.pitchScore)}%
              </span>
            </div>
          )}

          {result.breakdown.sliceScore !== undefined && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px',
              }}
            >
              <span style={{ color: '#888', fontSize: '13px' }}>Slices</span>
              <span
                style={{
                  color:
                    result.breakdown.sliceScore >= 80
                      ? '#22c55e'
                      : result.breakdown.sliceScore >= 60
                        ? '#eab308'
                        : '#ef4444',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                {Math.round(result.breakdown.sliceScore)}%
              </span>
            </div>
          )}

          {result.breakdown.timingScore !== undefined && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px',
              }}
            >
              <span style={{ color: '#888', fontSize: '13px' }}>Timing</span>
              <span
                style={{
                  color:
                    result.breakdown.timingScore >= 80
                      ? '#22c55e'
                      : result.breakdown.timingScore >= 60
                        ? '#eab308'
                        : '#ef4444',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                {Math.round(result.breakdown.timingScore)}%
              </span>
            </div>
          )}

          {result.breakdown.creativityScore !== undefined && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px',
              }}
            >
              <span style={{ color: '#888', fontSize: '13px' }}>Creativity</span>
              <span
                style={{
                  color:
                    result.breakdown.creativityScore >= 80
                      ? '#22c55e'
                      : result.breakdown.creativityScore >= 60
                        ? '#eab308'
                        : '#ef4444',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                {Math.round(result.breakdown.creativityScore)}%
              </span>
            </div>
          )}
        </div>

        {/* Feedback */}
        <div style={{ marginBottom: '24px' }}>
          {result.feedback.map((fb, i) => (
            <div
              key={i}
              style={{
                color: '#888',
                fontSize: '12px',
                marginBottom: '6px',
                paddingLeft: '12px',
                borderLeft: `2px solid ${result.passed ? '#22c55e44' : '#f59e0b44'}`,
              }}
            >
              {fb}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onRetry}
            style={{
              flex: 1,
              padding: '12px',
              background: '#333',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Try Again
          </button>

          {result.passed && hasNext && onNext && (
            <button
              onClick={onNext}
              style={{
                flex: 1,
                padding: '12px',
                background: 'linear-gradient(145deg, #22c55e, #16a34a)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              Next Challenge →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
