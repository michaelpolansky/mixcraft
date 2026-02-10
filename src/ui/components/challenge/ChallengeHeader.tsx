/**
 * Challenge header with back button, title, description, attempt counter, difficulty stars
 */

interface ChallengeHeaderProps {
  title: string;
  description?: string;
  difficulty: number;
  currentAttempt: number;
  onExit: () => void;
}

export function ChallengeHeader({
  title,
  description,
  difficulty,
  currentAttempt,
  onExit,
}: ChallengeHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px',
      }}
    >
      <div>
        <button
          onClick={onExit}
          style={{
            background: 'none',
            border: 'none',
            color: '#666',
            cursor: 'pointer',
            fontSize: '14px',
            marginBottom: '8px',
            padding: 0,
          }}
        >
          &larr; Back
        </button>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 600,
            margin: 0,
            color: '#fff',
          }}
        >
          {title}
        </h1>
        {description && (
          <p
            style={{
              color: '#888',
              margin: '8px 0 0 0',
              fontSize: '14px',
              maxWidth: '600px',
            }}
          >
            {description}
          </p>
        )}
      </div>

      <div style={{ textAlign: 'right' }}>
        <div style={{ color: '#666', fontSize: '12px' }}>
          Attempt {currentAttempt}
        </div>
        <div style={{ color: '#eab308', fontSize: '18px' }}>
          {'★'.repeat(difficulty)}
          {'☆'.repeat(3 - difficulty)}
        </div>
      </div>
    </div>
  );
}
