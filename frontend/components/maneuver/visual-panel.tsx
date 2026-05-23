'use client';

import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/shadcn/utils';
import {
  CASE_STUDIES,
  LEAD_FIELDS,
  LEAD_LABELS,
  PROCESS_STEPS,
  SERVICES,
  type LeadData,
} from '@/lib/maneuver-data';
import type { VisualView } from '@/hooks/useManeuverRpc';

interface VisualPanelProps {
  view: VisualView;
  lead: LeadData;
  rpcError: string | null;
  className?: string;
}

function ServiceCard({
  service,
  highlighted,
  onClick,
}: {
  service: (typeof SERVICES)[0];
  highlighted?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-2xl border p-5 transition-shadow',
        highlighted
          ? 'border-[var(--maneuver-accent)] bg-[var(--maneuver-accent)]/10 shadow-lg'
          : 'border-border bg-card hover:shadow-md'
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      <span className="text-2xl">{service.icon}</span>
      <h3 className="text-foreground mt-3 text-lg font-semibold">{service.name}</h3>
      <p className="text-[var(--maneuver-accent)] mt-1 text-sm font-medium">{service.tagline}</p>
      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{service.description}</p>
    </motion.div>
  );
}

function LeadPanel({ lead }: { lead: LeadData }) {
  const filledCount = LEAD_FIELDS.filter((f) => lead[f].trim()).length;

  return (
    <div className="rounded-2xl border border-border bg-card/80 p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-foreground text-sm font-semibold tracking-wide uppercase">
          Live lead capture
        </h3>
        <span className="text-muted-foreground text-xs">{filledCount}/5 fields</span>
      </div>
      <div className="space-y-3">
        {LEAD_FIELDS.map((field) => (
          <div key={field} className="grid grid-cols-[88px_1fr] gap-2 text-sm">
            <span className="text-muted-foreground font-medium">{LEAD_LABELS[field]}</span>
            <span
              className={cn(
                'truncate rounded-md px-2 py-0.5 transition-colors',
                lead[field]
                  ? 'bg-[var(--maneuver-accent)]/15 text-foreground'
                  : 'text-muted-foreground italic'
              )}
            >
              {lead[field] || '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function IdleView() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--maneuver-accent)]/15 text-3xl font-bold text-[var(--maneuver-accent)]">
        M
      </div>
      <h2 className="text-foreground text-2xl font-semibold">Maneuver</h2>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed">
        Visuals appear here as Alex talks — services, process, case studies, and your info live.
      </p>
    </div>
  );
}

export function VisualPanel({ view, lead, rpcError, className }: VisualPanelProps) {
  const selectedService =
    view.type === 'service_detail'
      ? SERVICES.find((s) => s.name.toLowerCase() === view.name.toLowerCase()) ??
        SERVICES.find((s) => view.name.toLowerCase().includes(s.name.toLowerCase()))
      : null;

  return (
    <div className={cn('relative flex h-full flex-col overflow-hidden p-6', className)}>
      {rpcError && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          Connection issue: {rpcError}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {view.type === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <IdleView />
            </motion.div>
          )}

          {view.type === 'services' && (
            <motion.div
              key="services"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <h2 className="text-foreground text-xl font-semibold">What we do</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {SERVICES.map((service) => (
                  <ServiceCard key={service.name} service={service} />
                ))}
              </div>
            </motion.div>
          )}

          {view.type === 'service_detail' && selectedService && (
            <motion.div
              key={`detail-${selectedService.name}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mx-auto max-w-lg"
            >
              <p className="text-muted-foreground mb-4 text-sm">Service spotlight</p>
              <ServiceCard service={selectedService} highlighted />
            </motion.div>
          )}

          {view.type === 'process' && (
            <motion.div
              key="process"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <h2 className="text-foreground text-xl font-semibold">How we work</h2>
              <div className="relative flex flex-col gap-4">
                {PROCESS_STEPS.map((step, i) => (
                  <motion.div
                    key={step.name}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--maneuver-accent)] text-sm font-bold text-white">
                      {step.step}
                    </div>
                    <div className="flex-1 rounded-xl border border-border bg-card p-4">
                      <h3 className="text-foreground font-semibold">{step.name}</h3>
                      <p className="text-muted-foreground mt-1 text-sm">{step.description}</p>
                    </div>
                    {i < PROCESS_STEPS.length - 1 && (
                      <div className="absolute left-5 hidden h-full w-px bg-border md:block" style={{ top: `${(i + 1) * 72}px`, height: 32 }} />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {view.type === 'case_studies' && (
            <motion.div
              key="cases"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <h2 className="text-foreground text-xl font-semibold">Results</h2>
              <div className="grid gap-4">
                {CASE_STUDIES.map((study) => (
                  <div
                    key={study.title}
                    className="rounded-2xl border border-border bg-card p-6"
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="text-foreground text-lg font-semibold">{study.title}</h3>
                      <span className="text-[var(--maneuver-accent)] text-2xl font-bold">
                        {study.metric}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm">{study.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 shrink-0">
        <LeadPanel lead={lead} />
      </div>
    </div>
  );
}
