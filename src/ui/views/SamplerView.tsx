/**
 * SamplerView
 * Sandbox view for sample manipulation with waveform visualization,
 * pitch/time controls, and slice-based playback
 */

import { useEffect, useCallback } from 'react';
import { useSamplerStore } from '../stores/sampler-store.ts';
import {
  Knob,
  WaveformEditor,
  SpectrumAnalyzer,
  InfoPanel,
} from '../components/index.ts';
import { InfoPanelProvider } from '../context/InfoPanelContext.tsx';
import { SAMPLER_PARAM_RANGES } from '../../core/types.ts';

/**
 * Demo sample library (URLs won't work without actual files)
 */
const SAMPLE_LIBRARY = [
  { name: 'Drum Break', url: '/samples/drum-break.wav' },
  { name: 'Vocal Chop', url: '/samples/vocal-chop.wav' },
  { name: 'Bass Hit', url: '/samples/bass-hit.wav' },
  { name: 'Piano Loop', url: '/samples/piano-loop.wav' },
];

interface SamplerViewProps {
  onBack?: () => void;
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

export function SamplerView({ onBack }: SamplerViewProps) {
  const {
    params,
    isInitialized,
    isPlaying,
    isLoading,
    initEngine,
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
    getAnalyser,
    getWaveformData,
  } = useSamplerStore();

  // Initialize engine on mount
  useEffect(() => {
    initEngine();
  }, [initEngine]);

  // Handle sample loading
  const handleLoadSample = useCallback(
    async (url: string, name: string) => {
      await loadSample(url, name);
    },
    [loadSample]
  );

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {onBack && (
                <button
                  onClick={onBack}
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
              )}
              <div>
                <h1
                  style={{
                    fontSize: '24px',
                    fontWeight: 300,
                    margin: 0,
                    color: accentColor,
                  }}
                >
                  MIXCRAFT
                </h1>
                <span style={{ fontSize: '12px', color: '#666' }}>
                  Sampler {params.sampleName && `- ${params.sampleName}`}
                </span>
              </div>
            </div>

            {isLoading && (
              <span style={{ color: '#666', fontSize: '13px' }}>
                Loading...
              </span>
            )}
          </div>

          {/* Main Layout - Two Columns */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 320px',
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
              {/* Sample Library */}
              <Section title="Sample Library">
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {SAMPLE_LIBRARY.map((sample) => (
                    <button
                      key={sample.name}
                      onClick={() => handleLoadSample(sample.url, sample.name)}
                      disabled={isLoading}
                      style={{
                        padding: '8px 16px',
                        background:
                          params.sampleName === sample.name
                            ? accentColor + '30'
                            : '#1a1a1a',
                        border: `1px solid ${params.sampleName === sample.name ? accentColor : '#333'}`,
                        borderRadius: '6px',
                        color:
                          params.sampleName === sample.name
                            ? accentColor
                            : '#aaa',
                        cursor: isLoading ? 'wait' : 'pointer',
                        fontSize: '13px',
                        fontWeight: 500,
                        transition: 'all 0.1s ease',
                      }}
                    >
                      {sample.name}
                    </button>
                  ))}
                </div>
              </Section>

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

                    <div style={{ marginLeft: 'auto', color: '#666', fontSize: '12px' }}>
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
            </div>

            {/* Right Column - Pads and Spectrum */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {/* Slice Pads */}
              <Section title="Slice Pads">
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
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
                <p
                  style={{
                    margin: '12px 0 0 0',
                    fontSize: '11px',
                    color: '#555',
                    textAlign: 'center',
                  }}
                >
                  Click pads to trigger slices
                </p>
              </Section>

              {/* Spectrum Analyzer */}
              <Section title="Spectrum Analyzer">
                <SpectrumAnalyzer
                  getAnalyser={getAnalyser}
                  width={280}
                  height={150}
                  barCount={40}
                />
              </Section>
            </div>
          </div>
        </div>
        <InfoPanel accentColor={accentColor} />
      </div>
    </InfoPanelProvider>
  );
}
