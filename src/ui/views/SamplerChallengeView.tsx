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
import { cn } from '../utils/cn.ts';
import { evaluateSamplingChallenge } from '../../core/sampling-evaluation.ts';
import { getTRPC } from '../api/trpc.ts';
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
  const transportDisabled = !isInitialized || params.duration === 0;

  return (
    <InfoPanelProvider>
      <div className="min-h-screen bg-[#0a0a0a] text-text-primary font-sans p-6">
        <ChallengeHeader
          title={challenge.title}
          difficulty={challenge.difficulty}
          currentAttempt={currentAttempt}
          onExit={handleExit}
        />

        {/* Main Layout - Two Columns */}
        <div className="grid grid-cols-[1fr_300px] gap-6 max-w-[1200px]">
          {/* Left Column - Main Content */}
          <div className="flex flex-col gap-4">
            {/* Waveform Editor */}
            <Section title="Waveform">
              <div className="flex flex-col gap-3">
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
                <div className="flex gap-2 items-center">
                  <button
                    onClick={isPlaying ? stop : play}
                    disabled={transportDisabled}
                    className={cn(
                      'py-2.5 px-6 border-none rounded-md text-text-primary text-xl font-semibold min-w-[100px]',
                      transportDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                      isPlaying ? 'bg-[#ef4444]' : 'bg-gradient-to-br from-[#a855f7] to-[#9333ea]'
                    )}
                  >
                    {isPlaying ? 'Stop' : 'Play'}
                  </button>

                  <button
                    onClick={() => autoSlice(8)}
                    disabled={transportDisabled}
                    className={cn(
                      'py-2.5 px-5 bg-bg-tertiary border border-border-medium rounded-md text-text-secondary text-lg',
                      transportDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                    )}
                  >
                    Auto-Slice (8)
                  </button>

                  {isLoading && <span className="text-text-muted text-lg">Loading...</span>}

                  <div className="ml-auto text-text-muted text-md">
                    {params.slices.length > 0 && <span>{params.slices.length} slices</span>}
                  </div>
                </div>
              </div>
            </Section>

            {/* Pitch & Time Controls */}
            <Section title="Pitch & Time">
              <div className="flex gap-8">
                <Knob label="Pitch" value={params.pitch} min={SAMPLER_PARAM_RANGES.pitch.min} max={SAMPLER_PARAM_RANGES.pitch.max} step={SAMPLER_PARAM_RANGES.pitch.step} onChange={setPitch} formatValue={formatSemitones} paramId="sampler.pitch" />
                <Knob label="Time Stretch" value={params.timeStretch} min={SAMPLER_PARAM_RANGES.timeStretch.min} max={SAMPLER_PARAM_RANGES.timeStretch.max} step={SAMPLER_PARAM_RANGES.timeStretch.step} onChange={setTimeStretch} formatValue={formatPercent} paramId="sampler.timeStretch" />
                <Knob label="Volume" value={params.volume} min={SAMPLER_PARAM_RANGES.volume.min} max={SAMPLER_PARAM_RANGES.volume.max} step={SAMPLER_PARAM_RANGES.volume.step} onChange={setVolume} formatValue={formatDb} size={56} paramId="sampler.volume" />
              </div>
            </Section>

            {/* Options */}
            <Section title="Options">
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-text-secondary text-lg">
                  <input type="checkbox" checked={params.loop} onChange={(e) => setLoop(e.target.checked)} style={{ width: '16px', height: '16px', accentColor, cursor: 'pointer' }} />
                  Loop
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-text-secondary text-lg">
                  <input type="checkbox" checked={params.reverse} onChange={(e) => setReverse(e.target.checked)} style={{ width: '16px', height: '16px', accentColor, cursor: 'pointer' }} />
                  Reverse
                </label>
              </div>
            </Section>

            {/* Slice Pads */}
            <Section title="Slice Pads">
              <div className="grid grid-cols-[repeat(8,1fr)] gap-2">
                {Array.from({ length: 8 }).map((_, index) => {
                  const hasSlice = index < params.slices.length;
                  const isSelected = params.selectedSlice === index;
                  return (
                    <button
                      key={index}
                      onClick={() => hasSlice && triggerSlice(index)}
                      disabled={!hasSlice}
                      className="aspect-square rounded-lg text-3xl font-bold flex items-center justify-center transition-all duration-100"
                      style={{
                        background: isSelected ? accentColor + '40' : hasSlice ? '#1a1a1a' : '#0a0a0a',
                        border: `2px solid ${isSelected ? accentColor : hasSlice ? '#333' : '#1a1a1a'}`,
                        color: isSelected ? accentColor : hasSlice ? '#fff' : '#333',
                        cursor: hasSlice ? 'pointer' : 'default',
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
          <div className="flex flex-col gap-4">
            {/* Challenge Description */}
            <Section title="Challenge">
              <p className="text-text-secondary text-lg m-0 leading-relaxed">
                {challenge.description}
              </p>
              {challenge.targetKey && (
                <div
                  className="mt-3 py-2 px-3 bg-[#0a0a0a] rounded-md text-md text-text-muted"
                  style={{ '--accent': accentColor } as React.CSSProperties}
                >
                  Target Key: <strong className="text-(--accent)">{challenge.targetKey}</strong>
                </div>
              )}
              {challenge.targetBpm && (
                <div
                  className="mt-2 py-2 px-3 bg-[#0a0a0a] rounded-md text-md text-text-muted"
                  style={{ '--accent': accentColor } as React.CSSProperties}
                >
                  Target BPM: <strong className="text-(--accent)">{challenge.targetBpm}</strong>
                </div>
              )}
              {challenge.expectedSlices && (
                <div
                  className="mt-2 py-2 px-3 bg-[#0a0a0a] rounded-md text-md text-text-muted"
                  style={{ '--accent': accentColor } as React.CSSProperties}
                >
                  Expected Slices: <strong className="text-(--accent)">{challenge.expectedSlices}</strong>
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
    async () => { const trpc = await getTRPC(); return trpc.feedback.generateSampling.mutate({
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
    }); },
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
