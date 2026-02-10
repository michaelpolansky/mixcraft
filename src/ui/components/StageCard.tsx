/**
 * StageCard - Module container for synth signal flow stages
 */

import type { ReactNode } from 'react';
import { cn } from '../utils/cn.ts';

export interface StageCardProps {
  title: string;
  color: string;
  wide?: boolean;
  extraWide?: boolean;
  compact?: boolean;
  noBorderRadius?: 'top' | 'bottom' | 'both';
  children: ReactNode;
}

export function StageCard({
  title,
  color,
  wide = false,
  extraWide = false,
  compact = false,
  noBorderRadius,
  children,
}: StageCardProps) {
  return (
    <div
      className={cn(
        'bg-bg-secondary self-start overflow-hidden box-border border border-(--stage-color)/25',
        noBorderRadius === 'both' ? 'rounded-none' :
        noBorderRadius === 'top' ? 'rounded-b-lg rounded-t-none' :
        noBorderRadius === 'bottom' ? 'rounded-t-lg rounded-b-none' : 'rounded-lg',
        extraWide ? 'w-[440px]' : wide ? 'w-[320px]' : 'w-[224px]',
        compact ? 'p-2' : 'p-3',
      )}
      style={{ '--stage-color': color } as React.CSSProperties}
    >
      <div
        className={cn(
          'text-base font-semibold tracking-wide text-(--stage-color)',
          compact ? 'mb-2' : 'mb-3'
        )}
      >
        {title}
      </div>
      {children}
    </div>
  );
}
