import { motion } from 'motion/react';
import { STATS } from '../data/briicksData';
import {
  AnimatedCounter,
  ARCHITECTURAL_EASE,
  BuiltexSplitHeading,
  RevealBlock,
} from './MotionPrimitives';

export function StatsCounterSection() {
  return (
    <section
      id="stats"
      data-testid="stats-counter-section"
      className="scroll-mt-14 sm:scroll-mt-16 py-12 sm:py-16 lg:py-20 bg-[#19171C] text-white border-y border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 pb-7 sm:pb-10 border-b border-white/12">
          <div className="max-w-2xl">
            <RevealBlock yOffset={10}>
              <p className="text-xs font-semibold tracking-widest uppercase text-[#F05228]">
                Proven Track Record
              </p>
            </RevealBlock>
            <BuiltexSplitHeading
              as="h2"
              segments={[{ text: 'Delivered Across Chennai With Measurable Precision' }]}
              className="mt-2 font-display font-bold text-white tracking-tight leading-tight"
              style={{ fontSize: 'clamp(1.55rem, 2.8vw, 2.35rem)', textWrap: 'balance' }}
            />
          </div>

          <RevealBlock delay={0.1}>
            <p className="text-sm text-white/70 max-w-sm leading-relaxed">
              Every milestone, floor area, and structural handover tracked against our 200+ QA
              checklist per floor.
            </p>
          </RevealBlock>
        </div>

        <div className="mt-7 sm:mt-10 grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-6 lg:gap-0 lg:divide-x lg:divide-white/12">
          {STATS.map((stat, idx) => (
            <motion.div
              key={stat.id}
              data-testid={`stat-card-${stat.id}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 'some' }}
              transition={{ duration: 0.42, delay: idx * 0.06, ease: ARCHITECTURAL_EASE }}
              className={`lg:py-2 ${idx >= 2 ? 'pt-5 border-t border-white/12 lg:border-t-0 lg:pt-2' : ''} ${
                idx === 0
                  ? 'lg:pr-8'
                  : idx === STATS.length - 1
                  ? 'lg:pl-8'
                  : 'lg:px-8'
              }`}
            >
              <div className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight tabular-nums text-white">
                <span className="text-[#F05228]">
                  <AnimatedCounter target={stat.target} durationMs={950} />
                </span>
                <span>{stat.suffix}</span>
              </div>
              <h3 className="mt-2 font-display font-semibold text-sm sm:text-base text-white leading-snug">
                {stat.label}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-white/65 leading-relaxed">{stat.detail}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
