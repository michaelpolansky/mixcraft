/**
 * OSC stage with waveform, octave, detune, pulse width, glide, unison
 */

import { Knob, WaveformSelector, OscillatorVisualizer, StageCard, GlideControls } from '../index.ts';
import type { OscillatorType } from '../../../core/types.ts';

interface OscillatorStageProps {
  params: {
    oscillator: {
      type: OscillatorType;
      octave: number;
      detune: number;
      pulseWidth: number;
      level: number;
    };
    glide: { enabled: boolean; time: number };
    unison: { enabled: boolean; voices: number; detune: number; spread: number };
  };
  setOscillatorType: (t: OscillatorType) => void;
  setOctave: (v: number) => void;
  setDetune: (v: number) => void;
  setPulseWidth: (v: number) => void;
  setGlideEnabled: (v: boolean) => void;
  setGlideTime: (v: number) => void;
  setUnisonEnabled: (v: boolean) => void;
  setUnisonVoices: (voices: 2 | 4 | 8) => void;
  setUnisonDetune: (v: number) => void;
  setUnisonSpread: (v: number) => void;
  modulatedPitch?: number;
  color: string;
}

const SIZES = {
  visualizer: { width: 200, height: 100 },
  gap: { xs: 4, sm: 8, md: 12 },
  margin: { section: 12 },
};

export function OscillatorStage({
  params,
  setOscillatorType,
  setOctave,
  setDetune,
  setPulseWidth,
  setGlideEnabled,
  setGlideTime,
  setUnisonEnabled,
  setUnisonVoices,
  setUnisonDetune,
  setUnisonSpread,
  modulatedPitch,
  color,
}: OscillatorStageProps) {
  return (
    <StageCard title="OSC" color={color}>
      <OscillatorVisualizer
        waveform={params.oscillator.type}
        octave={params.oscillator.octave}
        detune={params.oscillator.detune}
        width={SIZES.visualizer.width}
        height={SIZES.visualizer.height}
        accentColor={color}
        compact
      />
      <div style={{ marginTop: SIZES.margin.section }}>
        <WaveformSelector value={params.oscillator.type} onChange={setOscillatorType} accentColor={color} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: SIZES.gap.sm, marginTop: SIZES.margin.section }}>
        <Knob label="Octave" value={params.oscillator.octave} min={-2} max={2} step={1} onChange={setOctave} formatValue={(v) => v >= 0 ? `+${v}` : `${v}`} paramId="oscillator.octave" />
        <Knob label="Detune" value={params.oscillator.detune} min={-100} max={100} step={1} onChange={setDetune} formatValue={(v) => `${v} ct`} paramId="oscillator.detune" modulatedValue={modulatedPitch} />
        {params.oscillator.type === 'square' && (
          <Knob label="Pulse Width" value={params.oscillator.pulseWidth} min={0.1} max={0.9} step={0.01} onChange={setPulseWidth} formatValue={(v) => `${Math.round(v * 100)}%`} paramId="oscillator.pulseWidth" />
        )}
      </div>
      <GlideControls
        enabled={params.glide.enabled}
        time={params.glide.time}
        onEnabledChange={setGlideEnabled}
        onTimeChange={setGlideTime}
        color={color}
      />

      {/* Unison controls */}
      <div style={{ marginTop: SIZES.gap.md, paddingTop: SIZES.gap.md, borderTop: '1px solid #222' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: SIZES.gap.sm, marginBottom: params.unison.enabled ? SIZES.gap.sm : 0 }}>
          <button
            onClick={() => setUnisonEnabled(!params.unison.enabled)}
            style={{
              padding: '4px 8px',
              background: params.unison.enabled ? color : '#222',
              border: `1px solid ${params.unison.enabled ? color : '#444'}`,
              borderRadius: '4px',
              color: params.unison.enabled ? '#fff' : '#888',
              fontSize: '10px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            UNISON
          </button>
        </div>
        {params.unison.enabled && (
          <div style={{ display: 'flex', gap: SIZES.gap.sm, alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase' }}>Voices</span>
              <div style={{ display: 'flex', gap: 2 }}>
                {([2, 4, 8] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setUnisonVoices(v)}
                    style={{
                      width: 24,
                      height: 24,
                      fontSize: '10px',
                      fontWeight: 600,
                      background: params.unison.voices === v ? color : '#333',
                      border: 'none',
                      borderRadius: '4px',
                      color: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <Knob label="Detune" value={params.unison.detune} min={0} max={100} step={1} onChange={setUnisonDetune} formatValue={(v) => `${v} ct`} paramId="unison.detune" />
            <Knob label="Spread" value={params.unison.spread} min={0} max={1} step={0.01} onChange={setUnisonSpread} formatValue={(v) => `${Math.round(v * 100)}%`} paramId="unison.spread" />
          </div>
        )}
      </div>
    </StageCard>
  );
}
