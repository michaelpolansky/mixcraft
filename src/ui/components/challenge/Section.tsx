/**
 * Section wrapper component for consistent card styling across challenge views
 */

interface SectionProps {
  title?: string;
  children: React.ReactNode;
}

export function Section({ title, children }: SectionProps) {
  return (
    <div className="bg-[#141414] rounded-lg p-4 border border-border-default">
      {title && (
        <h3 className="m-0 mb-3 text-base font-semibold text-text-muted uppercase tracking-wider">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
