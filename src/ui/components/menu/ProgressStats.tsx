import { cn } from '../../utils/cn.ts';

interface ProgressStatsProps {
  completed: number;
  total: number;
  stars: number;
  isMobile: boolean;
}

export function ProgressStats({ completed, total, stars, isMobile }: ProgressStatsProps) {
  if (completed === 0 && stars === 0) return null;

  const maxStars = total * 3;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div
      className={cn(
        'flex gap-6 bg-[#141414] rounded-lg border border-border-default mb-8',
        isMobile ? 'flex-col items-stretch gap-4 p-4' : 'flex-row items-center px-5 py-4'
      )}
    >
      {/* Stars and Progress Row on Mobile */}
      <div className={cn('flex items-center', isMobile ? 'gap-4' : 'gap-6 shrink-0')}>
        {/* Stars */}
        <div className="flex items-center gap-2">
          <span className="text-warning text-[20px]">★</span>
          <div>
            <div className="text-3xl font-semibold">{stars}</div>
            <div className="text-base text-text-muted">of {maxStars} stars</div>
          </div>
        </div>

        {/* Divider - hide on mobile */}
        {!isMobile && <div className="w-px h-8 bg-border-medium" />}

        {/* Percentage badge - inline on mobile */}
        {isMobile && (
          <div
            className={cn(
              'ml-auto py-1.5 px-3 rounded-full text-xl font-semibold',
              percentage === 100 ? 'bg-success text-bg-primary' : 'bg-bg-tertiary text-text-primary'
            )}
          >
            {percentage}%
          </div>
        )}
      </div>

      {/* Completion */}
      <div className="flex-1">
        <div className="flex justify-between mb-1.5">
          <span className="text-lg text-text-tertiary">Progress</span>
          <span className="text-lg font-medium">{completed}/{total} challenges</span>
        </div>
        <div className="h-1.5 bg-bg-quaternary rounded-sm overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-success to-success-light rounded-sm transition-[width] duration-300 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Percentage badge - desktop only */}
      {!isMobile && (
        <div
          className={cn(
            'py-1.5 px-3 rounded-full text-xl font-semibold',
            percentage === 100 ? 'bg-success text-bg-primary' : 'bg-bg-tertiary text-text-primary'
          )}
        >
          {percentage}%
        </div>
      )}
    </div>
  );
}
