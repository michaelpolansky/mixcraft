/**
 * Shared format helpers used across views
 */

export const formatHz = (value: number) =>
  value >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${Math.round(value)}`;

export const formatMs = (value: number) =>
  value >= 1 ? `${value.toFixed(2)}s` : `${Math.round(value * 1000)}ms`;

export const formatPercent = (value: number) =>
  `${Math.round(value * 100)}%`;

export const formatDb = (value: number) =>
  `${value.toFixed(1)}dB`;

export const formatBPM = (value: number) =>
  `${Math.round(value)} BPM`;

export const formatSwing = (value: number) =>
  `${Math.round(value)}%`;

export const formatSemitones = (value: number) =>
  value >= 0 ? `+${value}` : `${value}`;

export const formatOctave = (value: number) =>
  value >= 0 ? `+${value}` : `${value}`;

export const formatCents = (value: number) =>
  value >= 0 ? `+${value}` : `${value}`;

export const formatSemitonesSigned = (v: number) => `${v > 0 ? '+' : ''}${v} st`;

export const formatOctavesSigned = (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)}`;

export const formatPan = (v: number) => {
  if (Math.abs(v) < 0.05) return 'Center';
  if (v < 0) return `${Math.round(Math.abs(v) * 100)}% L`;
  return `${Math.round(v * 100)}% R`;
};
