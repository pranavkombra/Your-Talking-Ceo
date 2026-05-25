import { ReactNode, useEffect } from 'react';
import { toast as sonnerToast } from 'sonner';
import { useAgent, useSessionContext } from '@livekit/components-react';
import { WarningIcon } from '@phosphor-icons/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ToastProps {
  title: ReactNode;
  description: ReactNode;
}

function toastAlert(toast: ToastProps) {
  const { title, description } = toast;

  return sonnerToast.custom(
    (id) => (
      <Alert onClick={() => sonnerToast.dismiss(id)} className="bg-accent w-full md:w-[364px]">
        <WarningIcon weight="bold" />
        <AlertTitle>{title}</AlertTitle>
        {description && <AlertDescription>{description}</AlertDescription>}
      </Alert>
    ),
    { duration: 10_000 }
  );
}

export function useAgentErrors() {
  const agent = useAgent();
  const { isConnected, end } = useSessionContext();

  // Log connection errors
  useEffect(() => {
    const handleError = (event: ErrorEvent | Event) => {
      const error = event instanceof ErrorEvent ? event.error : new Error(String(event));
      const message = error?.message || String(error);
      
      console.error('[Connection Error]', message);
      
      if (message.includes('Failed to fetch') || message.includes('serverUnreachable')) {
        console.error('[Connection Diagnostic]', {
          timestamp: new Date().toISOString(),
          error: message,
          suggestions: [
            '1. Check if /api/token endpoint is returning 200',
            '2. Verify LIVEKIT_URL is defined in frontend/.env.local',
            '3. Restart frontend dev server after adding .env.local',
            '4. Check browser DevTools Network tab for /api/token request',
            '5. Ensure LiveKit server URL is accessible from your browser',
          ],
        });
        
        toastAlert({
          title: 'Connection Failed',
          description: (
            <div className="space-y-2">
              <p>Could not establish connection to LiveKit server.</p>
              <p className="text-xs opacity-75">Check browser console for diagnostics.</p>
            </div>
          ),
        });
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  useEffect(() => {
    if (isConnected && agent.state === 'failed') {
      const reasons = agent.failureReasons;

      toastAlert({
        title: 'Session ended',
        description: (
          <>
            {reasons.length > 1 && (
              <ul className="list-inside list-disc">
                {reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            )}
            {reasons.length === 1 && <p className="w-full">{reasons[0]}</p>}
            <p className="w-full">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://docs.livekit.io/agents/start/voice-ai/"
                className="whitespace-nowrap underline"
              >
                See quickstart guide
              </a>
              .
            </p>
          </>
        ),
      });

      end();
    }
  }, [agent, isConnected, end]);
}
