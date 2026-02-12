/**
 * MultiTrackMixingView
 * View for multi-track mixing challenges (I1+)
 * Handles multiple audio sources with per-track EQ
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import * as Tone from 'tone';
import { useMixingStore, type TrackEQParams } from '../stores/mixing-store.ts';
import { HintsPanel } from '../components/index.ts';
import { MixingTrackStrip } from '../components/mixing/MixingTrackStrip.tsx';
import { MixingBusSection } from '../components/mixing/MixingBusSection.tsx';
import { MixingResults } from '../components/mixing/MixingResults.tsx';
import { cn } from '../utils/cn.ts';
import { createAudioSource, type AudioSource } from '../../core/audio-source.ts';
import { MixingEQ, MixingCompressor, MixingReverb, MixingParametricEQ } from '../../core/mixing-effects.ts';
import { evaluateMixingChallenge, parametricToEffective3Band } from '../../core/mixing-evaluation.ts';
import type { MixingChallenge, EQParams } from '../../core/types.ts';

const DEFAULT_TRACK_PARAMS: TrackEQParams = { low: 0, mid: 0, high: 0, volume: 0, pan: 0, reverbMix: 0, reverbSize: 50, compressorThreshold: 0, compressorAmount: 0 };

interface MultiTrackMixingViewProps {
  challenge: MixingChallenge;
  onExit: () => void;
  onNext?: () => void;
  hasNext?: boolean;
}

interface TrackAudio {
  source: AudioSource;
  eq: MixingEQ;
  parametricEQ?: MixingParametricEQ;
  compressor?: MixingCompressor;
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
    trackParametricEQ,
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
    setTrackCompressorThreshold,
    setTrackCompressorAmount,
    setTrackParametricBand,
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
  const [trackGainReduction, setTrackGainReduction] = useState<Record<string, number>>({});

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
    const useParametricEQ = challenge.controls.eq === 'parametric';
    const useTrackCompressor = challenge.controls.trackCompressor === true;
    for (const track of challenge.tracks) {
      const source = createAudioSource(track.sourceConfig);
      const eq = new MixingEQ();
      const gain = new Tone.Gain(Tone.dbToGain(track.initialVolume ?? 0));
      const panner = new Tone.Panner(track.initialPan ?? 0);
      const reverb = new MixingReverb();

      let parametricEQ: MixingParametricEQ | undefined;
      let compressor: MixingCompressor | undefined;

      // Chain: source -> [EQ] -> [compressor] -> gain -> panner -> reverb -> bus EQ
      if (useParametricEQ) {
        parametricEQ = new MixingParametricEQ();
        source.connect(parametricEQ.input);
        if (useTrackCompressor) {
          compressor = new MixingCompressor();
          parametricEQ.connect(compressor.input);
          compressor.connect(gain);
        } else {
          parametricEQ.connect(gain);
        }
      } else {
        source.connect(eq.input);
        if (useTrackCompressor) {
          compressor = new MixingCompressor();
          eq.connect(compressor.input);
          compressor.connect(gain);
        } else {
          eq.connect(gain);
        }
      }
      gain.connect(panner);
      panner.connect(reverb.input);
      reverb.connect(busEQRef.current!.input);

      trackAudioRef.current.set(track.id, { source, eq, parametricEQ, compressor, gain, panner, reverb });
    }

    // Poll gain reduction (bus + per-track)
    const pollGR = () => {
      if (busCompressorRef.current) {
        setGainReduction(busCompressorRef.current.gainReduction);
      }
      const trackGR: Record<string, number> = {};
      for (const [trackId, audio] of trackAudioRef.current.entries()) {
        if (audio.compressor) {
          trackGR[trackId] = audio.compressor.gainReduction;
        }
      }
      setTrackGainReduction(trackGR);
    };
    const grInterval = setInterval(pollGR, 50);

    return () => {
      clearInterval(grInterval);
      for (const audio of trackAudioRef.current.values()) {
        audio.source.stop();
        audio.source.dispose();
        audio.eq.dispose();
        audio.parametricEQ?.dispose();
        audio.compressor?.dispose();
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
        if (audio.compressor) {
          audio.compressor.setThreshold(params.compressorThreshold);
          audio.compressor.setAmount(params.compressorAmount);
        }
      }
    }
  }, [trackParams]);

  // Sync track parametric EQ params to audio
  useEffect(() => {
    for (const [trackId, params] of Object.entries(trackParametricEQ)) {
      const audio = trackAudioRef.current.get(trackId);
      if (audio?.parametricEQ) {
        params.bands.forEach((band, i) => {
          audio.parametricEQ!.setBand(i, band);
        });
      }
    }
  }, [trackParametricEQ]);

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
  const isParametricMode = challenge.controls.eq === 'parametric';

  const handleSubmit = useCallback(() => {
    startScoring();

    const playerTrackEQs: Record<string, EQParams & { pan?: number; reverbMix?: number; volume?: number; compressorAmount?: number }> = {};
    for (const [trackId, params] of Object.entries(trackParams)) {
      const trackPEQ = trackParametricEQ[trackId];
      const effectiveEQ = isParametricMode && trackPEQ
        ? parametricToEffective3Band(trackPEQ)
        : { low: params.low, mid: params.mid, high: params.high };

      playerTrackEQs[trackId] = {
        ...effectiveEQ,
        pan: params.pan,
        reverbMix: params.reverbMix,
        volume: params.volume,
        compressorAmount: params.compressorAmount,
      };
    }

    const result = evaluateMixingChallenge(
      challenge,
      { low: 0, mid: 0, high: 0 },
      compressorParams,
      playerTrackEQs,
      busEQParams
    );
    submitResult(result);
  }, [challenge, trackParams, trackParametricEQ, isParametricMode, compressorParams, busEQParams, startScoring, submitResult]);

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
  const showTrackCompressor = challenge.controls.trackCompressor === true;
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
                className={cn(
                  'py-3 px-8 text-2xl border-none rounded-lg text-text-primary cursor-pointer font-medium',
                  isPlaying ? 'bg-[#ef4444]' : 'bg-[#22c55e]'
                )}
              >
                {isPlaying ? '■ Stop' : '▶ Play'}
              </button>
            </div>

            {/* Track Strips */}
            <div className="flex gap-4 mb-6">
              {tracks.map((track) => {
                const params: TrackEQParams = trackParams[track.id] ?? DEFAULT_TRACK_PARAMS;
                return (
                  <MixingTrackStrip
                    key={track.id}
                    track={track}
                    params={params}
                    isParametricMode={isParametricMode}
                    parametricEQ={trackParametricEQ[track.id]}
                    gainReduction={trackGainReduction[track.id] ?? 0}
                    showCompressor={showTrackCompressor}
                    showVolume={challenge.controls.volume === true}
                    showPan={challenge.controls.pan === true}
                    showReverb={challenge.controls.reverb === true}
                    onEQLowChange={setTrackEQLow}
                    onEQMidChange={setTrackEQMid}
                    onEQHighChange={setTrackEQHigh}
                    onParametricBandChange={setTrackParametricBand}
                    onVolumeChange={setTrackVolume}
                    onPanChange={setTrackPan}
                    onReverbMixChange={setTrackReverbMix}
                    onReverbSizeChange={setTrackReverbSize}
                    onCompressorThresholdChange={setTrackCompressorThreshold}
                    onCompressorAmountChange={setTrackCompressorAmount}
                  />
                );
              })}
            </div>

            {/* Bus Processing Section */}
            {(showBusEQ || showBusCompressor) && (
              <MixingBusSection
                showBusEQ={showBusEQ}
                showBusCompressor={showBusCompressor}
                busEQParams={busEQParams}
                compressorParams={compressorParams}
                gainReduction={gainReduction}
                onBusEQLowChange={setBusEQLow}
                onBusEQMidChange={setBusEQMid}
                onBusEQHighChange={setBusEQHigh}
                onCompressorThresholdChange={setCompressorThreshold}
                onCompressorAmountChange={setCompressorAmount}
              />
            )}

            {/* Submit Button */}
            {!lastResult && (
              <button
                onClick={handleSubmit}
                disabled={isScoring}
                className={cn(
                  'w-full py-4 text-2xl border-none rounded-lg text-text-primary font-semibold',
                  isScoring
                    ? 'cursor-default bg-[#333]'
                    : 'cursor-pointer bg-gradient-to-br from-success to-[#16a34a]'
                )}
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
              <HintsPanel
                hints={challenge.hints}
                hintsRevealed={hintsRevealed}
                onRevealHint={revealHint}
              />
            </div>

            {/* Results */}
            {lastResult && (
              <MixingResults
                result={lastResult}
                challenge={challenge}
                attemptNumber={currentAttempt}
                trackParams={trackParams}
                compressorParams={compressorParams}
                busEQParams={busEQParams}
                onRetry={handleRetry}
                onNext={onNext}
                hasNext={hasNext}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
