/**
 * MultiTrackMixingView
 * View for multi-track mixing challenges (I1+)
 * Handles multiple audio sources with per-track EQ
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import * as Tone from 'tone';
import { useMixingStore, type TrackEQParams } from '../stores/mixing-store.ts';
import { EQControl, SpectrumAnalyzer, Slider } from '../components/index.ts';
import { createAudioSource, type AudioSource } from '../../core/audio-source.ts';
import { MixingEQ, MixingCompressor, MixingReverb } from '../../core/mixing-effects.ts';
import { evaluateMixingChallenge } from '../../core/mixing-evaluation.ts';
import { trpc } from '../api/trpc.ts';
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
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '24px',
      }}
    >
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <button
              onClick={handleExit}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                fontSize: '14px',
                marginBottom: '8px',
              }}
            >
              ← Back to Menu
            </button>
            <h1 style={{ fontSize: '24px', fontWeight: 500, marginBottom: '8px' }}>{challenge.title}</h1>
            <p style={{ color: '#888', fontSize: '14px', maxWidth: '500px' }}>{challenge.description}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
              Attempt #{currentAttempt}
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1, 2, 3].map((star) => (
                <span
                  key={star}
                  style={{
                    fontSize: '20px',
                    color: star <= challenge.difficulty ? '#fbbf24' : '#333',
                  }}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px' }}>
          {/* Left: Track Controls */}
          <div>
            {/* Transport */}
            <div style={{ marginBottom: '24px' }}>
              <button
                onClick={togglePlayback}
                style={{
                  padding: '12px 32px',
                  fontSize: '16px',
                  background: isPlaying ? '#ef4444' : '#22c55e',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                {isPlaying ? '■ Stop' : '▶ Play'}
              </button>
            </div>

            {/* Track Strips */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              {tracks.map((track) => {
                const params: TrackEQParams = trackParams[track.id] ?? { low: 0, mid: 0, high: 0, volume: 0, pan: 0, reverbMix: 0, reverbSize: 50 };
                return (
                  <div
                    key={track.id}
                    style={{
                      flex: 1,
                      background: '#1a1a1a',
                      borderRadius: '12px',
                      padding: '16px',
                      borderTop: `3px solid ${track.color ?? '#666'}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        marginBottom: '16px',
                        color: track.color ?? '#fff',
                      }}
                    >
                      {track.name}
                    </div>

                    {/* Per-track EQ */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>EQ</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', color: '#888', width: '32px' }}>Low</span>
                          <input
                            type="range"
                            min="-12"
                            max="12"
                            step="0.5"
                            value={params.low}
                            onChange={(e) => setTrackEQLow(track.id, parseFloat(e.target.value))}
                            style={{ flex: 1 }}
                          />
                          <span style={{ fontSize: '11px', color: '#888', width: '40px', textAlign: 'right' }}>
                            {params.low > 0 ? '+' : ''}{params.low.toFixed(1)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', color: '#888', width: '32px' }}>Mid</span>
                          <input
                            type="range"
                            min="-12"
                            max="12"
                            step="0.5"
                            value={params.mid}
                            onChange={(e) => setTrackEQMid(track.id, parseFloat(e.target.value))}
                            style={{ flex: 1 }}
                          />
                          <span style={{ fontSize: '11px', color: '#888', width: '40px', textAlign: 'right' }}>
                            {params.mid > 0 ? '+' : ''}{params.mid.toFixed(1)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', color: '#888', width: '32px' }}>High</span>
                          <input
                            type="range"
                            min="-12"
                            max="12"
                            step="0.5"
                            value={params.high}
                            onChange={(e) => setTrackEQHigh(track.id, parseFloat(e.target.value))}
                            style={{ flex: 1 }}
                          />
                          <span style={{ fontSize: '11px', color: '#888', width: '40px', textAlign: 'right' }}>
                            {params.high > 0 ? '+' : ''}{params.high.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Volume */}
                    {challenge.controls.volume && (
                      <div style={{ marginBottom: challenge.controls.pan ? '16px' : 0 }}>
                        <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>Volume</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="range"
                            min="-24"
                            max="6"
                            step="0.5"
                            value={params.volume}
                            onChange={(e) => setTrackVolume(track.id, parseFloat(e.target.value))}
                            style={{ flex: 1 }}
                          />
                          <span style={{ fontSize: '11px', color: '#888', width: '40px', textAlign: 'right' }}>
                            {params.volume > 0 ? '+' : ''}{params.volume.toFixed(1)} dB
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Pan */}
                    {challenge.controls.pan && (
                      <div style={{ marginBottom: challenge.controls.reverb ? '16px' : 0 }}>
                        <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>Pan</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '10px', color: '#666' }}>L</span>
                          <input
                            type="range"
                            min="-1"
                            max="1"
                            step="0.1"
                            value={params.pan}
                            onChange={(e) => setTrackPan(track.id, parseFloat(e.target.value))}
                            style={{ flex: 1 }}
                          />
                          <span style={{ fontSize: '10px', color: '#666' }}>R</span>
                          <span style={{ fontSize: '11px', color: '#888', width: '32px', textAlign: 'right' }}>
                            {params.pan === 0 ? 'C' : params.pan < 0 ? `L${Math.abs(params.pan * 100).toFixed(0)}` : `R${(params.pan * 100).toFixed(0)}`}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Reverb */}
                    {challenge.controls.reverb && (
                      <div>
                        <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>Reverb</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '10px', color: '#888', width: '28px' }}>Mix</span>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="5"
                              value={params.reverbMix}
                              onChange={(e) => setTrackReverbMix(track.id, parseFloat(e.target.value))}
                              style={{ flex: 1 }}
                            />
                            <span style={{ fontSize: '11px', color: '#888', width: '32px', textAlign: 'right' }}>
                              {params.reverbMix.toFixed(0)}%
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '10px', color: '#888', width: '28px' }}>Size</span>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="5"
                              value={params.reverbSize}
                              onChange={(e) => setTrackReverbSize(track.id, parseFloat(e.target.value))}
                              style={{ flex: 1 }}
                            />
                            <span style={{ fontSize: '11px', color: '#888', width: '32px', textAlign: 'right' }}>
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
              <div
                style={{
                  background: '#1a1a1a',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '24px',
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '16px' }}>Bus Processing</div>

                {/* Bus EQ */}
                {showBusEQ && (
                  <div style={{ marginBottom: showBusCompressor ? '16px' : 0 }}>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>Master EQ</div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Low</div>
                        <input
                          type="range"
                          min="-12"
                          max="12"
                          step="0.5"
                          value={busEQParams.low}
                          onChange={(e) => setBusEQLow(parseFloat(e.target.value))}
                          style={{ width: '100%' }}
                        />
                        <div style={{ fontSize: '11px', color: '#888', textAlign: 'center' }}>
                          {busEQParams.low > 0 ? '+' : ''}{busEQParams.low.toFixed(1)} dB
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Mid</div>
                        <input
                          type="range"
                          min="-12"
                          max="12"
                          step="0.5"
                          value={busEQParams.mid}
                          onChange={(e) => setBusEQMid(parseFloat(e.target.value))}
                          style={{ width: '100%' }}
                        />
                        <div style={{ fontSize: '11px', color: '#888', textAlign: 'center' }}>
                          {busEQParams.mid > 0 ? '+' : ''}{busEQParams.mid.toFixed(1)} dB
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>High</div>
                        <input
                          type="range"
                          min="-12"
                          max="12"
                          step="0.5"
                          value={busEQParams.high}
                          onChange={(e) => setBusEQHigh(parseFloat(e.target.value))}
                          style={{ width: '100%' }}
                        />
                        <div style={{ fontSize: '11px', color: '#888', textAlign: 'center' }}>
                          {busEQParams.high > 0 ? '+' : ''}{busEQParams.high.toFixed(1)} dB
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bus Compressor */}
                {showBusCompressor && (
                  <div>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>Compressor</div>
                    <div style={{ display: 'flex', gap: '24px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>Threshold</div>
                        <input
                          type="range"
                          min="-40"
                          max="0"
                          step="1"
                          value={compressorParams.threshold}
                          onChange={(e) => setCompressorThreshold(parseFloat(e.target.value))}
                          style={{ width: '100%' }}
                        />
                        <div style={{ fontSize: '11px', color: '#888', textAlign: 'center' }}>
                          {compressorParams.threshold} dB
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>Amount</div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={compressorParams.amount}
                          onChange={(e) => setCompressorAmount(parseFloat(e.target.value))}
                          style={{ width: '100%' }}
                        />
                        <div style={{ fontSize: '11px', color: '#888', textAlign: 'center' }}>
                          {compressorParams.amount}%
                        </div>
                      </div>
                      <div style={{ width: '60px' }}>
                        <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>GR</div>
                        <div
                          style={{
                            height: '60px',
                            background: '#0a0a0a',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            padding: '4px',
                          }}
                        >
                          <div
                            style={{
                              width: '20px',
                              height: `${Math.min(100, Math.abs(gainReduction) * 5)}%`,
                              background: '#ef4444',
                              borderRadius: '2px',
                            }}
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
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '16px',
                  background: isScoring ? '#333' : 'linear-gradient(145deg, #22c55e, #16a34a)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  cursor: isScoring ? 'default' : 'pointer',
                  fontWeight: 600,
                }}
              >
                {isScoring ? 'Evaluating...' : 'Submit'}
              </button>
            )}
          </div>

          {/* Right: Hints & Results */}
          <div>
            {/* Hints */}
            <div
              style={{
                background: '#1a1a1a',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '12px' }}>Hints</div>
              {challenge.hints.slice(0, hintsRevealed).map((hint, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: '13px',
                    color: '#888',
                    marginBottom: '8px',
                    padding: '8px',
                    background: '#0a0a0a',
                    borderRadius: '4px',
                  }}
                >
                  {hint}
                </div>
              ))}
              {hintsRevealed < challenge.hints.length && (
                <button
                  onClick={revealHint}
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: '13px',
                    background: '#333',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#888',
                    cursor: 'pointer',
                  }}
                >
                  Show Hint ({challenge.hints.length - hintsRevealed} remaining)
                </button>
              )}
            </div>

            {/* Results */}
            {lastResult && (
              <div
                style={{
                  background: lastResult.passed ? '#052e16' : '#450a0a',
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <div style={{ fontSize: '48px', fontWeight: 300, color: lastResult.passed ? '#4ade80' : '#f87171' }}>
                    {lastResult.overall}%
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '8px' }}>
                    {[1, 2, 3].map((star) => (
                      <span
                        key={star}
                        style={{
                          fontSize: '24px',
                          color: star <= lastResult.stars ? '#fbbf24' : '#333',
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <div style={{ fontSize: '14px', color: lastResult.passed ? '#4ade80' : '#f87171' }}>
                    {lastResult.passed ? 'Challenge Complete!' : 'Not quite - try again'}
                  </div>
                </div>

                {/* AI Feedback */}
                <div
                  style={{
                    background: '#0a0a0a',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '16px',
                    border: '1px solid #2a2a2a',
                  }}
                >
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#4ade80',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>✦</span> AI Mentor
                  </div>
                  <div
                    style={{
                      color: '#ccc',
                      fontSize: '13px',
                      lineHeight: '1.5',
                      fontStyle: feedbackLoading ? 'italic' : 'normal',
                    }}
                  >
                    {feedbackLoading && 'Analyzing your mix...'}
                    {!feedbackLoading && aiFeedback}
                    {!feedbackLoading && !aiFeedback && 'AI feedback unavailable'}
                  </div>
                </div>

                {/* Condition Feedback */}
                <div style={{ marginBottom: '16px' }}>
                  {lastResult.feedback.map((fb, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: '12px',
                        color: '#888',
                        marginBottom: '4px',
                      }}
                    >
                      • {fb}
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleRetry}
                    style={{
                      flex: 1,
                      padding: '12px',
                      fontSize: '14px',
                      background: '#333',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    Retry
                  </button>
                  {lastResult.passed && hasNext && onNext && (
                    <button
                      onClick={onNext}
                      style={{
                        flex: 1,
                        padding: '12px',
                        fontSize: '14px',
                        background: '#22c55e',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        cursor: 'pointer',
                      }}
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
