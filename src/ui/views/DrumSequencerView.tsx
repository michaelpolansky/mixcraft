/**
 * DrumSequencerView
 * Sandbox view for free-play drum pattern creation
 * Features: tempo/swing/volume controls, transport, step grid, velocity lane
 */

import { useEffect, useCallback } from 'react';
import { useDrumSequencerStore } from '../stores/drum-sequencer-store.ts';
import { Knob, StepGrid, VelocityLane } from '../components/index.ts';
import { Section } from '../components/ModuleCard.tsx';
import { BackButton } from '../components/Button.tsx';
import { cn } from '../utils/cn.ts';

interface DrumSequencerViewProps {
  onBack?: () => void;
}

/**
 * Horizontal slider component for tempo and swing
 */
function HorizontalSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  formatValue,
  width = 120,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  width?: number;
}) {
  const displayValue = formatValue ? formatValue(value) : value.toString();
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <span className="text-base text-text-tertiary">{label}</span>
        <span className="text-base text-text-primary font-mono">
          {displayValue}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step ?? 1}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-1.5 appearance-none rounded-sm cursor-pointer"
        style={{
          width,
          background: `linear-gradient(to right, #f97316 0%, #f97316 ${percentage}%, #333 ${percentage}%, #333 100%)`,
        }}
      />
    </div>
  );
}

export function DrumSequencerView({ onBack }: DrumSequencerViewProps) {
  const {
    pattern,
    currentStep,
    isPlaying,
    isInitialized,
    isLoading,
    selectedTrack,
    volume,
    initEngine,
    start,
    stop,
    setTempo,
    setSwing,
    toggleStep,
    setStepVelocity,
    clearTrack,
    clearAll,
    setSelectedTrack,
    setVolume,
    dispose,
  } = useDrumSequencerStore();

  // Initialize engine on mount, dispose on unmount
  useEffect(() => {
    initEngine();
    return () => {
      dispose();
    };
  }, [initEngine, dispose]);

  // Handle play/stop toggle
  const handlePlayStop = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      start();
    }
  }, [isPlaying, start, stop]);

  // Handle velocity change from StepGrid
  const handleGridVelocityChange = useCallback(
    (trackIndex: number, stepIndex: number, velocity: number) => {
      setStepVelocity(trackIndex, stepIndex, velocity);
    },
    [setStepVelocity]
  );

  // Handle velocity change from VelocityLane
  const handleVelocityChange = useCallback(
    (stepIndex: number, velocity: number) => {
      setStepVelocity(selectedTrack, stepIndex, velocity);
    },
    [selectedTrack, setStepVelocity]
  );

  // Format helpers
  const formatBPM = (value: number) => `${Math.round(value)} BPM`;
  const formatSwing = (value: number) => `${Math.round(value)}%`;
  const formatDb = (value: number) => `${value.toFixed(1)}dB`;

  // Accent color for drum sequencer (orange theme)
  const accentColor = '#f97316';
  const transportDisabled = !isInitialized || isLoading;

  // Get current selected track
  const currentSelectedTrack = pattern.tracks[selectedTrack];

  return (
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
                Drum Sequencer - {pattern.name || 'New Pattern'}
              </span>
            </div>
          </div>

          {isLoading && (
            <span className="text-text-muted text-lg">Loading...</span>
          )}
        </div>

        {/* Main Layout */}
        <div className="flex flex-col gap-4 max-w-[900px]">
          {/* Header Controls: Tempo | Swing | Volume | Play/Stop */}
          <div className="bg-bg-secondary rounded-lg p-4 border border-border-default">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="flex items-center gap-8">
                {/* Tempo Slider */}
                <HorizontalSlider
                  label="Tempo"
                  value={pattern.tempo}
                  min={60}
                  max={200}
                  step={1}
                  onChange={setTempo}
                  formatValue={formatBPM}
                  width={140}
                />

                {/* Swing Slider */}
                <HorizontalSlider
                  label="Swing"
                  value={pattern.swing * 100}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(val) => setSwing(val / 100)}
                  formatValue={formatSwing}
                  width={100}
                />

                {/* Volume Knob */}
                <Knob
                  label="Volume"
                  value={volume}
                  min={-60}
                  max={0}
                  step={0.5}
                  onChange={setVolume}
                  formatValue={formatDb}
                  size={48}
                />
              </div>

              {/* Transport Controls */}
              <button
                onClick={handlePlayStop}
                disabled={transportDisabled}
                className={cn(
                  'py-3 px-8 border-none rounded-md text-text-primary text-xl font-semibold min-w-[100px] transition-all duration-100',
                  transportDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                )}
                style={{
                  background: isPlaying
                    ? '#ef4444'
                    : `linear-gradient(145deg, ${accentColor}, #ea580c)`,
                }}
              >
                {isPlaying ? 'Stop' : 'Play'}
              </button>
            </div>
          </div>

          {/* StepGrid (Main Area) */}
          <Section title="Pattern">
            <StepGrid
              pattern={pattern}
              currentStep={isPlaying ? currentStep : -1}
              selectedTrack={selectedTrack}
              onToggleStep={toggleStep}
              onSelectTrack={setSelectedTrack}
              onVelocityChange={handleGridVelocityChange}
              width={800}
              height={pattern.tracks.length * 50}
              accentColor={accentColor}
            />
          </Section>

          {/* VelocityLane (Selected Track) */}
          {currentSelectedTrack && (
            <Section title={`Velocity - ${currentSelectedTrack.name}`}>
              <VelocityLane
                track={currentSelectedTrack}
                trackIndex={selectedTrack}
                onVelocityChange={handleVelocityChange}
                width={800}
                height={80}
                accentColor={accentColor}
              />
            </Section>
          )}

          {/* Footer: Clear Track | Clear All */}
          <div className="bg-bg-secondary rounded-lg p-4 border border-border-default">
            <div className="flex gap-3 justify-start">
              <button
                onClick={() => clearTrack(selectedTrack)}
                className="py-2.5 px-5 bg-bg-tertiary border border-border-medium rounded-md text-text-tertiary cursor-pointer text-lg transition-all duration-100 hover:border-border-bright hover:text-text-secondary"
              >
                Clear Track
              </button>

              <button
                onClick={clearAll}
                className="py-2.5 px-5 bg-bg-tertiary border border-border-medium rounded-md text-text-tertiary cursor-pointer text-lg transition-all duration-100 hover:border-danger hover:text-danger"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-4 text-text-disabled text-md text-center">
            Click cells to toggle steps | Click track names to select track |
            Shift+click active steps to drag velocity | Use velocity lane below
            for precise control
          </div>
        </div>
      </div>
    </div>
  );
}
