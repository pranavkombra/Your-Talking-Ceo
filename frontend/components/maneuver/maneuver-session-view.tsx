'use client';

import { useManeuverRpc } from '@/hooks/useManeuverRpc';
import { TranscriptBar } from '@/components/maneuver/transcript-bar';
import { VisualPanel } from '@/components/maneuver/visual-panel';
import { VoicePanel } from '@/components/maneuver/voice-panel';
import { cn } from '@/lib/shadcn/utils';

interface ManeuverSessionViewProps {
  className?: string;
}

/**
 * Main in-call layout: voice panel (left), visual panel (right), transcript (bottom).
 * RPC from the Python agent drives the visual panel in real time.
 */
export function ManeuverSessionView({ className }: ManeuverSessionViewProps) {
  const { view, lead, rpcError } = useManeuverRpc();

  return (
    <div className={cn('bg-background flex h-svh flex-col', className)}>
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(280px,360px)_1fr]">
        <VoicePanel className="min-h-[320px] lg:min-h-0" />
        <VisualPanel view={view} lead={lead} rpcError={rpcError} className="min-h-[360px] lg:min-h-0" />
      </div>
      <TranscriptBar />
    </div>
  );
}
