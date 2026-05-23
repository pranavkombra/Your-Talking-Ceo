'use client';

import { useCallback, useEffect, useState } from 'react';
import { useMaybeRoomContext } from '@livekit/components-react';
import {
  CASE_STUDIES,
  EMPTY_LEAD,
  PROCESS_STEPS,
  SERVICES,
  type CaseStudy,
  type LeadData,
  type LeadField,
  type ProcessStep,
  type Service,
  type VisualTab,
} from '@/lib/maneuver-data';

export interface ManeuverVisualState {
  activeTab: VisualTab;
  setActiveTab: (tab: VisualTab) => void;
  lead: LeadData;
  services: Service[];
  highlightedService: string | null;
  processSteps: ProcessStep[];
  caseStudies: CaseStudy[];
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

function parseServices(raw: unknown): Service[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  return raw as Service[];
}

function parseProcess(raw: unknown): ProcessStep[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  return raw as ProcessStep[];
}

function parseCaseStudies(raw: unknown): CaseStudy[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  return raw as CaseStudy[];
}

/**
 * Listens for LiveKit RPC calls from the agent and updates visual + lead state.
 */
export function useManeuverRpc(): ManeuverVisualState {
  const room = useMaybeRoomContext();
  const [activeTab, setActiveTab] = useState<VisualTab>('lead');
  const [lead, setLead] = useState<LeadData>({ ...EMPTY_LEAD });
  const [services, setServices] = useState<Service[]>(SERVICES);
  const [highlightedService, setHighlightedService] = useState<string | null>(null);
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>(PROCESS_STEPS);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>(CASE_STUDIES);
  const [rpcError, setRpcError] = useState<string | null>(null);

  const handleRpc = useCallback(async (method: string, rpcInvocation: { payload: string }) => {
    try {
      const payload = JSON.parse(rpcInvocation.payload || '{}') as Record<string, unknown>;

      switch (method) {
        case 'show_services_slide': {
          const next = parseServices(payload.services);
          if (next) setServices(next);
          setHighlightedService(null);
          setActiveTab('services');
          break;
        }
        case 'show_service_detail': {
          const next = parseServices(payload.services);
          if (next) setServices(next);
          setHighlightedService(String(payload.name ?? ''));
          setActiveTab('services');
          break;
        }
        case 'show_process_diagram': {
          const next = parseProcess(payload.process);
          if (next) setProcessSteps(next);
          setActiveTab('process');
          break;
        }
        case 'show_case_studies': {
          const next = parseCaseStudies(payload.case_studies);
          if (next) setCaseStudies(next);
          setActiveTab('case_studies');
          break;
        }
        case 'update_lead_field': {
          const field = String(payload.field ?? '');
          const value = String(payload.value ?? '');
          if (isLeadField(field)) {
            setLead((prev) => ({ ...prev, [field]: value }));
            setActiveTab('lead');
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
      return { method };
    });

    return () => {
      for (const { method } of handlers) {
        room.localParticipant.unregisterRpcMethod(method);
      }
    };
  }, [room, handleRpc]);

  return {
    activeTab,
    setActiveTab,
    lead,
    services,
    highlightedService,
    processSteps,
    caseStudies,
    rpcError,
  };
}
