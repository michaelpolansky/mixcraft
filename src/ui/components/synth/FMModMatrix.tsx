/**
 * FM Modulation Matrix — route-based with 4 slots
 */

import { cn } from '../../utils/cn.ts';
import {
  FM_MOD_SOURCES,
  FM_MOD_DESTINATIONS,
  FM_MOD_SOURCE_LABELS,
  FM_MOD_DEST_LABELS,
  type FMModSource,
  type FMModDestination,
} from '../../../core/types.ts';

interface FMModRoute {
  source: FMModSource;
  destination: FMModDestination;
  amount: number;
  enabled: boolean;
}

interface FMModMatrixProps {
  routes: readonly [FMModRoute, FMModRoute, FMModRoute, FMModRoute];
  onChange: (index: number, route: Partial<FMModRoute>) => void;
  accentColor: string;
}

export function FMModMatrix({ routes, onChange, accentColor }: FMModMatrixProps) {
  return (
    <div className="flex flex-col gap-2">
      {routes.map((route, index) => (
        <FMModRouteRow
          key={index}
          index={index}
          route={route}
          onChange={onChange}
          accentColor={accentColor}
        />
      ))}
    </div>
  );
}

interface FMModRouteRowProps {
  index: number;
  route: FMModRoute;
  onChange: (index: number, route: Partial<FMModRoute>) => void;
  accentColor: string;
}

function FMModRouteRow({ index, route, onChange, accentColor }: FMModRouteRowProps) {
  const isActive = route.enabled && Math.abs(route.amount) > 0.01;

  return (
    <div
      className={cn(
        'flex items-center gap-1 py-1 px-1.5 rounded-sm border',
        isActive ? '' : 'bg-bg-tertiary border-border-medium'
      )}
      style={isActive ? {
        background: `${accentColor}15`,
        borderColor: accentColor,
      } : undefined}
    >
      {/* Enable toggle */}
      <button
        onClick={() => onChange(index, { enabled: !route.enabled })}
        className={cn(
          'w-5 h-5 text-sm font-bold border-none rounded-sm cursor-pointer',
          route.enabled ? 'text-black' : 'bg-border-medium text-text-tertiary'
        )}
        style={route.enabled ? { background: accentColor } : undefined}
      >
        {index + 1}
      </button>

      {/* Source selector */}
      <select
        value={route.source}
        onChange={(e) => onChange(index, { source: e.target.value as FMModSource })}
        disabled={!route.enabled}
        className={cn(
          'py-0.5 px-1 bg-bg-quaternary border border-border-bright rounded-sm text-xs flex-1 min-w-0',
          route.enabled ? 'text-text-primary cursor-pointer' : 'text-text-muted cursor-not-allowed'
        )}
      >
        {FM_MOD_SOURCES.map((src) => (
          <option key={src} value={src}>{FM_MOD_SOURCE_LABELS[src]}</option>
        ))}
      </select>

      {/* Arrow */}
      <span
        className="text-sm"
        style={{ color: route.enabled ? accentColor : '#666' }}
      >
        →
      </span>

      {/* Destination selector */}
      <select
        value={route.destination}
        onChange={(e) => onChange(index, { destination: e.target.value as FMModDestination })}
        disabled={!route.enabled}
        className={cn(
          'py-0.5 px-1 bg-bg-quaternary border border-border-bright rounded-sm text-xs flex-1 min-w-0',
          route.enabled ? 'text-text-primary cursor-pointer' : 'text-text-muted cursor-not-allowed'
        )}
      >
        {FM_MOD_DESTINATIONS.map((dest) => (
          <option key={dest} value={dest}>{FM_MOD_DEST_LABELS[dest]}</option>
        ))}
      </select>

      {/* Amount slider */}
      <div
        className={cn(
          'w-[60px] h-4 bg-bg-quaternary rounded-sm relative overflow-hidden',
          route.enabled ? 'cursor-pointer' : 'cursor-not-allowed'
        )}
        onClick={(e) => {
          if (!route.enabled) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          // Map 0-1 to -1 to +1
          const amount = (x * 2 - 1);
          onChange(index, { amount: Math.round(amount * 100) / 100 });
        }}
      >
        {/* Center line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border-bright" />
        {/* Fill */}
        {route.enabled && (
          <div
            className="absolute top-0.5 bottom-0.5 rounded-sm"
            style={{
              left: route.amount >= 0 ? '50%' : `${(0.5 + route.amount / 2) * 100}%`,
              width: `${Math.abs(route.amount) / 2 * 100}%`,
              background: accentColor,
            }}
          />
        )}
        {/* Value label */}
        <span
          className={cn(
            'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] font-semibold font-mono',
            route.enabled ? 'text-text-primary' : 'text-text-muted'
          )}
        >
          {route.enabled ? `${route.amount >= 0 ? '+' : ''}${Math.round(route.amount * 100)}` : '---'}
        </span>
      </div>
    </div>
  );
}
