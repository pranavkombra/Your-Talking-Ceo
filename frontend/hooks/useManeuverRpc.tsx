'use client';

import { useCallback, useEffect, useState } from 'react';
import { useMaybeRoomContext } from '@livekit/components-react';
import {
  EMPTY_LEAD,
  type LeadData,
  type LeadField,
} from '@/lib/maneuver-data';

export type VisualView =
  | { type: 'idle' }
  | { type: 'services' }
  | { type: 'service_detail'; name: string }
  | { type: 'process' }
  | { type: 'case_studies' };

export interface ManeuverVisualState {
  view: VisualView;
  lead: LeadData;
  rpcError: string | null;
}

const RPC_METHODS = [
  'show_services_slide',
  'show_service_detail',
  'show_process_diagram',
  'show_case_studies',
  'update_lead_field',
] as const;

function isLeadField(field: string): field is LeadField {
  return field in EMPTY_LEAD;
}

/**
 * Listens for LiveKit RPC calls from the agent and updates visual + lead state.
 */
export function useManeuverRpc(): ManeuverVisualState {
  const room = useMaybeRoomContext();
  const [view, setView] = useState<VisualView>({ type: 'idle' });
  const [lead, setLead] = useState<LeadData>({ ...EMPTY_LEAD });
  const [rpcError, setRpcError] = useState<string | null>(null);

  const handleRpc = useCallback(async (method: string, rpcInvocation: { payload: string }) => {
    try {
      const payload = JSON.parse(rpcInvocation.payload || '{}') as Record<string, string>;

      switch (method) {
        case 'show_services_slide':
          setView({ type: 'services' });
          break;
        case 'show_service_detail':
          setView({ type: 'service_detail', name: payload.name ?? 'Product Strategy' });
          break;
        case 'show_process_diagram':
          setView({ type: 'process' });
          break;
        case 'show_case_studies':
          setView({ type: 'case_studies' });
          break;
        case 'update_lead_field': {
          const field = payload.field ?? '';
          const value = payload.value ?? '';
          if (isLeadField(field)) {
            setLead((prev) => ({ ...prev, [field]: value }));
          }
          break;
        }
        default:
          return `Unknown method: ${method}`;
      }

      setRpcError(null);
      return 'ok';
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setRpcError(message);
      return `error: ${message}`;
    }
  }, []);

  useEffect(() => {
    if (!room?.localParticipant) return;

    const handlers = RPC_METHODS.map((method) => {
      const handler = (invocation: { payload: string }) => handleRpc(method, invocation);
      room.localParticipant.registerRpcMethod(method, handler);
      return { method, handler };
    });

    return () => {
      for (const { method } of handlers) {
        room.localParticipant.unregisterRpcMethod(method);
      }
    };
  }, [room, handleRpc]);

  return { view, lead, rpcError };
}
