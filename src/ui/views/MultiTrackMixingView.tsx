/**
 * MultiTrackMixingView
 * View for multi-track mixing challenges (I1+)
 * Handles multiple audio sources with per-track EQ
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import * as Tone from 'tone';
import { useMixingStore, type TrackEQParams } from '../stores/mixing-store.ts';
import { EQControl, SpectrumAnalyzer, Slider } from '../components/index.ts';
import { cn } from '../utils/cn.ts';
import { createAudioSource, type AudioSource } from '../../core/audio-source.ts';
import { MixingEQ, MixingCompressor, MixingReverb } from '../../core/mixing-effects.ts';
import { evaluateMixingChallenge } from '../../core/mixing-evaluation.ts';
import { getTRPC } from '../api/trpc.ts';
import type { MixingChallenge, MixingTrack, EQParams } from '../../core/types.ts';

interface MultiTrackMixingViewProps {
  challenge: MixingChallenge;
  onExit: () => void;
  onNext?: () => void;
  hasNext?: boolean;
}

interface TrackAudio {
  source: AudioSource;
  eq: MixingEQ;
  gain: Tone.Gain;
  panner: Tone.Panner;
  reverb: MixingReverb;
}

export function MultiTrackMixingView({
  challenge,
  onExit,
  onNext,
  hasNext = false,
}: MultiTrackMixingViewProps) {
  const {
    currentAttempt,
    hintsRevealed,
    isScoring,
    lastResult,
    trackParams,
    compressorParams,
    busEQParams,
    loadChallenge,
    revealHint,
    startScoring,
    submitResult,
    retry,
    setTrackEQLow,
    setTrackEQMid,
    setTrackEQHigh,
    setTrackVolume,
    setTrackPan,
    setTrackReverbMix,
    setTrackReverbSize,
    setCompressorThreshold,
    setCompressorAmount,
    setBusEQLow,
    setBusEQMid,
    setBusEQHigh,
  } = useMixingStore();

  // Audio references for each track
  const trackAudioRef = useRef<Map<string, TrackAudio>>(new Map());
  const busEQRef = useRef<MixingEQ | null>(null);
  const busCompressorRef = useRef<MixingCompressor | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gainReduction, setGainReduction] = useState(0);

  // AI feedback state
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // Load challenge on mount
  useEffect(() => {
    loadChallenge(challenge);
  }, [challenge, loadChallenge]);

  // Initialize multi-track audio chain
  useEffect(() => {
    if (!challenge.tracks) return;

    // Create bus processing chain: Bus EQ -> Bus Compressor -> Destination
    busEQRef.current = new MixingEQ();
    busCompressorRef.current = new MixingCompressor();
    busEQRef.current.connect(busCompressorRef.current.input);
    busCompressorRef.current.connect(Tone.getDestination());

    // Create audio for each track
    for (const track of challenge.tracks) {
      const source = createAudioSource(track.sourceConfig);
      const eq = new MixingEQ();
      const gain = new Tone.Gain(Tone.dbToGain(track.initialVolume ?? 0));
      const panner = new Tone.Panner(track.initialPan ?? 0);
      const reverb = new MixingReverb();

      // Chain: source -> eq -> gain -> panner -> reverb -> bus EQ
      source.connect(eq.input);
      eq.connect(gain);
      gain.connect(panner);
      panner.connect(reverb.input);
      reverb.connect(busEQRef.current!.input);

      trackAudioRef.current.set(track.id, { source, eq, gain, panner, reverb });
    }

    // Poll gain reduction
    const pollGR = () => {
      if (busCompressorRef.current) {
        setGainReduction(busCompressorRef.current.gainReduction);
      }
    };
    const grInterval = setInterval(pollGR, 50);

    return () => {
      clearInterval(grInterval);
      // Dispose all track audio
      for (const audio of trackAudioRef.current.values()) {
        audio.source.stop();
        audio.source.dispose();
        audio.eq.dispose();
        audio.gain.dispose();
        audio.panner.dispose();
        audio.reverb.dispose();
      }
      trackAudioRef.current.clear();
      busEQRef.current?.dispose();
      busCompressorRef.current?.dispose();
    };
  }, [challenge]);

  // Sync track EQ params to audio
  useEffect(() => {
    for (const [trackId, params] of Object.entries(trackParams)) {
      const audio = trackAudioRef.current.get(trackId);
      if (audio) {
        audio.eq.setParams({ low: params.low, mid: params.mid, high: params.high });
        audio.gain.gain.value = Tone.dbToGain(params.volume);
        audio.panner.pan.value = params.pan;
        audio.reverb.setParams({ mix: params.reverbMix, size: params.reverbSize });
      }
    }
  }, [trackParams]);

  // Sync bus EQ params
  useEffect(() => {
    if (busEQRef.current) {
      busEQRef.current.setParams(busEQParams);
    }
  }, [busEQParams]);

  // Sync bus compressor params
  useEffect(() => {
    if (busCompressorRef.current) {
      busCompressorRef.current.setParams(compressorParams);
    }
  }, [compressorParams]);

  // Fetch AI feedback when results are available
  useEffect(() => {
    if (!lastResult) {
      setAiFeedback(null);
      return;
    }

    let cancelled = false;
    setFeedbackLoading(true);

    async function fetchFeedback() {
      if (!lastResult) return;
      try {
        const trpc = await getTRPC();
        const response = await trpc.feedback.generateMixing.mutate({
          result: lastResult,
          trackParams: Object.fromEntries(
            Object.entries(trackParams).map(([id, p]) => [
              id,
              { low: p.low, mid: p.mid, high: p.high, volume: p.volume, pan: p.pan, reverbMix: p.reverbMix },
            ])
          ),
          busCompressor: { threshold: compressorParams.threshold, amount: compressorParams.amount },
          busEQ: busEQParams,
          challenge: {
            id: challenge.id,
            title: challenge.title,
            description: challenge.description,
            module: challenge.module,
            trackNames: challenge.tracks?.map((t) => t.name) ?? [],
          },
          attemptNumber: currentAttempt,
        });

        if (!cancelled) {
          setAiFeedback(response.feedback);
          setFeedbackLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch AI feedback:', error);
        if (!cancelled) {
          setFeedbackLoading(false);
        }
      }
    }

    fetchFeedback();

    return () => {
      cancelled = true;
    };
  }, [lastResult, challenge, currentAttempt]);

  // Play/Stop toggle
  const togglePlayback = useCallback(async () => {
    if (isPlaying) {
      for (const audio of trackAudioRef.current.values()) {
        audio.source.stop();
      }
      setIsPlaying(false);
    } else {
      await Tone.start();
      for (const audio of trackAudioRef.current.values()) {
        audio.source.start();
      }
      setIsPlaying(true);
    }
  }, [isPlaying]);

  // Submit and score
  const handleSubmit = useCallback(() => {
    startScoring();

    // Convert track params to format for evaluation (including pan, reverb, and volume)
    const playerTrackEQs: Record<string, EQParams & { pan?: number; reverbMix?: number; volume?: number }> = {};
    for (const [trackId, params] of Object.entries(trackParams)) {
      playerTrackEQs[trackId] = {
        low: params.low,
        mid: params.mid,
        high: params.high,
        pan: params.pan,
        reverbMix: params.reverbMix,
        volume: params.volume,
      };
    }

    const result = evaluateMixingChallenge(
      challenge,
      { low: 0, mid: 0, high: 0 }, // Not used for multi-track
      compressorParams,
      playerTrackEQs,
      busEQParams
    );
    submitResult(result);
  }, [challenge, trackParams, compressorParams, busEQParams, startScoring, submitResult]);

  // Handle retry
  const handleRetry = useCallback(() => {
    for (const audio of trackAudioRef.current.values()) {
      audio.source.stop();
    }
    setIsPlaying(false);
    retry();
  }, [retry]);

  // Handle exit
  const handleExit = useCallback(() => {
    for (const audio of trackAudioRef.current.values()) {
      audio.source.stop();
    }
    setIsPlaying(false);
    onExit();
  }, [onExit]);

  const tracks = challenge.tracks ?? [];
  const showBusEQ = challenge.controls.busEQ === true;
  const showBusCompressor = challenge.controls.busCompressor === true;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-text-primary font-sans p-6">
      <div className="max-w-[1000px] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <button
              onClick={handleExit}
              className="bg-transparent border-none text-text-muted cursor-pointer text-xl mb-2"
            >
              ← Back to Menu
            </button>
            <h1 className="text-4xl font-medium mb-2">{challenge.title}</h1>
            <p className="text-text-tertiary text-xl max-w-[500px]">{challenge.description}</p>
          </div>
          <div className="text-right">
            <div className="text-md text-text-muted mb-1">
              Attempt #{currentAttempt}
            </div>
            <div className="flex gap-1">
              {[1, 2, 3].map((star) => (
                <span
                  key={star}
                  className={cn(
                    'text-2xl',
                    star <= challenge.difficulty ? 'text-warning' : 'text-border-default'
                  )}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-[1fr_280px] gap-6">
          {/* Left: Track Controls */}
          <div>
            {/* Transport */}
            <div className="mb-6">
              <button
                onClick={togglePlayback}
                className="py-3 px-8 text-2xl border-none rounded-lg text-text-primary cursor-pointer font-medium"
                style={{
                  background: isPlaying ? '#ef4444' : '#22c55e',
                }}
              >
                {isPlaying ? '■ Stop' : '▶ Play'}
              </button>
            </div>

            {/* Track Strips */}
            <div className="flex gap-4 mb-6">
              {tracks.map((track) => {
                const params: TrackEQParams = trackParams[track.id] ?? { low: 0, mid: 0, high: 0, volume: 0, pan: 0, reverbMix: 0, reverbSize: 50 };
                return (
                  <div
                    key={track.id}
                    className="flex-1 bg-bg-tertiary rounded-xl p-4"
                    style={{ borderTop: `3px solid ${track.color ?? '#666'}` }}
                  >
                    <div
                      className="text-xl font-medium mb-4"
                      style={{ color: track.color ?? '#fff' }}
                    >
                      {track.name}
                    </div>

                    {/* Per-track EQ */}
                    <div className="mb-4">
                      <div className="text-base text-text-muted mb-2">EQ</div>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base text-text-tertiary w-8">Low</span>
                          <input
                            type="range"
                            min="-12"
                            max="12"
                            step="0.5"
                            value={params.low}
                            onChange={(e) => setTrackEQLow(track.id, parseFloat(e.target.value))}
                            className="flex-1"
                          />
                          <span className="text-base text-text-tertiary w-10 text-right">
                            {params.low > 0 ? '+' : ''}{params.low.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-base text-text-tertiary w-8">Mid</span>
                          <input
                            type="range"
                            min="-12"
                            max="12"
                            step="0.5"
                            value={params.mid}
                            onChange={(e) => setTrackEQMid(track.id, parseFloat(e.target.value))}
                            className="flex-1"
                          />
                          <span className="text-base text-text-tertiary w-10 text-right">
                            {params.mid > 0 ? '+' : ''}{params.mid.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-base text-text-tertiary w-8">High</span>
                          <input
                            type="range"
                            min="-12"
                            max="12"
                            step="0.5"
                            value={params.high}
                            onChange={(e) => setTrackEQHigh(track.id, parseFloat(e.target.value))}
                            className="flex-1"
                          />
                          <span className="text-base text-text-tertiary w-10 text-right">
                            {params.high > 0 ? '+' : ''}{params.high.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Volume */}
                    {challenge.controls.volume && (
                      <div className={challenge.controls.pan ? 'mb-4' : ''}>
                        <div className="text-base text-text-muted mb-2">Volume</div>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="-24"
                            max="6"
                            step="0.5"
                            value={params.volume}
                            onChange={(e) => setTrackVolume(track.id, parseFloat(e.target.value))}
                            className="flex-1"
                          />
                          <span className="text-base text-text-tertiary w-10 text-right">
                            {params.volume > 0 ? '+' : ''}{params.volume.toFixed(1)} dB
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Pan */}
                    {challenge.controls.pan && (
                      <div className={challenge.controls.reverb ? 'mb-4' : ''}>
                        <div className="text-base text-text-muted mb-2">Pan</div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-text-muted">L</span>
                          <input
                            type="range"
                            min="-1"
                            max="1"
                            step="0.1"
                            value={params.pan}
                            onChange={(e) => setTrackPan(track.id, parseFloat(e.target.value))}
                            className="flex-1"
                          />
                          <span className="text-sm text-text-muted">R</span>
                          <span className="text-base text-text-tertiary w-8 text-right">
                            {params.pan === 0 ? 'C' : params.pan < 0 ? `L${Math.abs(params.pan * 100).toFixed(0)}` : `R${(params.pan * 100).toFixed(0)}`}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Reverb */}
                    {challenge.controls.reverb && (
                      <div>
                        <div className="text-base text-text-muted mb-2">Reverb</div>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-text-tertiary w-7">Mix</span>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="5"
                              value={params.reverbMix}
                              onChange={(e) => setTrackReverbMix(track.id, parseFloat(e.target.value))}
                              className="flex-1"
                            />
                            <span className="text-base text-text-tertiary w-8 text-right">
                              {params.reverbMix.toFixed(0)}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-text-tertiary w-7">Size</span>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="5"
                              value={params.reverbSize}
                              onChange={(e) => setTrackReverbSize(track.id, parseFloat(e.target.value))}
                              className="flex-1"
                            />
                            <span className="text-base text-text-tertiary w-8 text-right">
                              {params.reverbSize.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bus Processing Section */}
            {(showBusEQ || showBusCompressor) && (
              <div className="bg-bg-tertiary rounded-xl p-4 mb-6">
                <div className="text-xl font-medium mb-4">Bus Processing</div>

                {/* Bus EQ */}
                {showBusEQ && (
                  <div className={showBusCompressor ? 'mb-4' : ''}>
                    <div className="text-md text-text-tertiary mb-3">Master EQ</div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <div className="text-base text-text-muted mb-1">Low</div>
                        <input
                          type="range"
                          min="-12"
                          max="12"
                          step="0.5"
                          value={busEQParams.low}
                          onChange={(e) => setBusEQLow(parseFloat(e.target.value))}
                          className="w-full"
                        />
                        <div className="text-base text-text-tertiary text-center">
                          {busEQParams.low > 0 ? '+' : ''}{busEQParams.low.toFixed(1)} dB
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-base text-text-muted mb-1">Mid</div>
                        <input
                          type="range"
                          min="-12"
                          max="12"
                          step="0.5"
                          value={busEQParams.mid}
                          onChange={(e) => setBusEQMid(parseFloat(e.target.value))}
                          className="w-full"
                        />
                        <div className="text-base text-text-tertiary text-center">
                          {busEQParams.mid > 0 ? '+' : ''}{busEQParams.mid.toFixed(1)} dB
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-base text-text-muted mb-1">High</div>
                        <input
                          type="range"
                          min="-12"
                          max="12"
                          step="0.5"
                          value={busEQParams.high}
                          onChange={(e) => setBusEQHigh(parseFloat(e.target.value))}
                          className="w-full"
                        />
                        <div className="text-base text-text-tertiary text-center">
                          {busEQParams.high > 0 ? '+' : ''}{busEQParams.high.toFixed(1)} dB
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bus Compressor */}
                {showBusCompressor && (
                  <div>
                    <div className="text-md text-text-tertiary mb-3">Compressor</div>
                    <div className="flex gap-6">
                      <div className="flex-1">
                        <div className="text-base text-text-muted mb-2">Threshold</div>
                        <input
                          type="range"
                          min="-40"
                          max="0"
                          step="1"
                          value={compressorParams.threshold}
                          onChange={(e) => setCompressorThreshold(parseFloat(e.target.value))}
                          className="w-full"
                        />
                        <div className="text-base text-text-tertiary text-center">
                          {compressorParams.threshold} dB
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-base text-text-muted mb-2">Amount</div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={compressorParams.amount}
                          onChange={(e) => setCompressorAmount(parseFloat(e.target.value))}
                          className="w-full"
                        />
                        <div className="text-base text-text-tertiary text-center">
                          {compressorParams.amount}%
                        </div>
                      </div>
                      <div className="w-[60px]">
                        <div className="text-base text-text-muted mb-2">GR</div>
                        <div className="h-[60px] bg-[#0a0a0a] rounded-sm flex items-end justify-center p-1">
                          <div
                            className="w-5 bg-danger rounded-sm"
                            style={{ height: `${Math.min(100, Math.abs(gainReduction) * 5)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            {!lastResult && (
              <button
                onClick={handleSubmit}
                disabled={isScoring}
                className={cn(
                  'w-full py-4 text-2xl border-none rounded-lg text-text-primary font-semibold',
                  isScoring ? 'cursor-default' : 'cursor-pointer'
                )}
                style={{
                  background: isScoring ? '#333' : 'linear-gradient(145deg, #22c55e, #16a34a)',
                }}
              >
                {isScoring ? 'Evaluating...' : 'Submit'}
              </button>
            )}
          </div>

          {/* Right: Hints & Results */}
          <div>
            {/* Hints */}
            <div className="bg-bg-tertiary rounded-xl p-4 mb-4">
              <div className="text-xl font-medium mb-3">Hints</div>
              {challenge.hints.slice(0, hintsRevealed).map((hint, i) => (
                <div
                  key={i}
                  className="text-lg text-text-tertiary mb-2 p-2 bg-[#0a0a0a] rounded-sm"
                >
                  {hint}
                </div>
              ))}
              {hintsRevealed < challenge.hints.length && (
                <button
                  onClick={revealHint}
                  className="w-full py-2 text-lg bg-border-medium border-none rounded-sm text-text-tertiary cursor-pointer"
                >
                  Show Hint ({challenge.hints.length - hintsRevealed} remaining)
                </button>
              )}
            </div>

            {/* Results */}
            {lastResult && (
              <div className={cn(
                'rounded-xl p-4',
                lastResult.passed ? 'bg-[#052e16]' : 'bg-[#450a0a]'
              )}>
                <div className="text-center mb-4">
                  <div className={cn(
                    'text-5xl font-light',
                    lastResult.passed ? 'text-success-light' : 'text-[#f87171]'
                  )}>
                    {lastResult.overall}%
                  </div>
                  <div className="flex justify-center gap-1 mb-2">
                    {[1, 2, 3].map((star) => (
                      <span
                        key={star}
                        className={cn(
                          'text-3xl',
                          star <= lastResult.stars ? 'text-warning' : 'text-border-default'
                        )}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <div className={cn(
                    'text-xl',
                    lastResult.passed ? 'text-success-light' : 'text-[#f87171]'
                  )}>
                    {lastResult.passed ? 'Challenge Complete!' : 'Not quite - try again'}
                  </div>
                </div>

                {/* AI Feedback */}
                <div className="bg-[#0a0a0a] rounded-lg p-3 mb-4 border border-border-default">
                  <div className="text-base text-success-light uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span>✦</span> AI Mentor
                  </div>
                  <div className={cn(
                    'text-text-secondary text-lg leading-relaxed',
                    feedbackLoading && 'italic'
                  )}>
                    {feedbackLoading && 'Analyzing your mix...'}
                    {!feedbackLoading && aiFeedback}
                    {!feedbackLoading && !aiFeedback && 'AI feedback unavailable'}
                  </div>
                </div>

                {/* Condition Feedback */}
                <div className="mb-4">
                  {lastResult.feedback.map((fb, i) => (
                    <div
                      key={i}
                      className="text-md text-text-tertiary mb-1"
                    >
                      • {fb}
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={handleRetry}
                    className="flex-1 py-3 text-xl bg-border-medium border-none rounded-lg text-text-primary cursor-pointer"
                  >
                    Retry
                  </button>
                  {lastResult.passed && hasNext && onNext && (
                    <button
                      onClick={onNext}
                      className="flex-1 py-3 text-xl bg-success border-none rounded-lg text-text-primary cursor-pointer"
                    >
                      Next Challenge
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
