/**
 * Toast Notification System
 *
 * Provides transient notifications for user feedback.
 *
 * Usage:
 *   // Wrap app with provider
 *   <ToastProvider>
 *     <App />
 *   </ToastProvider>
 *
 *   // Use hook in components
 *   const { toast } = useToast();
 *   toast.success('Preset loaded!');
 *   toast.error('Failed to save');
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, Z_INDEX, TRANSITIONS } from '../theme/index.ts';

// Toast types
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
  createdAt: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
  };
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Generate unique ID
let toastId = 0;
const generateId = () => `toast-${++toastId}-${Date.now()}`;

// Default durations by type
const DEFAULT_DURATIONS: Record<ToastType, number> = {
  success: 3000,
  error: 5000,
  warning: 4000,
  info: 3000,
};

// Icons for each type
const TOAST_ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

// Colors for each type
const TOAST_COLORS: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: {
    bg: `${COLORS.success}15`,
    border: COLORS.success,
    icon: COLORS.success,
  },
  error: {
    bg: `${COLORS.danger}15`,
    border: COLORS.danger,
    icon: COLORS.danger,
  },
  warning: {
    bg: `${COLORS.warning}15`,
    border: COLORS.warning,
    icon: COLORS.warning,
  },
  info: {
    bg: `${COLORS.info}15`,
    border: COLORS.info,
    icon: COLORS.info,
  },
};

/**
 * Toast Provider - wrap your app with this
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string, duration?: number) => {
    const id = generateId();
    const toast: Toast = {
      id,
      type,
      message,
      duration: duration ?? DEFAULT_DURATIONS[type],
      createdAt: Date.now(),
    };

    setToasts((prev) => [...prev, toast]);

    // Auto-remove after duration
    setTimeout(() => {
      removeToast(id);
    }, toast.duration);
  }, [removeToast]);

  // Convenience methods
  const toast = {
    success: (message: string, duration?: number) => addToast('success', message, duration),
    error: (message: string, duration?: number) => addToast('error', message, duration),
    warning: (message: string, duration?: number) => addToast('warning', message, duration),
    info: (message: string, duration?: number) => addToast('info', message, duration),
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, toast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

/**
 * Hook to access toast functions
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

/**
 * Container for all toasts - positioned fixed in top-right
 */
function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: SPACING.lg,
        right: SPACING.lg,
        zIndex: Z_INDEX.toast,
        display: 'flex',
        flexDirection: 'column',
        gap: SPACING.sm,
        pointerEvents: 'none',
      }}
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

/**
 * Individual toast notification
 */
function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const colors = TOAST_COLORS[toast.type];

  // Animate in
  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  // Animate out before removal
  useEffect(() => {
    const timeUntilExit = toast.duration - 300; // Start exit animation 300ms before removal
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, Math.max(0, timeUntilExit));

    return () => clearTimeout(exitTimer);
  }, [toast.duration]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 200);
  };

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: SPACING.md,
        padding: `${SPACING.md}px ${SPACING.lg}px`,
        background: COLORS.bg.secondary,
        border: `1px solid ${colors.border}`,
        borderRadius: RADIUS.md,
        boxShadow: SHADOWS.lg,
        pointerEvents: 'auto',
        minWidth: 280,
        maxWidth: 400,

        // Animation
        opacity: isVisible && !isExiting ? 1 : 0,
        transform: isVisible && !isExiting ? 'translateX(0)' : 'translateX(100%)',
        transition: `all ${TRANSITIONS.normal}`,
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: RADIUS.full,
          background: colors.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: TYPOGRAPHY.size.sm,
          fontWeight: TYPOGRAPHY.weight.bold,
          color: colors.icon,
          flexShrink: 0,
        }}
      >
        {TOAST_ICONS[toast.type]}
      </div>

      {/* Message */}
      <div
        style={{
          flex: 1,
          fontSize: TYPOGRAPHY.size.md,
          color: COLORS.text.primary,
          lineHeight: TYPOGRAPHY.lineHeight.normal,
        }}
      >
        {toast.message}
      </div>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss notification"
        style={{
          background: 'transparent',
          border: 'none',
          padding: SPACING.xs,
          cursor: 'pointer',
          color: COLORS.text.tertiary,
          fontSize: TYPOGRAPHY.size.lg,
          lineHeight: 1,
          borderRadius: RADIUS.sm,
          transition: `color ${TRANSITIONS.fast}`,
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = COLORS.text.primary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = COLORS.text.tertiary;
        }}
      >
        ×
      </button>

      {/* Progress bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          background: COLORS.border.subtle,
          borderRadius: `0 0 ${RADIUS.md}px ${RADIUS.md}px`,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            background: colors.border,
            width: '100%',
            animation: `shrink ${toast.duration}ms linear forwards`,
          }}
        />
      </div>

      {/* Keyframes for progress bar */}
      <style>
        {`
          @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}
      </style>
    </div>
  );
}

/**
 * Standalone toast function for use outside React components
 * Note: Requires ToastProvider to be mounted
 */
let globalAddToast: ((type: ToastType, message: string, duration?: number) => void) | null = null;

export function setGlobalToastHandler(handler: typeof globalAddToast) {
  globalAddToast = handler;
}

export const showToast = {
  success: (message: string, duration?: number) => globalAddToast?.('success', message, duration),
  error: (message: string, duration?: number) => globalAddToast?.('error', message, duration),
  warning: (message: string, duration?: number) => globalAddToast?.('warning', message, duration),
  info: (message: string, duration?: number) => globalAddToast?.('info', message, duration),
};
