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
