import { useEffect, useRef, useState } from 'react';
import { Play, PhoneCall } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { BRAND_INFO, HERO_MEDIA } from '../data/briicksData';
import { SafeImage } from './SafeImage';
import {
  ARCHITECTURAL_EASE,
  BuiltexButton,
  BuiltexSplitHeading,
} from './MotionPrimitives';

interface HeroSectionProps {
  onRequestQuote: () => void;
  onOpenWalkthrough: () => void;
}

const HERO_SLIDES = [
  {
    src: HERO_MEDIA.background,
    alt: 'Briicks Properties civil engineers and architects reviewing structural blueprints on site',
  },
  {
    src: HERO_MEDIA.aboutVilla,
    alt: 'Modern architectural luxury villa delivered by Briicks Properties in Chennai',
  },
  {
    src: HERO_MEDIA.commercialHub,
    alt: 'Commercial and mixed-use structural development by Briicks Properties',
  },
];

export function HeroSection({ onRequestQuote, onOpenWalkthrough }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();
  const [slideIndex, setSlideIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.1]);

  useEffect(() => {
    if (prefersReduced) return;
    const timer = window.setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4800);
    return () => window.clearInterval(timer);
  }, [prefersReduced]);

  const currentSlide = HERO_SLIDES[slideIndex];

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative min-h-[600px] sm:min-h-[680px] lg:min-h-[88vh] flex flex-col justify-between bg-[#19171C] text-white overflow-hidden pt-14 sm:pt-20"
    >
      {/* Builtex-style Crossfading Background Slider with Ken Burns zoom & scroll parallax */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          style={prefersReduced ? undefined : { y: bgY, scale: bgScale }}
          className="w-full h-full will-change-transform relative"
        >
          <AnimatePresence initial={false} mode="sync">
            <motion.div
              key={currentSlide.src}
              initial={prefersReduced ? { opacity: 1 } : { opacity: 0, scale: 1.07 }}
              animate={{ opacity: 1, scale: 1.01 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: ARCHITECTURAL_EASE }}
              className="absolute inset-0 will-change-transform"
            >
              <SafeImage
                src={currentSlide.src}
                alt={currentSlide.alt}
                className="w-full h-full object-cover object-center"
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[#19171C]/62 md:bg-transparent"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#19171C]/95 via-[#19171C]/80 to-[#19171C]/40"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#19171C] via-transparent to-[#19171C]/45"
        />
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-8 pt-8 pb-7 sm:pt-12 sm:pb-10 lg:pt-20 lg:pb-14 flex-1 flex flex-col justify-center">
        <div className="max-w-2xl space-y-4 sm:space-y-6">
          <motion.p
            initial={prefersReduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: ARCHITECTURAL_EASE }}
            className="text-[11px] sm:text-sm font-medium tracking-wider uppercase text-white/80"
          >
            <span>Quality</span>
            <span className="mx-2 sm:mx-2.5 text-[#F05228]" aria-hidden="true">
              ·
            </span>
            <span>Reliability</span>
            <span className="mx-2 sm:mx-2.5 text-[#F05228]" aria-hidden="true">
              ·
            </span>
            <span>Excellence Guaranteed</span>
          </motion.p>

          <BuiltexSplitHeading
            as="h1"
            immediate
            delay={0.05}
            segments={[
              { text: 'Constructing ' },
              { text: 'Your Future', className: 'text-[#F05228]' },
              { text: ' With Care' },
            ]}
            className="font-display font-bold tracking-tight leading-[1.08] text-white"
            style={{ fontSize: 'clamp(2.05rem, 4.4vw, 4.125rem)', textWrap: 'balance' }}
          />

          <motion.p
            initial={prefersReduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24, ease: ARCHITECTURAL_EASE }}
            className="text-[15px] sm:text-lg text-white/82 leading-relaxed max-w-xl"
          >
            End-to-end residential, commercial, and turnkey house construction in Chennai—engineered
            with soil testing, 200+ quality checks per floor, and a 10-year structural warranty.
          </motion.p>

          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.34, ease: ARCHITECTURAL_EASE }}
            className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4 pt-1 sm:pt-2"
          >
            <BuiltexButton
              onClick={onRequestQuote}
              variant="accent-light"
              className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 text-sm sm:text-base"
            >
              Get Free Consultation
            </BuiltexButton>

            <motion.button
              type="button"
              data-cursor="Play"
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.18, ease: ARCHITECTURAL_EASE }}
              onClick={onOpenWalkthrough}
              className="group w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center sm:justify-start gap-3 px-4 py-3 text-sm sm:text-base font-medium text-white hover:text-[#F05228] bg-white/8 sm:bg-transparent border border-white/18 sm:border-transparent rounded-lg transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F05228]"
            >
              <span className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/15 border border-white/25 text-white group-hover:bg-[#F05228] group-hover:border-[#F05228] group-hover:scale-105 transition-all duration-200">
                <Play className="w-4 h-4 fill-current ml-0.5" aria-hidden="true" />
              </span>
              <span>Explore Build Process</span>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Bottom Builtex-style Trust & Metrics Strip */}
      <motion.div
        initial={prefersReduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.4, ease: ARCHITECTURAL_EASE }}
        className="relative z-10 border-t border-white/15 bg-[#19171C]/80 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center gap-3 sm:gap-x-8 sm:gap-y-2 text-xs sm:text-sm text-white/85">
            <span className="font-medium tabular-nums leading-snug">
              <strong className="text-white font-semibold block sm:inline">15+ Years</strong>{' '}
              <span className="text-white/75 sm:text-white/85">Excellence</span>
            </span>
            <span className="hidden sm:inline text-white/30" aria-hidden="true">
              /
            </span>
            <span className="font-medium tabular-nums leading-snug">
              <strong className="text-white font-semibold block sm:inline">70+</strong>{' '}
              <span className="text-white/75 sm:text-white/85">Projects</span>
            </span>
            <span className="hidden sm:inline text-white/30" aria-hidden="true">
              /
            </span>
            <span className="font-medium tabular-nums leading-snug">
              <span className="hidden sm:inline">Starts from </span>
              <strong className="text-[#F05228] font-semibold block sm:inline">₹2,350/sq.ft</strong>
              <span className="sm:hidden text-white/75">Starting Rate</span>
            </span>
          </div>

          <a
            href={BRAND_INFO.phoneHref}
            className="min-h-[44px] sm:min-h-0 px-3.5 py-2 sm:p-0 rounded-lg sm:rounded-none bg-white/8 sm:bg-transparent border border-white/12 sm:border-transparent inline-flex items-center justify-center sm:justify-start gap-2 text-sm font-semibold text-white hover:text-[#F05228] transition-colors whitespace-nowrap shrink-0 tabular-nums"
          >
            <PhoneCall className="w-4 h-4 text-[#F05228]" aria-hidden="true" />
            <span>{BRAND_INFO.phoneDisplay}</span>
          </a>
        </div>
      </motion.div>
    </section>
  );
}
