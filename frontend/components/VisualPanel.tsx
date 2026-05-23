'use client';

import { AnimatePresence, motion } from 'motion/react';
import {
  LEAD_FIELDS,
  LEAD_LABELS,
  VISUAL_TABS,
  type CaseStudy,
  type LeadData,
  type ProcessStep,
  type Service,
  type VisualTab,
} from '@/lib/maneuver-data';
import { cn } from '@/lib/shadcn/utils';

export interface VisualPanelProps {
  activeTab: VisualTab;
  onTabChange: (tab: VisualTab) => void;
  lead: LeadData;
  services: Service[];
  highlightedService?: string | null;
  processSteps: ProcessStep[];
  caseStudies: CaseStudy[];
  rpcError?: string | null;
  className?: string;
}

function LeadTab({ lead }: { lead: LeadData }) {
  const filled = LEAD_FIELDS.filter((f) => lead[f].trim()).length;

  return (
    <motion.div
      key="lead"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Discovery capture
        </p>
        <span className="rounded-full bg-[var(--maneuver-accent)]/15 px-2 py-0.5 text-xs font-semibold text-[var(--maneuver-accent)]">
          {filled}/5
        </span>
      </div>
      <div className="space-y-3">
        {LEAD_FIELDS.map((field, i) => (
          <motion.div
            key={field}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="visual-card rounded-xl border border-border bg-card p-3"
          >
            <p className="text-muted-foreground text-xs font-medium">{LEAD_LABELS[field]}</p>
            <p
              className={cn(
                'mt-1 text-sm font-medium transition-colors',
                lead[field] ? 'text-foreground' : 'text-muted-foreground italic'
              )}
            >
              {lead[field] || 'Waiting…'}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function ServicesTab({
  services,
  highlightedService,
}: {
  services: Service[];
  highlightedService?: string | null;
}) {
  const highlight = highlightedService?.toLowerCase() ?? '';

  return (
    <motion.div
      key="services"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="grid gap-3"
    >
      {services.map((service, i) => {
        const isHighlighted =
          !!highlight &&
          (service.name.toLowerCase().includes(highlight) ||
            highlight.includes(service.name.toLowerCase()));

        return (
        <motion.article
          key={service.name}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          className={cn(
            'service-card visual-card rounded-xl border bg-card p-4',
            isHighlighted
              ? 'border-[var(--maneuver-accent)] bg-[var(--maneuver-accent)]/10 shadow-md ring-2 ring-[var(--maneuver-accent)]/30'
              : 'border-border'
          )}
        >
          <span className="text-xl">{service.icon}</span>
          <h3 className="text-foreground mt-2 text-sm font-semibold">{service.name}</h3>
          <p className="text-[var(--maneuver-accent)] mt-0.5 text-xs font-medium">
            {service.tagline}
          </p>
          <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
            {service.description}
          </p>
        </motion.article>
        );
      })}
    </motion.div>
  );
}

function ProcessTab({ processSteps }: { processSteps: ProcessStep[] }) {
  return (
    <motion.div
      key="process"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="space-y-2"
    >
      {processSteps.map((step, i) => (
        <motion.div
          key={step.name}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.07 }}
          className="visual-card flex items-start gap-3 rounded-xl border border-border bg-card p-3"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--maneuver-accent)] text-xs font-bold text-white">
            {step.step}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-foreground text-sm font-semibold">{step.name}</p>
            <p className="text-muted-foreground mt-1 text-xs">{step.description}</p>
          </div>
        </motion.div>
      ))}
      <p className="text-muted-foreground pt-1 text-center text-[10px] font-medium tracking-widest uppercase">
        Discover → Define → Design → Develop → Deploy
      </p>
    </motion.div>
  );
}

function CaseStudiesTab({ caseStudies }: { caseStudies: CaseStudy[] }) {
  return (
    <motion.div
      key="case_studies"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="space-y-3"
    >
      {caseStudies.map((study, i) => (
        <motion.article
          key={study.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="visual-card rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-foreground text-sm font-semibold leading-snug">{study.title}</h3>
            <span className="shrink-0 text-lg font-bold text-[var(--maneuver-accent)]">
              {study.metric}
            </span>
          </div>
          <p className="text-muted-foreground mt-2 text-xs leading-relaxed">{study.description}</p>
        </motion.article>
      ))}
    </motion.div>
  );
}

/**
 * Tabbed visual panel — driven by LiveKit RPC from the Python agent.
 */
export function VisualPanel({
  activeTab,
  onTabChange,
  lead,
  services,
  highlightedService = null,
  processSteps,
  caseStudies,
  rpcError,
  className,
}: VisualPanelProps) {
  return (
    <aside
      className={cn(
        'visual-panel flex h-full min-h-0 flex-col border-l border-border bg-card/30',
        className
      )}
    >
      <header className="shrink-0 border-b border-border px-3 py-3">
        <p className="text-muted-foreground text-[10px] font-semibold tracking-widest uppercase">
          Maneuver
        </p>
        <h2 className="text-foreground text-sm font-bold">Live visuals</h2>
      </header>

      {rpcError && (
        <div className="mx-3 mt-3 shrink-0 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {rpcError}
        </div>
      )}

      <nav className="visual-tabs flex shrink-0 gap-1 overflow-x-auto border-b border-border px-2 py-2">
        {VISUAL_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'visual-tab shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
              activeTab === tab.id
                ? 'visual-tab-active bg-[var(--maneuver-accent)] text-white shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <AnimatePresence mode="wait">
          {activeTab === 'lead' && <LeadTab lead={lead} />}
          {activeTab === 'services' && (
            <ServicesTab services={services} highlightedService={highlightedService} />
          )}
          {activeTab === 'process' && <ProcessTab processSteps={processSteps} />}
          {activeTab === 'case_studies' && <CaseStudiesTab caseStudies={caseStudies} />}
        </AnimatePresence>
      </div>
    </aside>
  );
}
