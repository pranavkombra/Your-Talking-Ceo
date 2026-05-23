import { headers } from 'next/headers';
import { App } from '@/components/app/app';
import { getAppConfig } from '@/lib/utils';
import type { VisualPanelProps } from '@/components/VisualPanel';

/**
 * Main page. In-call layout: 70% voice (left) + 30% VisualPanel (right).
 * @see components/VisualPanel.tsx
 * @see components/maneuver/maneuver-session-view.tsx
 */
export type { VisualPanelProps };

export default async function Page() {
  const hdrs = await headers();
  const appConfig = await getAppConfig(hdrs);

  return <App appConfig={appConfig} />;
}
