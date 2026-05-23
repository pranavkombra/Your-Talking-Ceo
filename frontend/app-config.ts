export interface AppConfig {
  pageTitle: string;
  pageDescription: string;
  companyName: string;

  supportsChatInput: boolean;
  supportsVideoInput: boolean;
  supportsScreenShare: boolean;
  isPreConnectBufferEnabled: boolean;

  logo: string;
  startButtonText: string;
  accent?: string;
  logoDark?: string;
  accentDark?: string;

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
}

export const APP_CONFIG_DEFAULTS: AppConfig = {
  companyName: 'Maneuver',
  pageTitle: 'Talk to Founder | Maneuver',
  pageDescription:
    'Voice conversation with Alex, founder of Maneuver — product design and development studio.',

  supportsChatInput: false,
  supportsVideoInput: false,
  supportsScreenShare: false,
  isPreConnectBufferEnabled: false,

  logo: '/maneuver-logo.svg',  // ← CHANGE THIS if you have a logo
  accent: '#6366f1',
  logoDark: '/maneuver-logo-dark.svg',  // ← CHANGE THIS if you have a logo
  accentDark: '#818cf8',
  startButtonText: 'Talk to Alex',  // ← CHANGE THIS (optional)

  // agent dispatch — must match @server.rtc_session(agent_name=...) in agent/main.py
  agentName: 'maneuver-alex',  // ← MAKE SURE THIS MATCHES YOUR AGENT

  sandboxId: undefined,  // ← LEAVE AS undefined (use token server instead)
};