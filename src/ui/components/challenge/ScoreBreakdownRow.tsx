/**
 * Single score breakdown row: label left, colored percentage right
 */

import { cn } from '../../utils/cn.ts';

interface ScoreBreakdownRowProps {
  label: string;
  score: number;
}

export function ScoreBreakdownRow({ label, score }: ScoreBreakdownRowProps) {
  return (
    <div className="flex justify-between items-center mb-1">
      <span className="text-text-tertiary text-lg">{label}</span>
      <span
        className={cn(
          'text-lg font-semibold',
          score >= 80 ? 'text-success' : score >= 60 ? 'text-warning' : 'text-danger'
        )}
      >
        {Math.round(score)}%
      </span>
    </div>
  );
}
