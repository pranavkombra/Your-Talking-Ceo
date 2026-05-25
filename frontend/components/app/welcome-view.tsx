'use client';

import { Button } from '@/components/ui/button';
import type { AppConfig, CompanyInfo, CeoInfo } from '@/app-config';

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: () => void;
  appConfig?: AppConfig;
}

function ManeuverLogo() {
  return (
    <div className="mb-8 flex items-center justify-center">
      <h1 className="font-serif text-4xl font-bold text-accent md:text-5xl">
        Maneuver
      </h1>
    </div>
  );
}

function HeroSection({ appConfig }: { appConfig?: AppConfig }) {
  const info = appConfig?.companyInfo;
  if (!info) return null;

  return (
    <div className="mb-12 text-center">
      <p className="mb-4 text-lg font-semibold text-accent md:text-xl">
        {info.tagline}
      </p>
      <p className="text-foreground mx-auto max-w-2xl text-sm leading-relaxed md:text-base">
        {info.description}
      </p>
    </div>
  );
}

function VoiceAgentSection({
  startButtonText,
  onStartCall,
}: {
  startButtonText: string;
  onStartCall: () => void;
}) {
  return (
    <div className="mb-12 rounded-lg border border-accent/20 bg-card p-8 text-center">
      <h2 className="font-serif mb-4 text-2xl font-bold text-foreground">
        Meet Alex
      </h2>
      <p className="text-muted-foreground mb-6 text-sm leading-relaxed md:text-base">
        AI assistant available 24/7 in English and Arabic. Ask about our
        services or how we can help your business deploy AI.
      </p>
      <Button
        size="lg"
        onClick={onStartCall}
        className="rounded-full bg-accent font-serif text-sm font-bold text-accent-foreground hover:bg-accent/90"
      >
        {startButtonText}
      </Button>
    </div>
  );
}

function ServicesSection({ services }: { services?: string[] }) {
  if (!services || services.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="font-serif mb-6 text-center text-2xl font-bold text-foreground">
        Our Services
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <div
            key={service}
            className="rounded-lg border border-accent/20 bg-card p-4"
          >
            <p className="text-foreground text-sm font-medium">{service}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CeoSection({ ceoInfo }: { ceoInfo?: CeoInfo }) {
  if (!ceoInfo) return null;

  // NEXT_PUBLIC_ variables are available in the browser
  const ceoPhoto = (process.env as any).NEXT_PUBLIC_CEO_PHOTO_URL;

  return (
    <div className="mb-12 rounded-lg border border-accent/20 bg-card p-8">
      <div className="flex flex-col items-center text-center md:flex-row md:text-left">
        {ceoPhoto && (
          <div className="mb-6 md:mb-0 md:mr-8">
            <img
              src={ceoPhoto}
              alt={ceoInfo.name}
              className="h-32 w-32 rounded-lg object-cover"
            />
          </div>
        )}
        <div>
          <h3 className="font-serif mb-1 text-xl font-bold text-foreground">
            {ceoInfo.name}
          </h3>
          <p className="text-accent mb-3 text-sm font-semibold">
            {ceoInfo.title}
          </p>
          <p className="text-foreground mb-4 text-sm leading-relaxed">
            {ceoInfo.bio}
          </p>
          {ceoInfo.linkedin && (
            <a
              href={ceoInfo.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline text-sm font-medium"
            >
              Connect on LinkedIn →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function CompanyFooter({ info }: { info?: CompanyInfo }) {
  if (!info) return null;

  return (
    <div className="border-t border-accent/20 pt-8 text-center text-sm">
      <div className="text-foreground mb-4 space-y-1">
        <p>
          <span className="text-accent">📍</span> {info.location}
        </p>
        <p>
          <span className="text-accent">📞</span>
          <a
            href={`tel:${info.phone}`}
            className="ml-2 hover:underline"
          >
            {info.phone}
          </a>
        </p>
        <p>
          <span className="text-accent">✉️</span>
          <a
            href={`mailto:${info.email}`}
            className="ml-2 hover:underline"
          >
            {info.email}
          </a>
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
        {info.website && (
          <a
            href={`https://${info.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline font-medium"
          >
            Website
          </a>
        )}
        {info.linkedin && (
          <a
            href={info.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline font-medium"
          >
            LinkedIn
          </a>
        )}
        {info.bookACall && (
          <a
            href={info.bookACall}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline font-medium"
          >
            Book a Call
          </a>
        )}
      </div>
      {info.builtByLeaders && info.builtByLeaders.length > 0 && (
        <p className="text-muted-foreground mb-3 text-xs">
          Built by leaders from: {info.builtByLeaders.join(' · ')}
        </p>
      )}
      {(info.stats?.countries || info.stats?.projects) && (
        <p className="text-muted-foreground text-xs">
          {info.stats.countries}+ Countries · {info.stats.projects}+ Projects ·
          {info.stats.industries}+ Industries · {info.stats.retention} Retention
        </p>
      )}
    </div>
  );
}

export const WelcomeView = ({
  startButtonText,
  onStartCall,
  appConfig,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  return (
    <div ref={ref} className="bg-background min-h-screen flex flex-col">
      <section className="flex flex-col items-center justify-center flex-1 px-4 py-8">
        <div className="w-full max-w-3xl">
          <ManeuverLogo />
          <HeroSection appConfig={appConfig} />
          <VoiceAgentSection
            startButtonText={startButtonText}
            onStartCall={onStartCall}
          />
          <ServicesSection services={appConfig?.services} />
          <CeoSection ceoInfo={appConfig?.ceoInfo} />
          <CompanyFooter info={appConfig?.companyInfo} />
        </div>
      </section>

      <div className="flex w-full items-center justify-center border-t border-accent/20 px-4 py-4">
        <p className="text-muted-foreground max-w-prose text-xs leading-5 font-normal text-pretty md:text-sm">
          Questions? Contact us at{' '}
          <a
            href="mailto:husain@maneuver.ae"
            className="text-accent hover:underline"
          >
            husain@maneuver.ae
          </a>
        </p>
      </div>
    </div>
  );
};

