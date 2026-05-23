'use client';

import { VisualPanel } from '@/components/VisualPanel';
import { useManeuverRpc } from '@/hooks/useManeuverRpc';
import { TranscriptBar } from '@/components/maneuver/transcript-bar';
import { VoicePanel } from '@/components/maneuver/voice-panel';
import { cn } from '@/lib/shadcn/utils';

interface ManeuverSessionViewProps {
  className?: string;
}

/**
 * In-call layout: voice UI 70% (left) + VisualPanel 30% (right).
 * RPC from the Python agent updates the visual panel in real time.
 */
export function ManeuverSessionView({ className }: ManeuverSessionViewProps) {
  const {
    activeTab,
    setActiveTab,
    lead,
    services,
    highlightedService,
    processSteps,
    caseStudies,
    rpcError,
  } = useManeuverRpc();

  return (
    <div className={cn('bg-background flex h-svh flex-col', className)}>
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {/* Voice column — 70% */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col md:w-[70%] md:flex-none md:basis-[70%]">
          <VoicePanel className="min-h-[280px] flex-1 border-r-0 md:border-r md:border-border" />
        </div>

        {/* Visual column — 30% */}
        <VisualPanel
          activeTab={activeTab}
          onTabChange={setActiveTab}
          lead={lead}
          services={services}
          highlightedService={highlightedService}
          processSteps={processSteps}
          caseStudies={caseStudies}
          rpcError={rpcError}
          className="min-h-[320px] w-full md:w-[30%] md:min-w-[280px] md:flex-none md:basis-[30%]"
        />
      </div>

      <TranscriptBar />
    </div>
  );
}
