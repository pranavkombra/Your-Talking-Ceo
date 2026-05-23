'use client';

import { type AgentState, useAgent } from '@livekit/components-react';
import { AgentAudioVisualizerBar } from '@/components/agents-ui/agent-audio-visualizer-bar';
import { AgentDisconnectButton } from '@/components/agents-ui/agent-disconnect-button';
import { AgentTrackControl } from '@/components/agents-ui/agent-track-control';
import { cn } from '@/lib/shadcn/utils';

const STATE_LABELS: Record<AgentState, string> = {
  disconnected: 'OFFLINE',
  connecting: 'CONNECTING',
  initializing: 'STARTING',
  listening: 'LISTENING',
  thinking: 'THINKING',
  speaking: 'SPEAKING',
  failed: 'ERROR',
};

const STATE_COLORS: Record<AgentState, string> = {
  disconnected: 'bg-muted text-muted-foreground',
  connecting: 'bg-amber-500/20 text-amber-600',
  initializing: 'bg-amber-500/20 text-amber-600',
  listening: 'bg-emerald-500/20 text-emerald-600',
  thinking: 'bg-amber-500/20 text-amber-600',
  speaking: 'bg-[var(--maneuver-accent)]/20 text-[var(--maneuver-accent)]',
  failed: 'bg-destructive/20 text-destructive',
};

interface VoicePanelProps {
  className?: string;
}

export function VoicePanel({ className }: VoicePanelProps) {
  const { state: agentState } = useAgent();

  return (
    <div
      className={cn(
        'flex h-full flex-col items-center justify-between border-r border-border p-6',
        className
      )}
    >
      <div className="w-full text-center">
        <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
          Talk to Founder
        </p>
        <h1 className="text-foreground mt-1 text-2xl font-bold">Alex</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">Founder, Maneuver</p>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div
          className={cn(
            'rounded-full px-4 py-1.5 text-xs font-bold tracking-wider',
            STATE_COLORS[agentState]
          )}
        >
          {STATE_LABELS[agentState]}
        </div>

        <div className="flex h-32 w-full max-w-xs items-center justify-center">
          <AgentAudioVisualizerBar
            barCount={7}
            state={agentState}
            color="#6366f1"
            className="h-full w-full"
          />
        </div>

        <p className="text-muted-foreground max-w-xs text-center text-sm leading-relaxed">
          {agentState === 'listening' && 'Alex is listening — share who you are and what you’re building.'}
          {agentState === 'thinking' && 'Alex is thinking…'}
          {agentState === 'speaking' && 'Alex is speaking — you can interrupt anytime.'}
          {agentState === 'failed' && 'Something went wrong. Try ending and starting a new call.'}
          {(agentState === 'connecting' || agentState === 'initializing') &&
            'Connecting you with Alex…'}
          {agentState === 'disconnected' && 'Not connected'}
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col items-center gap-3">
        <AgentTrackControl kind="audioinput" source="microphone" variant="outline" className="w-full" />
        <AgentDisconnectButton className="w-full">End call</AgentDisconnectButton>
      </div>
    </div>
  );
}
