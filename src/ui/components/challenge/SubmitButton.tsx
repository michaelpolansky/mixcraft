/**
 * Full-width gradient submit button with loading state
 */

import { cn } from '../../utils/cn.ts';

interface SubmitButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isScoring?: boolean;
  label?: string;
  scoringLabel?: string;
  accentColor?: string;
  accentColorDark?: string;
}

export function SubmitButton({
  onClick,
  disabled = false,
  isScoring = false,
  label = 'Submit',
  scoringLabel = 'Scoring...',
  accentColor = '#22c55e',
  accentColorDark = '#16a34a',
}: SubmitButtonProps) {
  const isDisabled = disabled || isScoring;

  return (
    <div className="mt-auto">
      <button
        onClick={onClick}
        disabled={isDisabled}
        className={cn(
          'w-full py-4 px-8 border-none rounded-md text-text-primary text-2xl font-semibold',
          isDisabled ? 'bg-border-medium cursor-wait' : 'cursor-pointer'
        )}
        style={
          !isDisabled
            ? { background: `linear-gradient(145deg, ${accentColor}, ${accentColorDark})` }
            : undefined
        }
      >
        {isScoring ? scoringLabel : label}
      </button>
    </div>
  );
}
