'use client';

import { useEffect, useRef } from 'react';
import { useAgent, useSessionContext, useSessionMessages } from '@livekit/components-react';
import { AgentChatIndicator } from '@/components/agents-ui/agent-chat-indicator';
import { cn } from '@/lib/shadcn/utils';

interface TranscriptBarProps {
  className?: string;
}

export function TranscriptBar({ className }: TranscriptBarProps) {
  const session = useSessionContext();
  const { messages } = useSessionMessages(session);
  const { state: agentState } = useAgent();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, agentState]);

  return (
    <div
      className={cn(
        'border-t border-border bg-card/95 backdrop-blur-sm',
        className
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2">
        <span className="text-muted-foreground shrink-0 text-xs font-semibold tracking-wide uppercase">
          Live transcript
        </span>
        <div
          ref={scrollRef}
          className="flex min-h-[2.5rem] flex-1 items-center gap-3 overflow-x-auto whitespace-nowrap py-1"
        >
          {messages.length === 0 && (
            <span className="text-muted-foreground text-sm italic">
              Conversation will appear here…
            </span>
          )}
          {messages.map((msg) => (
            <span
              key={msg.id}
              className={cn(
                'inline-flex shrink-0 rounded-full px-3 py-1 text-sm',
                msg.from?.isLocal
                  ? 'bg-secondary text-secondary-foreground'
                  : 'bg-[var(--maneuver-accent)]/15 text-foreground'
              )}
            >
              <span className="text-muted-foreground mr-1.5 text-xs font-medium">
                {msg.from?.isLocal ? 'You' : 'Alex'}:
              </span>
              {msg.message}
            </span>
          ))}
          {agentState === 'thinking' && (
            <AgentChatIndicator size="sm" />
          )}
        </div>
      </div>
    </div>
  );
}
