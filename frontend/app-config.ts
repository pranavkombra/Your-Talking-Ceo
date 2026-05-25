export interface CompanyInfo {
  name: string;
  tagline: string;
  description: string;
  location: string;
  phone: string;
  email: string;
  website: string;
  linkedin: string;
  bookACall: string;
  builtByLeaders: string[];
  stats: {
    countries: number;
    projects: number;
    industries: number;
    retention: string;
  };
}

export interface CeoInfo {
  name: string;
  title: string;
  bio: string;
  photo?: string;
  linkedin: string;
}

export interface AppConfig {
  pageTitle: string;
  pageDescription: string;
  companyName: string;
  companyInfo?: CompanyInfo;
  ceoInfo?: CeoInfo;

  supportsChatInput: boolean;
  supportsVideoInput: boolean;
  supportsScreenShare: boolean;
  isPreConnectBufferEnabled: boolean;

  logo: string;
  startButtonText: string;
  accent?: string;
  logoDark?: string;
  accentDark?: string;
  backgroundColor?: string;

  audioVisualizerType?: 'bar' | 'wave' | 'grid' | 'radial' | 'aura';
  audioVisualizerColor?: `#${string}`;
  audioVisualizerColorDark?: `#${string}`;
  audioVisualizerColorShift?: number;
  audioVisualizerBarCount?: number;
  audioVisualizerGridRowCount?: number;
  audioVisualizerGridColumnCount?: number;
  audioVisualizerRadialBarCount?: number;
  audioVisualizerRadialRadius?: number;
  audioVisualizerWaveLineWidth?: number;

  // agent dispatch configuration
  agentName?: string;

  // LiveKit Cloud Sandbox configuration
  sandboxId?: string;

  // services
  services?: string[];
}

const MANEUVER_COMPANY_INFO: CompanyInfo = {
  name: 'Maneuver',
  tagline: 'Fortune 500 AI thinking. Built for SMBs.',
  description:
    'We help non-technical founders deploy AI the way Fortune 500s do — without the Fortune 500 price tag or timeline. Strategy, automation, and Voice AI in the UAE.',
  location: 'Business Center, Sharjah Media City, Sharjah, UAE',
  phone: '+971 58 284 9985',
  email: 'husain@maneuver.ae',
  website: 'maneuver.ae',
  linkedin: 'https://www.linkedin.com/company/maneuver-hq',
  bookACall: 'https://calendly.com/husain-maneuver/30min',
  builtByLeaders: ['JP Morgan', 'Deloitte', 'Vanguard', 'Think41'],
  stats: {
    countries: 6,
    projects: 10,
    industries: 5,
    retention: '100%',
  },
};

const MANEUVER_CEO_INFO: CeoInfo = {
  name: 'Husain Topiwala',
  title: 'Founder & CEO',
  bio: 'Enterprise AI strategist with roots in JP Morgan, Deloitte, and Vanguard — now helping SMBs in the UAE deploy AI that actually works.',
  photo: undefined, // Set via NEXT_PUBLIC_CEO_PHOTO_URL in .env.local
  linkedin: 'https://www.linkedin.com/in/husaintopiwala',
};

const MANEUVER_SERVICES = [
  'Intelligent Workflows',
  'Voice AI (Arabic + English, 24/7)',
  'Self-Learning AI Agents',
  'Bespoke Applications',
  'Systems Integration',
];

export const APP_CONFIG_DEFAULTS: AppConfig = {
  companyName: 'Maneuver',
  pageTitle: 'Voice AI for SMBs | Maneuver',
  pageDescription:
    'Deploy Fortune 500 AI strategy without the Fortune 500 price tag. Meet Alex, our AI assistant available 24/7.',
  companyInfo: MANEUVER_COMPANY_INFO,
  ceoInfo: MANEUVER_CEO_INFO,
  supportsChatInput: true,
  supportsVideoInput: false,
  supportsScreenShare: false,
  isPreConnectBufferEnabled: true,
  logo: '/maneuver-logo.svg',
  accent: '#c8a96e',
  logoDark: '/maneuver-logo-dark.svg',
  accentDark: '#d4af7a',
  backgroundColor: '#0a0a0a',
  startButtonText: 'Talk to Alex',
  audioVisualizerType: 'bar',
  audioVisualizerBarCount: 8,
  audioVisualizerColor: '#c8a96e',
  agentName: 'maneuver-alex',
  services: MANEUVER_SERVICES,
  sandboxId: undefined,
};