/** Static content for the Maneuver visual panel */

export interface Service {
  name: string;
  tagline: string;
  description: string;
  icon: string;
}

export interface ProcessStep {
  step: number;
  name: string;
  description: string;
}

export interface CaseStudy {
  title: string;
  metric: string;
  description: string;
}

export const SERVICES: Service[] = [
  {
    name: 'Product Strategy',
    tagline: 'Clarity before code',
    description:
      'Validate ideas, define roadmaps, and align user needs with business goals before you build.',
    icon: '🎯',
  },
  {
    name: 'UX/UI Design',
    tagline: 'Interfaces people love',
    description:
      'Research-driven design — wireframes, polished UI, and design systems that scale.',
    icon: '✨',
  },
  {
    name: 'MVP Development',
    tagline: 'Ship in 6–8 weeks',
    description:
      'Modern engineering to get your minimum viable product in users’ hands fast.',
    icon: '🚀',
  },
  {
    name: 'Growth Consulting',
    tagline: 'Scale what works',
    description:
      'Analytics, onboarding, and growth experiments to turn launches into momentum.',
    icon: '📈',
  },
];

export const PROCESS_STEPS: ProcessStep[] = [
  { step: 1, name: 'Discover', description: 'Research users, market, and constraints' },
  { step: 2, name: 'Define', description: 'Scope, metrics, and product definition' },
  { step: 3, name: 'Design', description: 'UX flows and visual design' },
  { step: 4, name: 'Develop', description: 'Quality engineering with check-ins' },
  { step: 5, name: 'Deploy', description: 'Launch, measure, and hand off' },
];

export const CASE_STUDIES: CaseStudy[] = [
  {
    title: 'Funded startup 0→1',
    metric: '3 startups',
    description: 'Built from strategy through MVP launch — all raised funding.',
  },
  {
    title: 'Enterprise redesign',
    metric: '2 products',
    description: 'Improved usability, cut support tickets, and boosted adoption.',
  },
  {
    title: 'MVP sprint delivery',
    metric: '6–8 weeks',
    description: 'Shipped launch-ready MVPs for founders who needed speed without sacrificing quality.',
  },
];

export const LEAD_FIELDS = ['name', 'company', 'problem', 'timeline', 'budget'] as const;
export type LeadField = (typeof LEAD_FIELDS)[number];

export type LeadData = Record<LeadField, string>;

export const EMPTY_LEAD: LeadData = {
  name: '',
  company: '',
  problem: '',
  timeline: '',
  budget: '',
};

export const LEAD_LABELS: Record<LeadField, string> = {
  name: 'Name',
  company: 'Company',
  problem: 'Problem',
  timeline: 'Timeline',
  budget: 'Budget',
};

export type VisualTab = 'lead' | 'services' | 'process' | 'case_studies';

export const VISUAL_TABS: { id: VisualTab; label: string }[] = [
  { id: 'lead', label: 'Lead Info' },
  { id: 'services', label: 'Services' },
  { id: 'process', label: 'Process' },
  { id: 'case_studies', label: 'Case Studies' },
];
