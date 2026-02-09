interface ChallengeButtonProps {
  title: string;
  difficulty: number;
  stars: number;
  completed: boolean;
  onClick: () => void;
}

export function ChallengeButton({ title, difficulty, stars, completed, onClick }: ChallengeButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        background: '#0a0a0a',
        border: '1px solid #222',
        borderRadius: '8px',
        color: '#fff',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <div>
        <div style={{ fontSize: '14px', fontWeight: 500 }}>
          {title}
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          {'★'.repeat(difficulty)}
          {'☆'.repeat(3 - difficulty)}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ color: '#eab308', fontSize: '14px' }}>
          {'★'.repeat(stars)}
          <span style={{ color: '#333' }}>{'★'.repeat(3 - stars)}</span>
        </div>
        {completed && (
          <span style={{ color: '#22c55e', fontSize: '16px' }}>✓</span>
        )}
      </div>
    </button>
  );
}
