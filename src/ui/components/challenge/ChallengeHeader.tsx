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
    <div className="flex justify-between items-start mb-6">
      <div>
        <button
          onClick={onExit}
          className="bg-none border-none text-text-muted cursor-pointer text-xl mb-2 p-0"
        >
          &larr; Back
        </button>
        <h1 className="text-4xl font-semibold m-0 text-text-primary">
          {title}
        </h1>
        {description && (
          <p className="text-text-tertiary mt-2 mb-0 text-xl max-w-[600px]">
            {description}
          </p>
        )}
      </div>

      <div className="text-right">
        <div className="text-text-muted text-md">
          Attempt {currentAttempt}
        </div>
        <div className="text-warning text-3xl">
          {'★'.repeat(difficulty)}
          {'☆'.repeat(3 - difficulty)}
        </div>
      </div>
    </div>
  );
}
