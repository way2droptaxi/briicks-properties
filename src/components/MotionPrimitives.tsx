import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { ArrowUpRight } from 'lucide-react';
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'motion/react';
import { splitHeadingSegments, type HeadingSegment } from '../utils/textSplit';

export const ARCHITECTURAL_EASE = [0.16, 1, 0.3, 1] as const;

export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 32,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[3px] bg-[#F05228] origin-left z-50 pointer-events-none"
    />
  );
}

interface RevealBlockProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  yOffset?: number;
}

export function RevealBlock({
  children,
  className = '',
  delay = 0,
  yOffset = 14,
}: RevealBlockProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 'some' }}
      transition={{ duration: 0.48, delay, ease: ARCHITECTURAL_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface BuiltexSplitHeadingProps {
  as?: 'h1' | 'h2' | 'h3';
  segments: HeadingSegment[];
  className?: string;
  style?: CSSProperties;
  immediate?: boolean;
  delay?: number;
}

/**
 * Replicates Builtex's signature SplitText kinetic character reveal
 * (words grouped to preserve natural wrapping, characters slide cleanly in).
 */
export function BuiltexSplitHeading({
  as = 'h2',
  segments,
  className = '',
  style,
  immediate = false,
  delay = 0,
}: BuiltexSplitHeadingProps) {
  const prefersReduced = useReducedMotion();
  const fullText = useMemo(() => segments.map((s) => s.text).join(''), [segments]);
  const tokens = useMemo(() => splitHeadingSegments(segments), [segments]);

  const Tag = as;

  if (prefersReduced) {
    return (
      <Tag className={className} style={style}>
        {segments.map((seg, i) => (
          <span key={i} className={seg.className}>
            {seg.text}
          </span>
        ))}
      </Tag>
    );
  }

  let charCounter = 0;

  const content = (
    <span aria-hidden="true">
      {tokens.map((token, wIdx) => (
        <span key={wIdx}>
          <span className={`inline-block whitespace-nowrap ${token.className ?? ''}`}>
            {token.chars.map((ch, cIdx) => {
              const idx = charCounter++;
              const charDelay = delay + Math.min(idx * 0.014, 0.42);
              return (
                <motion.span
                  key={cIdx}
                  initial={{ opacity: 0, x: 18 }}
                  {...(immediate
                    ? { animate: { opacity: 1, x: 0 } }
                    : {
                        whileInView: { opacity: 1, x: 0 },
                        viewport: { once: true, amount: 'some' },
                      })}
                  transition={{
                    duration: 0.42,
                    delay: charDelay,
                    ease: ARCHITECTURAL_EASE,
                  }}
                  className="inline-block will-change-transform"
                >
                  {ch}
                </motion.span>
              );
            })}
          </span>
          {token.hasTrailingSpace ? ' ' : null}
        </span>
      ))}
    </span>
  );

  return (
    <Tag aria-label={fullText} className={className} style={style}>
      {content}
    </Tag>
  );
}

interface BuiltexImageRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  withShine?: boolean;
  dataCursor?: string;
}

/**
 * Replicates Builtex's signature .reveal GSAP counter-sliding curtain wipe:
 * outer frame enters from x: -100% -> 0 while inner photo counters from x: 100% -> 0,
 * creating a crisp horizontal architectural shutter reveal.
 */
export function BuiltexImageReveal({
  children,
  className = '',
  delay = 0,
  withShine = true,
  dataCursor,
}: BuiltexImageRevealProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return (
      <div
        data-cursor={dataCursor}
        className={`${withShine ? 'builtex-shine-frame ' : ''}${className}`}
      >
        {children}
      </div>
    );
  }

  return (
    <div data-cursor={dataCursor} className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ x: '-100%' }}
        whileInView={{ x: '0%' }}
        viewport={{ once: true, amount: 'some' }}
        transition={{ duration: 0.78, delay, ease: ARCHITECTURAL_EASE }}
        className={`w-full h-full overflow-hidden will-change-transform ${
          withShine ? 'builtex-shine-frame' : ''
        }`}
      >
        <motion.div
          initial={{ x: '100%' }}
          whileInView={{ x: '0%' }}
          viewport={{ once: true, amount: 'some' }}
          transition={{ duration: 0.78, delay, ease: ARCHITECTURAL_EASE }}
          className="w-full h-full will-change-transform"
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}

type BuiltexButtonVariant = 'accent-dark' | 'accent-light' | 'dark-accent';

interface BuiltexButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: BuiltexButtonVariant;
  className?: string;
  showArrow?: boolean;
}

/**
 * Replicates Builtex's .btn-default diagonal skewed fill wipe + rotating arrow CTA.
 */
export function BuiltexButton({
  children,
  onClick,
  type = 'button',
  variant = 'accent-dark',
  className = '',
  showArrow = true,
}: BuiltexButtonProps) {
  const variantClasses =
    variant === 'accent-light'
      ? 'bg-[#D43F17] text-white hover:text-[#26232A] focus-visible:text-[#26232A]'
      : variant === 'dark-accent'
      ? 'bg-[#26232A] text-white'
      : 'bg-[#D43F17] text-white';

  const hoverBg =
    variant === 'accent-light'
      ? '#FFFFFF'
      : variant === 'dark-accent'
      ? '#D43F17'
      : '#26232A';

  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{ '--btn-hover-bg': hoverBg } as CSSProperties}
      className={`builtex-btn inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-colors duration-200 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F05228] ${variantClasses} ${className}`}
    >
      <span className="relative z-10 inline-flex items-center gap-2">
        <span>{children}</span>
        {showArrow && (
          <ArrowUpRight className="w-4 h-4 builtex-btn-arrow shrink-0" aria-hidden="true" />
        )}
      </span>
    </motion.button>
  );
}

interface AnimatedCounterProps {
  target: number;
  suffix?: string;
  durationMs?: number;
}

export function AnimatedCounter({
  target,
  suffix = '',
  durationMs = 850,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 'some' });
  const prefersReduced = useReducedMotion();
  const [displayValue, setDisplayValue] = useState<number>(target);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (prefersReduced || !isInView || hasAnimatedRef.current) {
      setDisplayValue(target);
      return;
    }

    hasAnimatedRef.current = true;
    const startTime = performance.now();
    let frameId = 0;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(eased * target));
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        setDisplayValue(target);
      }
    };

    setDisplayValue(0);
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isInView, prefersReduced, target, durationMs]);

  return (
    <span ref={ref}>
      {displayValue}
      {suffix}
    </span>
  );
}

interface AnimatedINRProps {
  value: number;
  formatter: (n: number) => string;
}

export function AnimatedINR({ value, formatter }: AnimatedINRProps) {
  const prefersReduced = useReducedMotion();
  const [displayed, setDisplayed] = useState<number>(value);
  const prevRef = useRef<number>(value);

  useEffect(() => {
    if (prefersReduced || prevRef.current === value) {
      prevRef.current = value;
      setDisplayed(value);
      return;
    }

    const from = prevRef.current;
    const to = value;
    prevRef.current = value;
    const start = performance.now();
    const duration = 260;
    let raf = 0;

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(from + (to - from) * eased));
      if (t < 1) {
        raf = requestAnimationFrame(step);
      } else {
        setDisplayed(to);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, prefersReduced]);

  return <>{formatter(displayed)}</>;
}
