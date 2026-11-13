import { CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { ABOUT_HIGHLIGHTS, HERO_MEDIA } from '../data/briicksData';
import { SafeImage } from './SafeImage';
import {
  AnimatedCounter,
  ARCHITECTURAL_EASE,
  BuiltexButton,
  BuiltexImageReveal,
  BuiltexSplitHeading,
  RevealBlock,
} from './MotionPrimitives';

interface AboutSectionProps {
  onExploreServices: () => void;
}

export function AboutSection({ onExploreServices }: AboutSectionProps) {
  return (
    <section id="about" className="scroll-mt-14 sm:scroll-mt-16 py-14 sm:py-20 lg:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-14 items-stretch">
          {/* Left Column: Builtex-style Counter-Sliding Curtain Reveal + Shine Sweep */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-12 gap-3.5 sm:gap-4 items-stretch">
            <div className="sm:col-span-7 flex flex-col justify-between gap-3.5 sm:gap-4">
              <BuiltexImageReveal
                dataCursor="View"
                className="relative h-56 sm:h-auto sm:flex-1 sm:min-h-[280px] rounded-2xl border border-[#E6E4EB]"
              >
                <SafeImage
                  src={HERO_MEDIA.aboutVilla}
                  alt="Completed contemporary residential villa built by Briicks Properties"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                />
              </BuiltexImageReveal>

              <RevealBlock
                delay={0.12}
                yOffset={16}
                className="bg-[#D43F17] text-white rounded-2xl p-5 sm:p-7 flex sm:block items-center gap-4"
              >
                <div className="font-display font-extrabold text-4xl sm:text-5xl tracking-tight tabular-nums shrink-0">
                  <AnimatedCounter target={15} suffix="+" />
                </div>
                <p className="sm:mt-1.5 text-sm sm:text-base font-medium text-white/95 leading-snug">
                  Years of Excellence in Residential &amp; Commercial Construction
                </p>
              </RevealBlock>
            </div>

            <div className="sm:col-span-5 flex flex-col">
              <BuiltexImageReveal
                delay={0.12}
                dataCursor="View"
                className="relative h-52 sm:h-auto sm:flex-1 sm:min-h-[340px] rounded-2xl border border-[#E6E4EB]"
              >
                <SafeImage
                  src={HERO_MEDIA.structuralSite}
                  alt="Reinforced concrete framing and structural supervision on site"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                />
              </BuiltexImageReveal>
            </div>
          </div>

          {/* Right Column: Editorial Story + SplitText Heading + Briicks Guarantee Matrix */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <div>
              <RevealBlock yOffset={10}>
                <p className="text-xs font-semibold tracking-widest uppercase text-[#D43F17]">
                  About Briicks Properties
                </p>
              </RevealBlock>
              <BuiltexSplitHeading
                as="h2"
                segments={[{ text: 'Constructing Dreams, One Brick at a Time' }]}
                className="mt-2.5 sm:mt-3 font-display font-bold text-[#26232A] tracking-tight leading-tight"
                style={{ fontSize: 'clamp(1.75rem, 3vw, 2.75rem)', textWrap: 'balance' }}
              />
              <RevealBlock delay={0.14} yOffset={12}>
                <p className="mt-4 sm:mt-5 text-[15px] sm:text-base text-[#26232A]/78 leading-relaxed">
                  At Briicks Properties, we serve as a single accountable partner for all your
                  construction needs in Chennai. From geotechnical soil testing and architectural planning
                  to turnkey interiors, we build durable spaces across residential, commercial, and
                  industrial sectors with zero cost overruns.
                </p>
              </RevealBlock>
            </div>

            {/* Clean 2-column architectural guarantee list without nested card boxes */}
            <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 sm:gap-y-5 border-t border-[#E6E4EB] pt-6 sm:pt-7">
              {ABOUT_HIGHLIGHTS.map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 'some' }}
                  transition={{ duration: 0.4, delay: 0.04 * idx, ease: ARCHITECTURAL_EASE }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2
                    className="w-5 h-5 text-[#D43F17] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="font-display font-semibold text-sm text-[#26232A]">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-[#26232A]/70 leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <RevealBlock
              delay={0.15}
              yOffset={12}
              className="mt-7 sm:mt-8 pt-6 border-t border-[#E6E4EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <p className="text-sm text-[#26232A]/75">
                Every project is backed by stage-wise billing and transparent material specs.
              </p>
              <BuiltexButton
                onClick={onExploreServices}
                variant="dark-accent"
                className="w-full sm:w-auto min-h-[48px] px-5 py-2.5 text-sm"
              >
                Explore Services
              </BuiltexButton>
            </RevealBlock>
          </div>
        </div>
      </div>
    </section>
  );
}
