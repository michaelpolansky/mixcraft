/**
 * OSC stage with waveform, octave, detune, pulse width, glide, unison
 */

import { Knob, WaveformSelector, OscillatorVisualizer, StageCard, GlideControls } from '../index.ts';
import { cn } from '../../utils/cn.ts';
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
        width={200}
        height={100}
        accentColor={color}
        compact
      />
      <div className="mt-3">
        <WaveformSelector value={params.oscillator.type} onChange={setOscillatorType} accentColor={color} />
      </div>
      <div className="flex flex-col gap-2 mt-3">
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
      <div className="mt-3 pt-3 border-t border-bg-quaternary">
        <div className={cn('flex items-center gap-2', params.unison.enabled && 'mb-2')}>
          <button
            onClick={() => setUnisonEnabled(!params.unison.enabled)}
            className={cn(
              'py-1 px-2 rounded-sm text-sm cursor-pointer font-semibold border',
              params.unison.enabled
                ? 'text-text-primary'
                : 'bg-bg-quaternary border-border-bright text-text-tertiary'
            )}
            style={params.unison.enabled ? { background: color, borderColor: color } : undefined}
          >
            UNISON
          </button>
        </div>
        {params.unison.enabled && (
          <div className="flex gap-2 items-start">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-text-tertiary uppercase">Voices</span>
              <div className="flex gap-0.5">
                {([2, 4, 8] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setUnisonVoices(v)}
                    className={cn(
                      'w-6 h-6 text-sm font-semibold border-none rounded-sm text-text-primary cursor-pointer',
                      params.unison.voices === v ? '' : 'bg-border-medium'
                    )}
                    style={params.unison.voices === v ? { background: color } : undefined}
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
