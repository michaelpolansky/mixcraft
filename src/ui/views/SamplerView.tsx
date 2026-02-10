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
import { Section } from '../components/ModuleCard.tsx';
import { BackButton } from '../components/Button.tsx';
import { InfoPanelProvider } from '../context/InfoPanelContext.tsx';
import { cn } from '../utils/cn.ts';
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
  const disabled = !isInitialized || params.duration === 0;

  return (
    <InfoPanelProvider>
      <div className="min-h-screen bg-bg-primary text-text-primary font-sans flex flex-col">
        <div className="p-6 flex-1">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              {onBack && <BackButton onClick={onBack} />}
              <div>
                <h1
                  className="text-4xl font-light m-0"
                  style={{ color: accentColor }}
                >
                  MIXCRAFT
                </h1>
                <span className="text-md text-text-muted">
                  Sampler {params.sampleName && `- ${params.sampleName}`}
                </span>
              </div>
            </div>

            {isLoading && (
              <span className="text-text-muted text-lg">Loading...</span>
            )}
          </div>

          {/* Main Layout - Two Columns */}
          <div className="grid grid-cols-[1fr_320px] gap-6 max-w-[1200px]">
            {/* Left Column - Main Content */}
            <div className="flex flex-col gap-4">
              {/* Sample Library */}
              <Section title="Sample Library">
                <div className="flex gap-2 flex-wrap">
                  {SAMPLE_LIBRARY.map((sample) => {
                    const isSelected = params.sampleName === sample.name;
                    return (
                      <button
                        key={sample.name}
                        onClick={() => handleLoadSample(sample.url, sample.name)}
                        disabled={isLoading}
                        className={cn(
                          'py-2 px-4 rounded-md text-lg font-medium transition-all duration-100',
                          isLoading ? 'cursor-wait' : 'cursor-pointer',
                          isSelected
                            ? 'border'
                            : 'bg-bg-tertiary border border-border-medium text-text-secondary'
                        )}
                        style={isSelected ? {
                          '--accent': accentColor,
                          background: `${accentColor}30`,
                          borderColor: accentColor,
                          color: accentColor,
                        } as React.CSSProperties : undefined}
                      >
                        {sample.name}
                      </button>
                    );
                  })}
                </div>
              </Section>

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
                      disabled={disabled}
                      className={cn(
                        'py-2.5 px-6 border-none rounded-md text-text-primary text-xl font-semibold min-w-[100px]',
                        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                      )}
                      style={{
                        background: isPlaying
                          ? '#ef4444'
                          : `linear-gradient(145deg, ${accentColor}, #9333ea)`,
                      }}
                    >
                      {isPlaying ? 'Stop' : 'Play'}
                    </button>

                    <button
                      onClick={() => autoSlice(8)}
                      disabled={disabled}
                      className={cn(
                        'py-2.5 px-5 bg-bg-tertiary border border-border-medium rounded-md text-text-secondary text-lg',
                        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                      )}
                    >
                      Auto-Slice (8)
                    </button>

                    <div className="ml-auto text-text-muted text-md">
                      {params.slices.length > 0 && (
                        <span>{params.slices.length} slices</span>
                      )}
                    </div>
                  </div>
                </div>
              </Section>

              {/* Pitch & Time Controls */}
              <Section title="Pitch & Time">
                <div className="flex gap-8">
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
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-text-secondary text-lg">
                    <input
                      type="checkbox"
                      checked={params.loop}
                      onChange={(e) => setLoop(e.target.checked)}
                      className="w-4 h-4 cursor-pointer"
                      style={{ accentColor }}
                    />
                    Loop
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-text-secondary text-lg">
                    <input
                      type="checkbox"
                      checked={params.reverse}
                      onChange={(e) => setReverse(e.target.checked)}
                      className="w-4 h-4 cursor-pointer"
                      style={{ accentColor }}
                    />
                    Reverse
                  </label>
                </div>
              </Section>
            </div>

            {/* Right Column - Pads and Spectrum */}
            <div className="flex flex-col gap-4">
              {/* Slice Pads */}
              <Section title="Slice Pads">
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 8 }).map((_, index) => {
                    const hasSlice = index < params.slices.length;
                    const isSelected = params.selectedSlice === index;

                    return (
                      <button
                        key={index}
                        onClick={() => hasSlice && triggerSlice(index)}
                        disabled={!hasSlice}
                        className={cn(
                          'aspect-square rounded-md text-3xl font-bold flex items-center justify-center transition-all duration-100 border-2',
                          hasSlice ? 'cursor-pointer' : 'cursor-default',
                          isSelected
                            ? ''
                            : hasSlice
                              ? 'bg-bg-tertiary border-border-medium text-text-primary'
                              : 'bg-bg-primary border-border-subtle text-border-medium'
                        )}
                        style={isSelected ? {
                          background: `${accentColor}40`,
                          borderColor: accentColor,
                          color: accentColor,
                        } : undefined}
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
                <p className="mt-3 text-xs text-text-disabled text-center">
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
