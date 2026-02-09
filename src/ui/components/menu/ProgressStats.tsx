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
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: isMobile ? '16px' : '24px',
        padding: isMobile ? '16px' : '16px 20px',
        background: '#141414',
        borderRadius: '12px',
        border: '1px solid #2a2a2a',
        marginBottom: '32px',
      }}
    >
      {/* Stars and Progress Row on Mobile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '16px' : '24px', flex: isMobile ? undefined : 'none' }}>
        {/* Stars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#eab308', fontSize: '20px' }}>★</span>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 600 }}>{stars}</div>
            <div style={{ fontSize: '11px', color: '#666' }}>of {maxStars} stars</div>
          </div>
        </div>

        {/* Divider - hide on mobile */}
        {!isMobile && <div style={{ width: '1px', height: '32px', background: '#333' }} />}

        {/* Percentage badge - inline on mobile */}
        {isMobile && (
          <div
            style={{
              marginLeft: 'auto',
              padding: '6px 12px',
              background: percentage === 100 ? '#22c55e' : '#1a1a1a',
              borderRadius: '16px',
              fontSize: '14px',
              fontWeight: 600,
              color: percentage === 100 ? '#000' : '#fff',
            }}
          >
            {percentage}%
          </div>
        )}
      </div>

      {/* Completion */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '13px', color: '#888' }}>Progress</span>
          <span style={{ fontSize: '13px', fontWeight: 500 }}>{completed}/{total} challenges</span>
        </div>
        <div
          style={{
            height: '6px',
            background: '#222',
            borderRadius: '3px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${percentage}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #22c55e, #4ade80)',
              borderRadius: '3px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Percentage badge - desktop only */}
      {!isMobile && (
        <div
          style={{
            padding: '6px 12px',
            background: percentage === 100 ? '#22c55e' : '#1a1a1a',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: 600,
            color: percentage === 100 ? '#000' : '#fff',
          }}
        >
          {percentage}%
        </div>
      )}
    </div>
  );
}
