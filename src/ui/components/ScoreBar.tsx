/**
 * Visual score indicator bar
 */

import { cn } from '../utils/cn.ts';

interface ScoreBarProps {
  score: number;
  label: string;
  feedback?: string;
}

export function ScoreBar({ score, label, feedback }: ScoreBarProps) {
  const colorClass =
    score >= 80 ? 'text-success' : score >= 60 ? 'text-warning' : 'text-danger';
  const barColorClass =
    score >= 80 ? 'bg-success' : score >= 60 ? 'bg-warning' : 'bg-danger';

  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-md text-text-tertiary capitalize">{label}</span>
        <span className={cn('text-md font-mono', colorClass)}>{score}%</span>
      </div>

      {/* Bar background */}
      <div className="h-2 bg-bg-tertiary rounded-sm overflow-hidden">
        {/* Bar fill */}
        <div
          className={cn('h-full rounded-sm transition-[width] duration-500 ease-out', barColorClass)}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Feedback text */}
      {feedback && (
        <div className="text-base text-text-muted mt-1">{feedback}</div>
      )}
    </div>
  );
}
