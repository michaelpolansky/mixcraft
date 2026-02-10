import { cn } from '../../utils/cn.ts';
import { CardButton } from '../Button.tsx';

interface SandboxButtonsProps {
  isMobile: boolean;
  continueChallenge: { id: string; title: string } | null;
  onContinue: (challengeId: string) => void;
  onNavigate: (view: string) => void;
}

export function SandboxButtons({ isMobile, continueChallenge, onContinue, onNavigate }: SandboxButtonsProps) {
  return (
    <div className={cn('flex gap-4', isMobile ? 'flex-col mb-8' : 'flex-row mb-12')}>
      {continueChallenge && (
        <CardButton
          onClick={() => onContinue(continueChallenge.id)}
          title="Continue"
          description={continueChallenge.title}
          primary
        />
      )}

      <CardButton
        onClick={() => onNavigate('sandbox')}
        title="Sandbox"
        description="Free play with the synthesizer"
      />

      <CardButton
        onClick={() => onNavigate('fm-sandbox')}
        title="FM Sandbox"
        description="Explore FM synthesis bells & basses"
        accentColor="#ff8800"
      />

      <CardButton
        onClick={() => onNavigate('additive-sandbox')}
        title="Additive Sandbox"
        description="Build sounds from harmonics"
        accentColor="#06b6d4"
      />

      <CardButton
        onClick={() => onNavigate('sampler')}
        title="Sampler Sandbox"
        description="Load and manipulate samples"
        accentColor="#a855f7"
      />

      <CardButton
        onClick={() => onNavigate('drum-sequencer')}
        title="🥁 Drum Sequencer"
        description="Compose rhythms and patterns"
        accentColor="#f97316"
      />
    </div>
  );
}
