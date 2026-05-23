import { Button } from '@/components/ui/button';

function ManeuverLogo() {
  return (
    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--maneuver-accent)]/15 text-4xl font-bold text-[var(--maneuver-accent)]">
      M
    </div>
  );
}

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: () => void;
}

export const WelcomeView = ({
  startButtonText,
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  return (
    <div ref={ref}>
      <section className="bg-background flex flex-col items-center justify-center px-6 text-center">
        <ManeuverLogo />

        <h1 className="text-foreground text-3xl font-bold tracking-tight">Talk to Alex</h1>
        <p className="text-muted-foreground mt-2 max-w-md text-base leading-relaxed">
          Have a voice conversation with Alex, founder of Maneuver — product design and development
          studio. Share your project, ask questions, and see visuals appear as you talk.
        </p>

        <Button
          size="lg"
          onClick={onStartCall}
          className="mt-8 rounded-full px-10 font-semibold"
        >
          {startButtonText}
        </Button>
      </section>

      <div className="fixed bottom-5 left-0 flex w-full items-center justify-center px-4">
        <p className="text-muted-foreground max-w-prose text-center text-xs md:text-sm">
          Powered by LiveKit Agents · Deepgram · Groq · Cartesia
        </p>
      </div>
    </div>
  );
};
