interface OnboardingTooltipProps {
  visible: boolean;
  onDismiss: () => void;
}

export function OnboardingTooltip({ visible, onDismiss }: OnboardingTooltipProps) {
  if (!visible) return null;

  return (
    <div className="bg-gradient-to-br from-[#1e3a2f] to-[#14532d] border border-success rounded-lg p-5 mb-4 relative">
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 bg-none border-none text-success-light cursor-pointer text-3xl p-1 leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
      <div className="flex items-start gap-3">
        <span className="text-4xl">🎹</span>
        <div>
          <h3 className="m-0 mb-2 text-2xl font-semibold text-success-light">
            Welcome to MIXCRAFT!
          </h3>
          <p className="m-0 mb-3 text-xl text-[#a7f3d0] leading-relaxed">
            Learn sound design by ear. Each challenge plays a target sound - your goal is to recreate it using the synthesizer controls.
          </p>
          <div className="text-lg text-[#86efac]">
            <strong>How to play:</strong> Listen to the target → Adjust knobs → Compare → Match the sound!
          </div>
        </div>
      </div>
    </div>
  );
}
