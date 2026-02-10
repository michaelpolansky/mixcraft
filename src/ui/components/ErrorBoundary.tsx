import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  /** Custom fallback UI. If omitted, the default error card is shown. */
  fallback?: ReactNode;
  /** Called when "Try Again" is clicked, before clearing the error state. */
  onReset?: () => void;
}

interface State {
  hasError: boolean;
}

/**
 * Catches rendering errors in child components and shows a recovery UI.
 *
 * Usage:
 *   <ErrorBoundary>              — default card with "Try Again"
 *   <ErrorBoundary fallback={…}> — custom full-screen fallback
 *   <ErrorBoundary onReset={…}>  — "Try Again" calls onReset then clears
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.props.onReset?.();
    this.setState({ hasError: false });
  };

  override render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          padding: '32px',
        }}
      >
        <div
          style={{
            background: '#111111',
            border: '1px solid #2a2a2a',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '420px',
            textAlign: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>!</div>
          <h2 style={{ color: '#ffffff', fontSize: '18px', fontWeight: 600, margin: '0 0 8px' }}>
            Something went wrong
          </h2>
          <p style={{ color: '#888888', fontSize: '14px', margin: '0 0 24px', lineHeight: 1.5 }}>
            This view encountered an error. Your progress has been saved.
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: '10px 28px',
              fontSize: '14px',
              background: 'linear-gradient(145deg, #22c55e, #16a34a)',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
}
