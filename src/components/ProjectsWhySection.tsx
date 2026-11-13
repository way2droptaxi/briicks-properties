import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { PROJECTS, WHY_CHOOSE_POINTS } from '../data/briicksData';
import { SafeImage } from './SafeImage';
import {
  ARCHITECTURAL_EASE,
  BuiltexButton,
  BuiltexImageReveal,
  BuiltexSplitHeading,
  RevealBlock,
} from './MotionPrimitives';

interface ProjectsWhySectionProps {
  onStartProject: () => void;
}

const CATEGORIES = ['All', 'Residential', 'Turnkey & Interiors', 'Commercial'] as const;
type CategoryFilter = (typeof CATEGORIES)[number];

export function ProjectsWhySection({ onStartProject }: ProjectsWhySectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');

  const visibleProjects =
    selectedCategory === 'All'
      ? PROJECTS
      : PROJECTS.filter((project) => project.category === selectedCategory);

  return (
    <section id="projects" className="scroll-mt-14 sm:scroll-mt-16 py-14 sm:py-20 lg:py-28 bg-[#19171C] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Projects Header & Category Filter */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 sm:gap-6">
          <div className="max-w-2xl">
            <RevealBlock yOffset={10}>
              <p className="text-xs font-semibold tracking-widest uppercase text-[#F05228]">
                Landmark Portfolio
              </p>
            </RevealBlock>
            <BuiltexSplitHeading
              as="h2"
              segments={[{ text: 'Creating Landmark Projects With Superior Quality' }]}
              className="mt-2.5 sm:mt-3 font-display font-bold text-white tracking-tight leading-tight"
              style={{ fontSize: 'clamp(1.75rem, 3vw, 2.75rem)', textWrap: 'balance' }}
            />
          </div>

          <div className="w-full lg:w-auto overflow-x-auto no-scrollbar">
            <div
              role="tablist"
              aria-label="Filter completed projects"
              className="inline-flex items-center gap-1.5 p-1.5 bg-[#26232A] border border-white/12 rounded-xl min-w-max"
            >
              {CATEGORIES.map((category) => {
                const active = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSelectedCategory(category)}
                    className={`relative min-h-[40px] px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                      active ? 'text-white' : 'text-white/75 hover:text-white'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="project-filter-bg"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                        aria-hidden="true"
                        className="absolute inset-0 rounded-lg bg-[#D43F17]"
                      />
                    )}
                    <span className="relative z-10">{category}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Completed Projects Grid */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: ARCHITECTURAL_EASE }}
            className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6"
          >
            {visibleProjects.map((project, idx) => (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                transition={{
                  duration: 0.3,
                  delay: Math.min(idx * 0.05, 0.2),
                  ease: ARCHITECTURAL_EASE,
                }}
                className="group bg-[#26232A] rounded-2xl border border-white/12 overflow-hidden flex flex-col hover:border-white/25 transition-colors"
              >
                <BuiltexImageReveal dataCursor="View" className="relative h-52 sm:h-64 bg-[#19171C]">
                  <SafeImage
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[#19171C]/75 via-transparent to-transparent"
                  />
                </BuiltexImageReveal>

                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Zero-pill unboxed metadata with typographic separators */}
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium text-white/70 tabular-nums">
                      <span className="text-[#F05228]">{project.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{project.location}</span>
                      <span aria-hidden="true">·</span>
                      <span>{project.areaSqFt.toLocaleString('en-IN')} sq.ft</span>
                      <span aria-hidden="true">·</span>
                      <span>{project.durationMonths} Months</span>
                    </div>

                    <h3 className="mt-2 font-display font-bold text-lg sm:text-xl text-white tracking-tight">
                      {project.title}
                    </h3>
                    <p className="mt-2 text-sm text-white/75 leading-relaxed">{project.summary}</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Why Choose Briicks Properties: Your Vision, Our Commitment */}
        <div className="mt-12 sm:mt-16 pt-10 sm:pt-14 border-t border-white/12 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-start">
          <div className="lg:col-span-5">
            <RevealBlock yOffset={10}>
              <p className="text-xs font-semibold tracking-widest uppercase text-[#F05228]">
                Why Choose Briicks Properties
              </p>
            </RevealBlock>
            <BuiltexSplitHeading
              as="h3"
              segments={[{ text: 'Your Vision, Our Engineering Commitment' }]}
              className="mt-2.5 sm:mt-3 font-display font-bold text-white tracking-tight leading-tight"
              style={{ fontSize: 'clamp(1.6rem, 2.6vw, 2.25rem)', textWrap: 'balance' }}
            />
            <RevealBlock delay={0.12}>
              <p className="mt-3.5 sm:mt-4 text-sm sm:text-base text-white/75 leading-relaxed">
                We pair experienced civil engineers with transparent project governance so homeowners
                and landowners enjoy predictable timelines, zero cost overruns, and lasting structural
                safety.
              </p>

              <BuiltexButton
                onClick={onStartProject}
                variant="accent-light"
                className="mt-6 sm:mt-7 w-full sm:w-auto min-h-[48px] px-5 py-3 text-sm"
              >
                Schedule Site Visit
              </BuiltexButton>
            </RevealBlock>
          </div>

          <div className="lg:col-span-7 divide-y divide-white/12 border-y border-white/12">
            {WHY_CHOOSE_POINTS.map((point, idx) => (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 'some' }}
                transition={{ duration: 0.38, delay: idx * 0.04, ease: ARCHITECTURAL_EASE }}
                className="py-4 sm:py-5 flex items-start gap-3.5 sm:gap-4"
              >
                <CheckCircle2
                  className="w-5 h-5 text-[#F05228] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <h4 className="font-display font-semibold text-base text-white">{point.title}</h4>
                  <p className="mt-1 text-sm text-white/72 leading-relaxed">{point.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
