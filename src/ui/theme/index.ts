/**
 * MIXCRAFT Design System
 *
 * Centralized theme configuration for consistent UI.
 *
 * Usage:
 *   import { COLORS, TYPOGRAPHY, SPACING } from './theme';
 *   // or
 *   import { theme } from './theme';
 *   style={{ background: theme.colors.bg.primary }}
 */

export { COLORS, type SynthStage, type TrackType } from './colors.ts';
export { TYPOGRAPHY, TEXT_STYLES } from './typography.ts';
export {
  SPACING,
  RADIUS,
  LAYOUT,
  Z_INDEX,
  TRANSITIONS,
  SHADOWS,
} from './spacing.ts';

// Combined theme object for convenience
import { COLORS } from './colors.ts';
import { TYPOGRAPHY, TEXT_STYLES } from './typography.ts';
import { SPACING, RADIUS, LAYOUT, Z_INDEX, TRANSITIONS, SHADOWS } from './spacing.ts';

export const theme = {
  colors: COLORS,
  typography: TYPOGRAPHY,
  textStyles: TEXT_STYLES,
  spacing: SPACING,
  radius: RADIUS,
  layout: LAYOUT,
  zIndex: Z_INDEX,
  transitions: TRANSITIONS,
  shadows: SHADOWS,
} as const;
