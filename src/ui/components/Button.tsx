/**
 * Standardized Button Component
 *
 * Provides consistent button styling across the app with variants,
 * sizes, loading states, and accessibility features.
 */

import { type ReactNode, type ButtonHTMLAttributes, forwardRef } from 'react';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, TRANSITIONS, SHADOWS } from '../theme/index.ts';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size preset */
  size?: ButtonSize;
  /** Show loading spinner */
  loading?: boolean;
  /** Icon to show before text */
  leftIcon?: ReactNode;
  /** Icon to show after text */
  rightIcon?: ReactNode;
  /** Make button full width */
  fullWidth?: boolean;
  /** Custom accent color (overrides variant color) */
  accentColor?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  children: ReactNode;
}

// Size configurations
const SIZES: Record<ButtonSize, { height: number; padding: string; fontSize: string; iconSize: number }> = {
  sm: {
    height: 32,
    padding: `0 ${SPACING.md}px`,
    fontSize: TYPOGRAPHY.size.sm,
    iconSize: 14,
  },
  md: {
    height: 40,
    padding: `0 ${SPACING.lg}px`,
    fontSize: TYPOGRAPHY.size.md,
    iconSize: 16,
  },
  lg: {
    height: 48,
    padding: `0 ${SPACING.xl}px`,
    fontSize: TYPOGRAPHY.size.lg,
    iconSize: 18,
  },
};

// Variant configurations
const getVariantStyles = (variant: ButtonVariant, accentColor?: string) => {
  const accent = accentColor || COLORS.accent.primary;

  switch (variant) {
    case 'primary':
      return {
        background: `linear-gradient(135deg, ${COLORS.success}, ${COLORS.successLight})`,
        color: COLORS.bg.primary,
        border: 'none',
        hoverBackground: COLORS.successLight,
        activeBackground: COLORS.success,
      };
    case 'secondary':
      return {
        background: COLORS.bg.tertiary,
        color: COLORS.text.primary,
        border: `1px solid ${COLORS.border.medium}`,
        hoverBackground: COLORS.bg.quaternary,
        activeBackground: COLORS.border.default,
      };
    case 'danger':
      return {
        background: COLORS.danger,
        color: COLORS.text.primary,
        border: 'none',
        hoverBackground: '#dc2626', // Slightly darker red
        activeBackground: '#b91c1c',
      };
    case 'ghost':
      return {
        background: 'transparent',
        color: COLORS.text.secondary,
        border: 'none',
        hoverBackground: COLORS.interactive.hover,
        activeBackground: COLORS.interactive.active,
      };
    case 'outline':
      return {
        background: 'transparent',
        color: accent,
        border: `1px solid ${accent}`,
        hoverBackground: `${accent}15`,
        activeBackground: `${accent}25`,
      };
    default:
      return getVariantStyles('secondary');
  }
};

/**
 * Loading spinner component
 */
function Spinner({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{
        animation: 'spin 1s linear infinite',
      }}
    >
      <style>
        {`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
      </style>
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="31.4 31.4"
        opacity={0.25}
      />
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="31.4 31.4"
        strokeDashoffset="23.55"
      />
    </svg>
  );
}

/**
 * Button component with variants, sizes, and states
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'secondary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  accentColor,
  disabled,
  children,
  style,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onMouseUp,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const sizeConfig = SIZES[size];
  const variantStyles = getVariantStyles(variant, accentColor);
  const isDisabled = disabled || loading;

  // State for hover/active effects
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled) {
      e.currentTarget.style.background = variantStyles.hoverBackground;
    }
    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled) {
      e.currentTarget.style.background = variantStyles.background;
    }
    onMouseLeave?.(e);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled) {
      e.currentTarget.style.background = variantStyles.activeBackground;
      e.currentTarget.style.transform = 'scale(0.98)';
    }
    onMouseDown?.(e);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled) {
      e.currentTarget.style.background = variantStyles.hoverBackground;
      e.currentTarget.style.transform = 'scale(1)';
    }
    onMouseUp?.(e);
  };

  const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
    e.currentTarget.style.boxShadow = `0 0 0 2px ${COLORS.interactive.focus}`;
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
    e.currentTarget.style.boxShadow = 'none';
    onBlur?.(e);
  };

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={{
        // Layout
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        width: fullWidth ? '100%' : 'auto',
        height: sizeConfig.height,
        padding: sizeConfig.padding,

        // Typography
        fontSize: sizeConfig.fontSize,
        fontFamily: TYPOGRAPHY.family.sans,
        fontWeight: TYPOGRAPHY.weight.medium,
        lineHeight: 1,
        textDecoration: 'none',
        whiteSpace: 'nowrap',

        // Appearance
        background: variantStyles.background,
        color: variantStyles.color,
        border: variantStyles.border,
        borderRadius: RADIUS.md,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,

        // Interaction
        outline: 'none',
        transition: `all ${TRANSITIONS.fast}`,
        transform: 'scale(1)',

        // Merge custom styles
        ...style,
      }}
      {...props}
    >
      {/* Loading spinner replaces left icon */}
      {loading ? (
        <Spinner size={sizeConfig.iconSize} />
      ) : leftIcon ? (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {leftIcon}
        </span>
      ) : null}

      {/* Button text */}
      <span>{children}</span>

      {/* Right icon (hidden when loading) */}
      {rightIcon && !loading && (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {rightIcon}
        </span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

/**
 * Icon-only button variant
 */
interface IconButtonProps extends Omit<ButtonProps, 'children' | 'leftIcon' | 'rightIcon'> {
  /** The icon to display */
  icon: ReactNode;
  /** Accessible label (required for icon-only buttons) */
  'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(({
  icon,
  size = 'md',
  style,
  ...props
}, ref) => {
  const sizeConfig = SIZES[size];

  return (
    <Button
      ref={ref}
      size={size}
      style={{
        padding: 0,
        width: sizeConfig.height,
        minWidth: sizeConfig.height,
        ...style,
      }}
      {...props}
    >
      {icon}
    </Button>
  );
});

IconButton.displayName = 'IconButton';

/**
 * Button group for related actions
 */
interface ButtonGroupProps {
  children: ReactNode;
  /** Spacing between buttons */
  spacing?: number;
  /** Direction of button layout */
  direction?: 'horizontal' | 'vertical';
}

export function ButtonGroup({
  children,
  spacing = SPACING.sm,
  direction = 'horizontal',
}: ButtonGroupProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: direction === 'horizontal' ? 'row' : 'column',
        gap: spacing,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Back/Menu button - common navigation pattern
 */
interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

export function BackButton({ onClick, label = 'Menu' }: BackButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      style={{
        background: COLORS.bg.tertiary,
        border: `1px solid ${COLORS.border.medium}`,
      }}
    >
      ← {label}
    </Button>
  );
}

/**
 * Card button - larger button with title and description
 * Used for sandbox selection and major actions
 */
interface CardButtonProps {
  onClick: () => void;
  title: string;
  description: string;
  accentColor?: string;
  icon?: ReactNode;
  primary?: boolean;
}

export function CardButton({
  onClick,
  title,
  description,
  accentColor,
  icon,
  primary = false,
}: CardButtonProps) {
  const borderColor = accentColor || COLORS.border.default;
  const titleColor = accentColor || COLORS.text.primary;

  return (
    <button
      onClick={onClick}
      style={{
        padding: `${SPACING.xl}px ${SPACING['2xl']}px`,
        background: primary
          ? `linear-gradient(145deg, ${COLORS.success}, #16a34a)`
          : COLORS.bg.secondary,
        border: primary ? 'none' : `1px solid ${borderColor}`,
        borderRadius: RADIUS.lg,
        color: COLORS.text.primary,
        cursor: 'pointer',
        textAlign: 'left',
        flex: 1,
        boxShadow: primary ? `0 4px 12px rgba(34, 197, 94, 0.3)` : 'none',
        transition: `all ${TRANSITIONS.normal}`,
        outline: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        if (!primary) {
          e.currentTarget.style.borderColor = accentColor || COLORS.border.bright;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        if (!primary) {
          e.currentTarget.style.borderColor = borderColor;
        }
      }}
      onFocus={(e) => {
        e.currentTarget.style.boxShadow = `0 0 0 2px ${COLORS.interactive.focus}`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = primary ? `0 4px 12px rgba(34, 197, 94, 0.3)` : 'none';
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: SPACING.sm,
        fontSize: TYPOGRAPHY.size['2xl'],
        fontWeight: TYPOGRAPHY.weight.semibold,
        marginBottom: SPACING.xs,
        color: primary ? COLORS.text.primary : titleColor,
      }}>
        {icon}
        {title}
      </div>
      <div style={{
        fontSize: TYPOGRAPHY.size.lg,
        color: primary ? 'rgba(255,255,255,0.8)' : COLORS.text.muted,
      }}>
        {description}
      </div>
    </button>
  );
}
