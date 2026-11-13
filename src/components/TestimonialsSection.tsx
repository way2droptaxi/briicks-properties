import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { TESTIMONIALS } from '../data/briicksData';
import { ARCHITECTURAL_EASE, BuiltexSplitHeading, RevealBlock } from './MotionPrimitives';

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isPaused, setIsPaused] = useState(false);
  const prefersReduced = useReducedMotion();
  const total = TESTIMONIALS.length;

  useEffect(() => {
    if (prefersReduced || isPaused) return;
    const timer = window.setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev + 1) % total);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [prefersReduced, isPaused, total]);

  const handlePrev = () => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % total);
  };

  const handleSelect = (index: number) => {
    setDirection(index >= activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  // Display 2 cards cleanly on desktop while stepping sequentially through all 5 clients
  const primaryReview = TESTIMONIALS[activeIndex];
  const secondaryReview = TESTIMONIALS[(activeIndex + 1) % total];
  const displayed = [primaryReview, secondaryReview];

  return (
    <section
      id="testimonials"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      className="scroll-mt-14 sm:scroll-mt-16 py-14 sm:py-20 lg:py-28 bg-[#F7F7F9] border-b border-[#E6E4EB] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
          <div className="max-w-2xl">
            <RevealBlock yOffset={10}>
              <p className="text-xs font-semibold tracking-widest uppercase text-[#D43F17]">
                Client Testimonials
              </p>
            </RevealBlock>
            <BuiltexSplitHeading
              as="h2"
              segments={[{ text: 'Why Clients Trust Briicks Properties' }]}
              className="mt-2.5 sm:mt-3 font-display font-bold text-[#26232A] tracking-tight leading-tight"
              style={{ fontSize: 'clamp(1.75rem, 3vw, 2.75rem)', textWrap: 'balance' }}
            />
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <span className="text-xs font-semibold text-[#26232A]/70 tabular-nums mr-1">
              {String(activeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={handlePrev}
              aria-label="Previous client testimonial"
              className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-white border border-[#E6E4EB] text-[#26232A] hover:border-[#D43F17] hover:text-[#D43F17] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={handleNext}
              aria-label="Next client testimonial"
              className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-white border border-[#E6E4EB] text-[#26232A] hover:border-[#D43F17] hover:text-[#D43F17] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </motion.button>
          </div>
        </div>

        {/* Two-column editorial testimonial showcase with Builtex-style directional slide */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, x: direction * 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -28 }}
            transition={{ duration: 0.34, ease: ARCHITECTURAL_EASE }}
            className="mt-7 sm:mt-10 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6"
          >
            {displayed.map((item, idx) => (
              <blockquote
                key={`${item.id}-${idx}`}
                className={`bg-white rounded-2xl border border-[#E6E4EB] p-5 sm:p-8 flex flex-col justify-between ${
                  idx === 1 ? 'hidden md:flex' : 'flex'
                }`}
              >
                <div>
                  <Quote className="w-7 h-7 sm:w-8 sm:h-8 text-[#D43F17]/80 mb-4 sm:mb-5" aria-hidden="true" />
                  <p className="text-[15px] sm:text-lg text-[#26232A] leading-relaxed font-normal">
                    “{item.quote}”
                  </p>
                </div>

                <footer className="mt-6 sm:mt-7 pt-4 sm:pt-5 border-t border-[#E6E4EB] flex items-center justify-between gap-4">
                  <div>
                    <cite className="not-italic font-display font-bold text-base text-[#26232A] block">
                      {item.name}
                    </cite>
                    <span className="text-xs text-[#26232A]/70">
                      {item.role} · {item.projectType}
                    </span>
                  </div>
                </footer>
              </blockquote>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Client quick-select tabs */}
        <div className="mt-5 sm:mt-6 flex flex-nowrap sm:flex-wrap overflow-x-auto no-scrollbar items-center gap-2 pb-1 sm:pb-0">
          {TESTIMONIALS.map((client, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={client.id}
                type="button"
                onClick={() => handleSelect(index)}
                className={`relative min-h-[42px] px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-white border-[#26232A]'
                    : 'bg-white text-[#26232A]/75 border-[#E6E4EB] hover:border-[#D43F17]/50'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="testimonial-client-pill"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    aria-hidden="true"
                    className="absolute inset-0 rounded-[7px] bg-[#26232A]"
                  />
                )}
                <span className="relative z-10">{client.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
