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
      className="flex justify-between items-center py-3 px-4 bg-bg-primary border border-bg-quaternary rounded-md text-text-primary cursor-pointer text-left"
    >
      <div>
        <div className="text-xl font-medium">{title}</div>
        <div className="text-md text-text-muted">
          {'★'.repeat(difficulty)}
          {'☆'.repeat(3 - difficulty)}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-warning text-xl">
          {'★'.repeat(stars)}
          <span className="text-border-medium">{'★'.repeat(3 - stars)}</span>
        </div>
        {completed && (
          <span className="text-success text-2xl">✓</span>
        )}
      </div>
    </button>
  );
}
