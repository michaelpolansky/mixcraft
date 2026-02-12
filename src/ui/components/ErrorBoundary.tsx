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
      <div className="flex items-center justify-center min-h-[60vh] p-8">
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-8 max-w-[420px] text-center font-sans">
          <div className="text-[32px] mb-3">!</div>
          <h2 className="text-white text-lg font-semibold m-0 mb-2">
            Something went wrong
          </h2>
          <p className="text-[#888888] text-sm m-0 mb-6 leading-normal">
            This view encountered an error. Your progress has been saved.
          </p>
          <button
            onClick={this.handleReset}
            className="py-2.5 px-7 text-sm bg-gradient-to-br from-success to-[#16a34a] border-none rounded-lg text-white cursor-pointer font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
}
