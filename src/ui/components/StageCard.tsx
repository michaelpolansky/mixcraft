/**
 * StageCard - Module container for synth signal flow stages
 */

import type { ReactNode } from 'react';

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
  const borderRadiusClass =
    noBorderRadius === 'both' ? 'rounded-none' :
    noBorderRadius === 'top' ? 'rounded-b-lg rounded-t-none' :
    noBorderRadius === 'bottom' ? 'rounded-t-lg rounded-b-none' : 'rounded-lg';

  const widthClass = extraWide
    ? 'w-[440px]'
    : wide
      ? 'w-[320px]'
      : 'w-[224px]';

  const paddingClass = compact ? 'p-2' : 'p-3';

  return (
    <div
      className={`bg-[#111] ${borderRadiusClass} ${widthClass} ${paddingClass} self-start overflow-hidden box-border`}
      style={{ border: `1px solid ${color}40` }}
    >
      <div
        className={`text-[11px] font-semibold tracking-wide ${compact ? 'mb-2' : 'mb-3'}`}
        style={{ color }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}
