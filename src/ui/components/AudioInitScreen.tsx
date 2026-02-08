/**
 * AudioInitScreen - "Click to start audio" screen before audio context starts
 */

export interface AudioInitScreenProps {
  title: string;
  subtitle: string;
  accentColor: string;
  isInitializing: boolean;
  initError?: string | null;
  onStart: () => void;
}

export function AudioInitScreen({
  title,
  subtitle,
  accentColor,
  isInitializing,
  initError,
  onStart,
}: AudioInitScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0f] text-white font-sans">
      <h1
        className="text-[32px] font-light mb-2"
        style={{ color: accentColor }}
      >
        {title}
      </h1>
      <p className="text-[#666] mb-8">{subtitle}</p>
      <button
        onClick={onStart}
        disabled={isInitializing}
        className="px-12 py-4 text-base font-semibold rounded-lg text-white border-none transition-all duration-200"
        style={{
          background: isInitializing
            ? `linear-gradient(145deg, ${accentColor}80, ${accentColor}60)`
            : `linear-gradient(145deg, ${accentColor}, ${accentColor}cc)`,
          boxShadow: isInitializing
            ? `0 4px 12px ${accentColor}26`
            : `0 4px 12px ${accentColor}4d`,
          cursor: isInitializing ? 'wait' : 'pointer',
          opacity: isInitializing ? 0.8 : 1,
        }}
      >
        {isInitializing ? 'Starting Audio...' : 'Start Audio Engine'}
      </button>
      <p className="text-[#444] text-xs mt-4">
        Click to enable audio (browser requirement)
      </p>
      {initError && (
        <div className="mt-6 px-5 py-3 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] rounded-lg text-[#f87171] text-[13px] max-w-[400px] text-center">
          {initError}
        </div>
      )}
    </div>
  );
}
