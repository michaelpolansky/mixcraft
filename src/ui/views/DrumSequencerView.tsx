/**
 * DrumSequencerView
 * Sandbox view for free-play drum pattern creation
 * Features: tempo/swing/volume controls, transport, step grid, velocity lane
 */

import { useEffect, useCallback } from 'react';
import { useDrumSequencerStore } from '../stores/drum-sequencer-store.ts';
import { Knob, StepGrid, VelocityLane } from '../components/index.ts';

interface DrumSequencerViewProps {
  onBack?: () => void;
}

/**
 * Section wrapper component for consistent styling
 */
function Section({
  title,
  children,
}: {
  title?: string;
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
      {title && (
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
      )}
      {children}
    </div>
  );
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '11px', color: '#888' }}>{label}</span>
        <span style={{ fontSize: '11px', color: '#fff', fontFamily: 'monospace' }}>
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
        style={{
          width,
          height: '6px',
          appearance: 'none',
          background: `linear-gradient(to right, #f97316 0%, #f97316 ${percentage}%, #333 ${percentage}%, #333 100%)`,
          borderRadius: '3px',
          cursor: 'pointer',
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

  // Get current selected track
  const currentSelectedTrack = pattern.tracks[selectedTrack];

  return (
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
                Drum Sequencer - {pattern.name || 'New Pattern'}
              </span>
            </div>
          </div>

          {isLoading && (
            <span style={{ color: '#666', fontSize: '13px' }}>Loading...</span>
          )}
        </div>

        {/* Main Layout */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            maxWidth: '900px',
          }}
        >
          {/* Header Controls: Tempo | Swing | Volume | Play/Stop */}
          <Section>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
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
                disabled={!isInitialized || isLoading}
                style={{
                  padding: '12px 32px',
                  background: isPlaying
                    ? '#ef4444'
                    : `linear-gradient(145deg, ${accentColor}, #ea580c)`,
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  cursor: !isInitialized || isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  minWidth: '100px',
                  opacity: !isInitialized || isLoading ? 0.5 : 1,
                  transition: 'all 0.1s ease',
                }}
              >
                {isPlaying ? 'Stop' : 'Play'}
              </button>
            </div>
          </Section>

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
          <Section>
            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-start',
              }}
            >
              <button
                onClick={() => clearTrack(selectedTrack)}
                style={{
                  padding: '10px 20px',
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  color: '#888',
                  cursor: 'pointer',
                  fontSize: '13px',
                  transition: 'all 0.1s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#555';
                  e.currentTarget.style.color = '#aaa';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#333';
                  e.currentTarget.style.color = '#888';
                }}
              >
                Clear Track
              </button>

              <button
                onClick={clearAll}
                style={{
                  padding: '10px 20px',
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  color: '#888',
                  cursor: 'pointer',
                  fontSize: '13px',
                  transition: 'all 0.1s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#ef4444';
                  e.currentTarget.style.color = '#ef4444';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#333';
                  e.currentTarget.style.color = '#888';
                }}
              >
                Clear All
              </button>
            </div>
          </Section>

          {/* Instructions */}
          <div
            style={{
              padding: '16px',
              color: '#555',
              fontSize: '12px',
              textAlign: 'center',
            }}
          >
            Click cells to toggle steps | Click track names to select track |
            Shift+click active steps to drag velocity | Use velocity lane below
            for precise control
          </div>
        </div>
      </div>
    </div>
  );
}
