/**
 * Standardized Button Component
 *
 * Provides consistent button styling across the app with variants,
 * sizes, loading states, and accessibility features.
 */

import { type ReactNode, type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../utils/cn.ts';

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

// Size class mappings
const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-md',
  lg: 'h-12 px-6 text-lg',
};

const ICON_SIZES: Record<ButtonSize, number> = {
  sm: 14,
  md: 16,
  lg: 18,
};

// Variant class mappings
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-br from-success to-success-light text-bg-primary border-none hover:brightness-110 active:scale-[0.98]',
  secondary: 'bg-bg-tertiary text-text-primary border border-border-medium hover:bg-bg-quaternary active:bg-border-default',
  danger: 'bg-danger text-text-primary border-none hover:bg-[#dc2626] active:bg-[#b91c1c]',
  ghost: 'bg-transparent text-text-secondary border-none hover:bg-interactive-hover active:bg-interactive-active',
  outline: 'bg-transparent border hover:bg-(--btn-accent)/8 active:bg-(--btn-accent)/15',
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
      className="animate-spin"
    >
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
  className,
  style,
  ...props
}, ref) => {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-sans font-medium leading-none whitespace-nowrap rounded-md cursor-pointer outline-none transition-all duration-100 focus:ring-2 focus:ring-interactive-focus',
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
        fullWidth && 'w-full',
        isDisabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
      style={{
        ...(variant === 'outline' && accentColor ? {
          '--btn-accent': accentColor,
          color: accentColor,
          borderColor: accentColor,
        } as React.CSSProperties : {}),
        ...style,
      }}
      {...props}
    >
      {/* Loading spinner replaces left icon */}
      {loading ? (
        <Spinner size={ICON_SIZES[size]} />
      ) : leftIcon ? (
        <span className="flex items-center">
          {leftIcon}
        </span>
      ) : null}

      {/* Button text */}
      <span>{children}</span>

      {/* Right icon (hidden when loading) */}
      {rightIcon && !loading && (
        <span className="flex items-center">
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
  className,
  ...props
}, ref) => {
  const sizeMap: Record<ButtonSize, string> = {
    sm: 'p-0 w-8 min-w-8',
    md: 'p-0 w-10 min-w-10',
    lg: 'p-0 w-12 min-w-12',
  };

  return (
    <Button
      ref={ref}
      size={size}
      className={cn(sizeMap[size], className)}
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
  /** Direction of button layout */
  direction?: 'horizontal' | 'vertical';
}

export function ButtonGroup({
  children,
  direction = 'horizontal',
}: ButtonGroupProps) {
  return (
    <div className={cn('flex gap-2', direction === 'vertical' && 'flex-col')}>
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
      className="bg-bg-tertiary border border-border-medium"
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
  return (
    <button
      onClick={onClick}
      className={cn(
        'py-6 px-8 rounded-lg text-text-primary cursor-pointer text-left flex-1 outline-none transition-all duration-200 hover:-translate-y-0.5 focus:ring-2 focus:ring-interactive-focus',
        primary
          ? 'bg-gradient-to-br from-success to-[#16a34a] border-none shadow-[0_4px_12px_rgba(34,197,94,0.3)]'
          : 'bg-bg-secondary border hover:border-border-bright'
      )}
      style={!primary && accentColor ? {
        '--card-accent': accentColor,
        borderColor: `${accentColor}40`,
      } as React.CSSProperties : undefined}
    >
      <div
        className="flex items-center gap-2 text-2xl font-semibold mb-1"
        style={{ color: primary ? undefined : accentColor }}
      >
        {icon}
        {title}
      </div>
      <div className={cn(
        'text-lg',
        primary ? 'text-white/80' : 'text-text-muted'
      )}>
        {description}
      </div>
    </button>
  );
}
