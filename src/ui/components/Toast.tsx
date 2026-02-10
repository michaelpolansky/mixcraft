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
import { cn } from '../utils/cn.ts';

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
  success: '\u2713',
  error: '\u2715',
  warning: '\u26A0',
  info: '\u2139',
};

// Colors for each type (kept as raw values for dynamic styling)
const TOAST_COLORS: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: {
    bg: 'rgba(34, 197, 94, 0.08)',
    border: '#22c55e',
    icon: '#22c55e',
  },
  error: {
    bg: 'rgba(239, 68, 68, 0.08)',
    border: '#ef4444',
    icon: '#ef4444',
  },
  warning: {
    bg: 'rgba(234, 179, 8, 0.08)',
    border: '#eab308',
    icon: '#eab308',
  },
  info: {
    bg: 'rgba(59, 130, 246, 0.08)',
    border: '#3b82f6',
    icon: '#3b82f6',
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
      className="fixed top-4 right-4 z-[80] flex flex-col gap-2 pointer-events-none"
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
      className={cn(
        'flex items-center gap-3 py-3 px-4 bg-bg-secondary rounded-lg shadow-lg pointer-events-auto min-w-[280px] max-w-[400px] transition-all duration-200 relative',
        isVisible && !isExiting
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 translate-x-full'
      )}
      style={{ border: `1px solid ${colors.border}` }}
    >
      {/* Icon */}
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
        style={{ background: colors.bg, color: colors.icon }}
      >
        {TOAST_ICONS[toast.type]}
      </div>

      {/* Message */}
      <div className="flex-1 text-md text-text-primary leading-normal">
        {toast.message}
      </div>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss notification"
        className="bg-transparent border-none p-1 cursor-pointer text-text-tertiary text-lg leading-none rounded-sm shrink-0 hover:text-text-primary transition-colors duration-100"
      >
        ×
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-border-subtle rounded-b-lg overflow-hidden">
        <div
          className="h-full w-full"
          style={{
            background: colors.border,
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
