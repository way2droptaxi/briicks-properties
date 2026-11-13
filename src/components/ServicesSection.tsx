import { useState } from 'react';
import { ArrowUpRight, Layers } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { SERVICES, type ServiceItem } from '../data/briicksData';
import { SafeImage } from './SafeImage';
import { ARCHITECTURAL_EASE, BuiltexSplitHeading, RevealBlock } from './MotionPrimitives';

interface ServicesSectionProps {
  onSelectServiceForQuote: (serviceTitle: string) => void;
  onInspectService: (service: ServiceItem) => void;
}

const FILTER_GROUPS = [
  { id: 'all', label: 'All Services' },
  { id: 'build', label: 'Construction & Turnkey' },
  { id: 'planning', label: 'Planning & Interiors' },
  { id: 'partnerships', label: 'Joint Venture' },
] as const;

type FilterGroup = (typeof FILTER_GROUPS)[number]['id'];

export function ServicesSection({
  onSelectServiceForQuote,
  onInspectService,
}: ServicesSectionProps) {
  const [activeFilter, setActiveFilter] = useState<FilterGroup>('all');

  const filteredServices = SERVICES.filter((service) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'build') {
      return ['new-constructions', 'turnkey-house-construction', 'building-renovations'].includes(
        service.id
      );
    }
    if (activeFilter === 'planning') {
      return ['interior-design-works', 'structural-planning', 'architectural-planning'].includes(
        service.id
      );
    }
    return service.id === 'joint-venture';
  });

  return (
    <section id="services" className="scroll-mt-14 sm:scroll-mt-16 py-14 sm:py-20 lg:py-28 bg-[#F7F7F9] border-y border-[#E6E4EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Heading & Filter Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 sm:gap-6">
          <div className="max-w-xl">
            <RevealBlock yOffset={10}>
              <p className="text-xs font-semibold tracking-widest uppercase text-[#D43F17]">
                Our Services
              </p>
            </RevealBlock>
            <BuiltexSplitHeading
              as="h2"
              segments={[{ text: 'Delivering Comprehensive & Innovative Construction' }]}
              className="mt-2.5 sm:mt-3 font-display font-bold text-[#26232A] tracking-tight leading-tight"
              style={{ fontSize: 'clamp(1.75rem, 3vw, 2.75rem)', textWrap: 'balance' }}
            />
          </div>

          <div className="w-full lg:w-auto overflow-x-auto no-scrollbar">
            <div
              role="tablist"
              aria-label="Filter construction services"
              className="inline-flex items-center gap-1 p-1.5 bg-white border border-[#E6E4EB] rounded-xl min-w-max"
            >
              {FILTER_GROUPS.map((group) => {
                const isSelected = activeFilter === group.id;
                return (
                  <button
                    key={group.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setActiveFilter(group.id)}
                    className={`relative min-h-[40px] px-3.5 py-2 text-xs font-medium rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                      isSelected ? 'text-white' : 'text-[#26232A]/75 hover:text-[#26232A]'
                    }`}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId="service-filter-bg"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                        aria-hidden="true"
                        className="absolute inset-0 rounded-lg bg-[#26232A]"
                      />
                    )}
                    <span className="relative z-10">{group.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Asymmetric Services Grid */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: ARCHITECTURAL_EASE }}
            className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
          >
            {filteredServices.map((service, idx) => {
              const isFeaturedWide = activeFilter === 'all' && (idx === 1 || idx === 6);
              return (
                <motion.article
                  key={service.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  transition={{
                    duration: 0.3,
                    delay: Math.min(idx * 0.04, 0.2),
                    ease: ARCHITECTURAL_EASE,
                  }}
                  className={`group bg-white rounded-2xl border border-[#E6E4EB] overflow-hidden flex flex-col transition-colors duration-150 hover:border-[#D43F17]/50 ${
                    isFeaturedWide ? 'lg:col-span-2' : ''
                  }`}
                >
                  <div
                    data-cursor="View"
                    className={`builtex-shine-frame relative overflow-hidden bg-[#26232A] ${
                      isFeaturedWide ? 'h-48 sm:h-56 lg:h-64' : 'h-44 sm:h-48'
                    }`}
                  >
                    <SafeImage
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-[#19171C]/65 via-transparent to-transparent"
                    />
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white/90">
                      <span className="font-medium tracking-wide">{service.category}</span>
                      <span className="font-display font-bold text-white/85 tabular-nums">
                        {service.number}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display font-bold text-lg sm:text-xl text-[#26232A] tracking-tight">
                        {service.number}. {service.title}
                      </h3>
                      <p className="mt-2 text-sm text-[#26232A]/75 leading-relaxed">
                        {service.shortDesc}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-[#E6E4EB] flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => onInspectService(service)}
                        className="min-h-[44px] px-2 -mx-2 inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#26232A]/80 hover:text-[#D43F17] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Layers className="w-4 h-4" aria-hidden="true" />
                        <span>Scope Details</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectServiceForQuote(service.title)}
                        className="min-h-[44px] px-2 -mx-2 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#D43F17] hover:text-[#B83210] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <span>Request Quote</span>
                        <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
