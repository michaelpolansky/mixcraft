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
  ChallengeHeader,
  HintsPanel,
  SubmitButton,
  ScoreBreakdownRow,
  ChallengeResultsModal,
} from '../components/index.ts';
import { Section } from '../components/challenge/Section.tsx';
import { InfoPanelProvider } from '../context/InfoPanelContext.tsx';
import { evaluateSamplingChallenge } from '../../core/sampling-evaluation.ts';
import { trpc } from '../api/trpc.ts';
import { useAIFeedback } from '../hooks/useAIFeedback.ts';
import { formatDb, formatPercent } from '../utils/formatters.ts';
import type { SamplingChallenge } from '../../core/types.ts';
import { SAMPLER_PARAM_RANGES } from '../../core/types.ts';
import type { SamplingScoreResult } from '../../core/sampling-evaluation.ts';

interface SamplerChallengeViewProps {
  challenge: SamplingChallenge;
  onExit: () => void;
  onNext?: () => void;
  hasNext?: boolean;
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

  const handleSubmit = useCallback(() => {
    startScoring();
    const result = evaluateSamplingChallenge(challenge, params);
    submitResult(result);
  }, [challenge, params, startScoring, submitResult]);

  const handleRetry = useCallback(() => {
    stop();
    retry();
    if (challenge.sourceSampleUrl) {
      loadSample(challenge.sourceSampleUrl, 'Source Sample');
    }
  }, [retry, stop, loadSample, challenge.sourceSampleUrl]);

  const handleExit = useCallback(() => {
    stop();
    onExit();
  }, [onExit, stop]);

  const formatSemitones = (value: number) =>
    value >= 0 ? `+${value}` : `${value}`;

  const accentColor = '#a855f7';

  return (
    <InfoPanelProvider>
      <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '24px' }}>
        <ChallengeHeader
          title={challenge.title}
          difficulty={challenge.difficulty}
          currentAttempt={currentAttempt}
          onExit={handleExit}
        />

        {/* Main Layout - Two Columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', maxWidth: '1200px' }}>
          {/* Left Column - Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Waveform Editor */}
            <Section title="Waveform">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    onClick={isPlaying ? stop : play}
                    disabled={!isInitialized || params.duration === 0}
                    style={{
                      padding: '10px 24px',
                      background: isPlaying ? '#ef4444' : `linear-gradient(145deg, ${accentColor}, #9333ea)`,
                      border: 'none', borderRadius: '6px', color: '#fff',
                      cursor: !isInitialized || params.duration === 0 ? 'not-allowed' : 'pointer',
                      fontSize: '14px', fontWeight: 600, minWidth: '100px',
                      opacity: !isInitialized || params.duration === 0 ? 0.5 : 1,
                    }}
                  >
                    {isPlaying ? 'Stop' : 'Play'}
                  </button>

                  <button
                    onClick={() => autoSlice(8)}
                    disabled={!isInitialized || params.duration === 0}
                    style={{
                      padding: '10px 20px', background: '#1a1a1a',
                      border: '1px solid #333', borderRadius: '6px', color: '#aaa',
                      cursor: !isInitialized || params.duration === 0 ? 'not-allowed' : 'pointer',
                      fontSize: '13px',
                      opacity: !isInitialized || params.duration === 0 ? 0.5 : 1,
                    }}
                  >
                    Auto-Slice (8)
                  </button>

                  {isLoading && <span style={{ color: '#666', fontSize: '13px' }}>Loading...</span>}

                  <div style={{ marginLeft: 'auto', color: '#666', fontSize: '12px' }}>
                    {params.slices.length > 0 && <span>{params.slices.length} slices</span>}
                  </div>
                </div>
              </div>
            </Section>

            {/* Pitch & Time Controls */}
            <Section title="Pitch & Time">
              <div style={{ display: 'flex', gap: '32px' }}>
                <Knob label="Pitch" value={params.pitch} min={SAMPLER_PARAM_RANGES.pitch.min} max={SAMPLER_PARAM_RANGES.pitch.max} step={SAMPLER_PARAM_RANGES.pitch.step} onChange={setPitch} formatValue={formatSemitones} paramId="sampler.pitch" />
                <Knob label="Time Stretch" value={params.timeStretch} min={SAMPLER_PARAM_RANGES.timeStretch.min} max={SAMPLER_PARAM_RANGES.timeStretch.max} step={SAMPLER_PARAM_RANGES.timeStretch.step} onChange={setTimeStretch} formatValue={formatPercent} paramId="sampler.timeStretch" />
                <Knob label="Volume" value={params.volume} min={SAMPLER_PARAM_RANGES.volume.min} max={SAMPLER_PARAM_RANGES.volume.max} step={SAMPLER_PARAM_RANGES.volume.step} onChange={setVolume} formatValue={formatDb} size={56} paramId="sampler.volume" />
              </div>
            </Section>

            {/* Options */}
            <Section title="Options">
              <div style={{ display: 'flex', gap: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#aaa', fontSize: '13px' }}>
                  <input type="checkbox" checked={params.loop} onChange={(e) => setLoop(e.target.checked)} style={{ width: '16px', height: '16px', accentColor, cursor: 'pointer' }} />
                  Loop
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#aaa', fontSize: '13px' }}>
                  <input type="checkbox" checked={params.reverse} onChange={(e) => setReverse(e.target.checked)} style={{ width: '16px', height: '16px', accentColor, cursor: 'pointer' }} />
                  Reverse
                </label>
              </div>
            </Section>

            {/* Slice Pads */}
            <Section title="Slice Pads">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '8px' }}>
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
                        background: isSelected ? accentColor + '40' : hasSlice ? '#1a1a1a' : '#0a0a0a',
                        border: `2px solid ${isSelected ? accentColor : hasSlice ? '#333' : '#1a1a1a'}`,
                        borderRadius: '8px',
                        color: isSelected ? accentColor : hasSlice ? '#fff' : '#333',
                        cursor: hasSlice ? 'pointer' : 'default',
                        fontSize: '18px', fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.1s ease',
                      }}
                      onMouseDown={(e) => { if (hasSlice) e.currentTarget.style.transform = 'scale(0.95)'; }}
                      onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </Section>
          </div>

          {/* Right Column - Info & Submit */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Challenge Description */}
            <Section title="Challenge">
              <p style={{ color: '#ccc', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
                {challenge.description}
              </p>
              {challenge.targetKey && (
                <div style={{ marginTop: '12px', padding: '8px 12px', background: '#0a0a0a', borderRadius: '6px', fontSize: '12px', color: '#888' }}>
                  Target Key: <strong style={{ color: accentColor }}>{challenge.targetKey}</strong>
                </div>
              )}
              {challenge.targetBpm && (
                <div style={{ marginTop: '8px', padding: '8px 12px', background: '#0a0a0a', borderRadius: '6px', fontSize: '12px', color: '#888' }}>
                  Target BPM: <strong style={{ color: accentColor }}>{challenge.targetBpm}</strong>
                </div>
              )}
              {challenge.expectedSlices && (
                <div style={{ marginTop: '8px', padding: '8px 12px', background: '#0a0a0a', borderRadius: '6px', fontSize: '12px', color: '#888' }}>
                  Expected Slices: <strong style={{ color: accentColor }}>{challenge.expectedSlices}</strong>
                </div>
              )}
            </Section>

            <HintsPanel hints={challenge.hints} hintsRevealed={hintsRevealed} onRevealHint={revealHint} accentColor={accentColor} />

            {/* Spectrum Analyzer */}
            <Section title="Spectrum">
              <SpectrumAnalyzer getAnalyser={getAnalyser} width={260} height={120} barCount={32} />
            </Section>

            <SubmitButton
              onClick={handleSubmit}
              disabled={!sourceLoaded}
              isScoring={isScoring}
              label="Submit"
              accentColor={accentColor}
              accentColorDark="#9333ea"
            />
          </div>
        </div>

        {/* Results Modal */}
        {lastResult && (
          <SamplingResults
            result={lastResult}
            challenge={challenge}
            attemptNumber={currentAttempt - 1}
            playerParams={{
              pitch: params.pitch,
              timeStretch: params.timeStretch,
              volume: params.volume,
              startPoint: params.startPoint,
              endPoint: params.endPoint,
              slices: params.slices,
            }}
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

/** Sampling results using shared ChallengeResultsModal */
function SamplingResults({
  result,
  challenge,
  attemptNumber,
  playerParams,
  onRetry,
  onNext,
  hasNext,
}: {
  result: SamplingScoreResult;
  challenge: SamplingChallenge;
  attemptNumber: number;
  playerParams: {
    pitch: number;
    timeStretch: number;
    volume: number;
    startPoint: number;
    endPoint: number;
    slices: { start: number; end: number }[];
  };
  onRetry: () => void;
  onNext?: () => void;
  hasNext?: boolean;
}) {
  const { feedback: aiFeedback, loading: aiFeedbackLoading } = useAIFeedback(
    () => trpc.feedback.generateSampling.mutate({
      result,
      playerParams: {
        pitch: playerParams.pitch,
        timeStretch: playerParams.timeStretch,
        volume: playerParams.volume,
        startPoint: playerParams.startPoint,
        endPoint: playerParams.endPoint,
        fadeIn: 0,
        fadeOut: 0,
        sliceCount: playerParams.slices.length,
      },
      challenge: {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        module: challenge.module,
        challengeType: challenge.challengeType,
      },
      attemptNumber,
    }),
    [result, challenge, playerParams, attemptNumber]
  );

  return (
    <ChallengeResultsModal
      passed={result.passed}
      stars={result.stars}
      overall={result.overall}
      successMessage="Nice Sample Work!"
      failMessage="Keep Tweaking"
      breakdown={
        <>
          {result.breakdown.pitchScore !== undefined && <ScoreBreakdownRow label="Pitch" score={result.breakdown.pitchScore} />}
          {result.breakdown.sliceScore !== undefined && <ScoreBreakdownRow label="Slices" score={result.breakdown.sliceScore} />}
          {result.breakdown.timingScore !== undefined && <ScoreBreakdownRow label="Timing" score={result.breakdown.timingScore} />}
          {result.breakdown.creativityScore !== undefined && <ScoreBreakdownRow label="Creativity" score={result.breakdown.creativityScore} />}
        </>
      }
      feedback={result.feedback}
      aiFeedback={aiFeedback}
      aiFeedbackLoading={aiFeedbackLoading}
      onRetry={onRetry}
      onNext={onNext}
      hasNext={hasNext}
    />
  );
}
