import { useEffect, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import {
  resolveCursorStateFromElement,
  type CursorState,
} from '../utils/cursorIntent';
import { ARCHITECTURAL_EASE } from './MotionPrimitives';

/**
 * Redesigned Briicks architectural mouse pointer ("Drafting Nib + Blueprint Viewfinder"):
 * - Instant sharp vermilion/white architectural arrowhead nib at exact cursor hotspot
 * - Spring-lagged hollow 45deg diamond frame in default state
 * - Snaps open into an upright 4-corner [ ] architectural bracket viewfinder on interactive controls
 * - Expands into a chamfered dark obsidian-and-vermilion tag on showcase media & walkthrough triggers
 */
export function ArchitecturalCursor() {
  const prefersReduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [cursorState, setCursorState] = useState<CursorState>({
    mode: 'default',
    label: '',
  });

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const frameX = useSpring(mouseX, { stiffness: 320, damping: 26, mass: 0.42 });
  const frameY = useSpring(mouseY, { stiffness: 320, damping: 26, mass: 0.42 });

  useEffect(() => {
    if (prefersReduced || typeof window === 'undefined') {
      setEnabled(false);
      return;
    }

    const finePointerQuery = window.matchMedia('(pointer: fine)');
    const syncPointerCapability = () => {
      setEnabled(finePointerQuery.matches);
    };
    syncPointerCapability();

    finePointerQuery.addEventListener('change', syncPointerCapability);
    return () => finePointerQuery.removeEventListener('change', syncPointerCapability);
  }, [prefersReduced]);

  useEffect(() => {
    if (!enabled) {
      document.documentElement.classList.remove('briicks-custom-cursor');
      return;
    }

    document.documentElement.classList.add('briicks-custom-cursor');

    let lastX = -100;
    let lastY = -100;
    let scrollRaf = 0;

    const syncCursorTarget = (target: EventTarget | null) => {
      const nextState = resolveCursorStateFromElement(target);
      setCursorState((prev) =>
        prev.mode === nextState.mode && prev.label === nextState.label ? prev : nextState
      );
    };

    const handleMove = (e: PointerEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      mouseX.set(lastX);
      mouseY.set(lastY);
      setVisible(true);
      syncCursorTarget(e.target);
    };

    const handleScroll = () => {
      if (lastX < 0 || lastY < 0 || scrollRaf) return;
      scrollRaf = window.requestAnimationFrame(() => {
        scrollRaf = 0;
        const underCursor = document.elementFromPoint(lastX, lastY);
        syncCursorTarget(underCursor);
      });
    };

    const handleDown = () => setPressed(true);
    const handleUp = () => setPressed(false);
    const handleLeave = () => setVisible(false);
    const handleEnter = () => setVisible(true);

    window.addEventListener('pointermove', handleMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('pointerdown', handleDown, { passive: true });
    window.addEventListener('pointerup', handleUp, { passive: true });
    document.addEventListener('mouseleave', handleLeave);
    document.addEventListener('mouseenter', handleEnter);

    return () => {
      if (scrollRaf) window.cancelAnimationFrame(scrollRaf);
      document.documentElement.classList.remove('briicks-custom-cursor');
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('pointerdown', handleDown);
      window.removeEventListener('pointerup', handleUp);
      document.removeEventListener('mouseleave', handleLeave);
      document.removeEventListener('mouseenter', handleEnter);
    };
  }, [enabled, mouseX, mouseY]);

  if (!enabled) return null;

  const isAction = cursorState.mode === 'action';
  const isInteractive = cursorState.mode === 'interactive';
  const isText = cursorState.mode === 'text';

  const frameWidth = isAction ? 84 : isInteractive ? 48 : 26;
  const frameHeight = isAction ? 34 : isInteractive ? 48 : 26;
  const frameOpacity = !visible || isText ? 0 : 1;
  const nibOpacity = !visible || isAction || isText ? 0 : 1;

  return (
    <div
      data-testid="custom-cursor"
      data-cursor-mode={cursorState.mode}
      aria-hidden="true"
      className="fixed inset-0 z-[120] pointer-events-none overflow-hidden select-none"
    >
      {/* Trailing Blueprint Diamond / Corner-Bracket Viewfinder / Obsidian Action Tag */}
      <motion.div
        style={{ x: frameX, y: frameY }}
        className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 will-change-transform"
      >
        <motion.div
          animate={{
            width: frameWidth,
            height: frameHeight,
            opacity: frameOpacity,
            rotate: isInteractive || isAction ? 0 : 45,
            scale: pressed ? 0.84 : 1,
            backgroundColor: isAction
              ? 'rgba(25, 23, 28, 0.94)'
              : isInteractive
              ? 'rgba(240, 82, 40, 0.08)'
              : 'rgba(240, 82, 40, 0.03)',
            borderColor: isAction
              ? 'rgba(240, 82, 40, 0.95)'
              : isInteractive
              ? 'rgba(240, 82, 40, 0)'
              : 'rgba(240, 82, 40, 0.72)',
            borderRadius: isAction ? '6px' : '2px',
          }}
          transition={{ duration: 0.2, ease: ARCHITECTURAL_EASE }}
          className="relative flex items-center justify-center border-[1.5px] shadow-[0_6px_18px_rgba(25,23,28,0.18)]"
        >
          {/* 4-corner L-brackets on interactive controls */}
          {isInteractive && (
            <>
              <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-[#F05228]" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-[#F05228]" />
              <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-[#F05228]" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-[#F05228]" />
            </>
          )}

          {/* Crisp chamfered architectural action badge for View / Play */}
          {isAction && cursorState.label && (
            <motion.span
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.14 }}
              className="inline-flex items-center gap-1.5 font-display font-bold text-[11px] tracking-[0.16em] uppercase text-white"
            >
              <span className="w-1.5 h-1.5 rotate-45 bg-[#F05228]" />
              <span>{cursorState.label}</span>
            </motion.span>
          )}
        </motion.div>
      </motion.div>

      {/* Instant zero-lag directional architectural drafting nib SVG */}
      <motion.div
        style={{ x: mouseX, y: mouseY }}
        className="fixed top-0 left-0 will-change-transform"
      >
        <motion.svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          animate={{
            opacity: nibOpacity,
            scale: pressed ? 0.82 : isInteractive ? 0.92 : 1,
            rotate: isInteractive ? -8 : 0,
          }}
          transition={{ duration: 0.14, ease: ARCHITECTURAL_EASE }}
          className="-translate-x-[2px] -translate-y-[2px] drop-shadow-[0_2px_4px_rgba(25,23,28,0.35)]"
        >
          <path
            d="M3 2L20 11L12.5 13.5L9.5 21L3 2Z"
            fill="#F05228"
            stroke="#FFFFFF"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </motion.svg>
      </motion.div>
    </div>
  );
}
