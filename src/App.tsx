import { useEffect, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { StatsCounterSection } from './components/StatsCounterSection';
import { ServicesSection } from './components/ServicesSection';
import { EstimatorFeaturesSection } from './components/EstimatorFeaturesSection';
import { ProjectsWhySection } from './components/ProjectsWhySection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { ContactFooterSection } from './components/ContactFooterSection';
import { WalkthroughModal } from './components/WalkthroughModal';
import { ConstructionChatbot } from './components/ConstructionChatbot';
import { ScrollProgressBar } from './components/MotionPrimitives';
import { ArchitecturalCursor } from './components/ArchitecturalCursor';
import type { ServiceItem } from './data/briicksData';

export default function App() {
  const [preselectedService, setPreselectedService] = useState<string>('New Construction');
  const [prefilledMessage, setPrefilledMessage] = useState<string>('');
  const [modalMode, setModalMode] = useState<'walkthrough' | 'service' | null>(null);
  const [inspectedService, setInspectedService] = useState<ServiceItem | null>(null);
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

  useEffect(() => {
    const onQuotaExceeded = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuotaExceeded);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRequestQuote = (serviceTitle?: string) => {
    if (serviceTitle) {
      const normalized =
        serviceTitle === 'New Constructions' ? 'New Construction' : serviceTitle;
      setPreselectedService(normalized);
    }
    scrollToSection('contact');
  };

  const handleApplyEstimateToQuote = (summaryText: string, suggestedService: string) => {
    setPreselectedService(suggestedService);
    setPrefilledMessage(summaryText);
    scrollToSection('contact');
  };

  const handleSelectLocationForQuote = (locationSummary: string) => {
    setPrefilledMessage(locationSummary);
    scrollToSection('contact');
  };

  const handleInspectService = (service: ServiceItem) => {
    setInspectedService(service);
    setModalMode('service');
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen flex flex-col bg-white text-[#26232A]">
        {mapsQuotaExceeded && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
            <span>
              Google Maps Platform quota reached. If you are the app owner, visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-950 hover:text-amber-800"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
          </div>
        )}

        <ArchitecturalCursor />
        <ScrollProgressBar />
        <Navbar onBookAppointment={() => handleRequestQuote()} />

        <main className="flex-1">
          <HeroSection
            onRequestQuote={() => handleRequestQuote()}
            onOpenWalkthrough={() => {
              setInspectedService(null);
              setModalMode('walkthrough');
            }}
          />

          <AboutSection onExploreServices={() => scrollToSection('services')} />

          <StatsCounterSection />

          <ServicesSection
            onSelectServiceForQuote={(title) => handleRequestQuote(title)}
            onInspectService={handleInspectService}
          />

          <EstimatorFeaturesSection onApplyEstimateToQuote={handleApplyEstimateToQuote} />

          <ProjectsWhySection onStartProject={() => handleRequestQuote()} />

          <TestimonialsSection />

          <ContactFooterSection
            preselectedService={preselectedService}
            prefilledMessage={prefilledMessage}
            onSelectLocationForQuote={handleSelectLocationForQuote}
          />
        </main>

        <WalkthroughModal
          mode={modalMode}
          service={inspectedService}
          onClose={() => setModalMode(null)}
          onRequestQuote={handleRequestQuote}
        />

        <ConstructionChatbot onBookConsultation={() => handleRequestQuote()} />
      </div>
    </MotionConfig>
  );
}
