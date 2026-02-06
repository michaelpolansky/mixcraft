/**
 * Additive Synthesis control panel
 * Provides controls for additive synthesis parameters including
 * harmonic drawbars, envelope, and output volume
 */

import type { AdditiveSynthParams, AdditivePreset } from '../../core/types.ts';
import { PARAM_RANGES } from '../../core/types.ts';
import { Knob, HarmonicDrawbars } from './index.ts';

interface AdditiveSynthPanelProps {
  params: AdditiveSynthParams;
  onHarmonicChange: (index: number, value: number) => void;
  onPreset: (preset: AdditivePreset) => void;
  onAttackChange: (value: number) => void;
  onDecayChange: (value: number) => void;
  onSustainChange: (value: number) => void;
  onReleaseChange: (value: number) => void;
  onVolumeChange: (value: number) => void;
}

/**
 * Section container with title
 */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
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

export function AdditiveSynthPanel({
  params,
  onHarmonicChange,
  onPreset,
  onAttackChange,
  onDecayChange,
  onSustainChange,
  onReleaseChange,
  onVolumeChange,
}: AdditiveSynthPanelProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '16px',
        background: '#0d0d0d',
        borderRadius: '16px',
      }}
    >
      {/* Section 1: Harmonic Drawbars (full width) */}
      <HarmonicDrawbars
        harmonics={params.harmonics}
        onChange={onHarmonicChange}
        onPreset={onPreset}
      />

      {/* Section 2: Envelope */}
      <Section title="Envelope">
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Knob
            value={params.amplitudeEnvelope.attack}
            min={PARAM_RANGES.attack.min}
            max={PARAM_RANGES.attack.max}
            step={PARAM_RANGES.attack.step}
            label="Attack"
            onChange={onAttackChange}
            formatValue={(v) => v < 1 ? `${Math.round(v * 1000)}ms` : `${v.toFixed(2)}s`}
            paramId="amplitude.attack"
          />

          <Knob
            value={params.amplitudeEnvelope.decay}
            min={PARAM_RANGES.decay.min}
            max={PARAM_RANGES.decay.max}
            step={PARAM_RANGES.decay.step}
            label="Decay"
            onChange={onDecayChange}
            formatValue={(v) => v < 1 ? `${Math.round(v * 1000)}ms` : `${v.toFixed(2)}s`}
            paramId="amplitude.decay"
          />

          <Knob
            value={params.amplitudeEnvelope.sustain}
            min={PARAM_RANGES.sustain.min}
            max={PARAM_RANGES.sustain.max}
            step={PARAM_RANGES.sustain.step}
            label="Sustain"
            onChange={onSustainChange}
            formatValue={(v) => `${Math.round(v * 100)}%`}
            paramId="amplitude.sustain"
          />

          <Knob
            value={params.amplitudeEnvelope.release}
            min={PARAM_RANGES.release.min}
            max={PARAM_RANGES.release.max}
            step={PARAM_RANGES.release.step}
            label="Release"
            onChange={onReleaseChange}
            formatValue={(v) => v < 1 ? `${Math.round(v * 1000)}ms` : `${v.toFixed(2)}s`}
            paramId="amplitude.release"
          />
        </div>
      </Section>

      {/* Section 3: Output */}
      <Section title="Output">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Knob
            value={params.volume}
            min={PARAM_RANGES.volume.min}
            max={PARAM_RANGES.volume.max}
            step={PARAM_RANGES.volume.step}
            label="Volume"
            onChange={onVolumeChange}
            formatValue={(v) => `${v.toFixed(1)} dB`}
            paramId="volume"
          />
        </div>
      </Section>
    </div>
  );
}
