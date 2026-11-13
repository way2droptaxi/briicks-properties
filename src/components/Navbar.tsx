import { useState, useEffect } from 'react';
import { ArrowRight, Menu, PhoneCall, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { BRAND_INFO } from '../data/briicksData';
import { ARCHITECTURAL_EASE, BuiltexButton } from './MotionPrimitives';

interface NavbarProps {
  onBookAppointment: () => void;
}

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Estimator', href: '#estimator' },
  { label: 'Projects', href: '#projects' },
  { label: 'Testimonials', href: '#testimonials' },
];

export function Navbar({ onBookAppointment }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 36);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-colors duration-200 ${
        isScrolled || mobileOpen
          ? 'bg-white/95 backdrop-blur-md border-b border-[#E6E4EB] text-[#26232A]'
          : 'bg-[#19171C]/80 backdrop-blur-sm border-b border-white/12 text-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-14 sm:h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Single-line Brand Logo */}
        <a
          href="#top"
          onClick={() => setMobileOpen(false)}
          aria-label="Briicks Properties — Rising Above"
          className={`inline-flex items-center whitespace-nowrap shrink-0 rounded-lg transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F05228] ${
            isScrolled || mobileOpen ? 'bg-white px-1 py-0.5' : 'bg-white px-2 sm:px-2.5 py-1 shadow-sm'
          }`}
        >
          <img
            src="/assets/aistudio/BRIICKS_Properties_Rising_Above_Logo_f405ac32.png"
            alt="Briicks Properties — Rising Above"
            className="h-7 sm:h-9 w-auto object-contain block"
          />
        </a>

        {/* Zone 2: Concise Single-Line Nav Links */}
        <nav aria-label="Primary Navigation" className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`relative py-1 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#F05228] after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-[#F05228] after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform after:duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F05228] rounded ${
                isScrolled ? 'text-[#26232A]/85' : 'text-white/90'
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Single Primary Action + Mobile Trigger */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="hidden sm:block">
            <BuiltexButton
              onClick={onBookAppointment}
              variant={isScrolled ? 'accent-dark' : 'accent-light'}
              className="px-4 py-2 text-sm"
            >
              Book Appointment
            </BuiltexButton>
          </div>

          <button
            type="button"
            data-testid="mobile-nav-toggle"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-current/20 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F05228]"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer + Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
              className="md:hidden fixed inset-x-0 top-14 sm:top-16 bottom-0 bg-[#19171C]/45 backdrop-blur-[2px] z-30"
            />
            <motion.div
              data-testid="mobile-nav-drawer"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: ARCHITECTURAL_EASE }}
              className="relative z-40 md:hidden bg-white text-[#26232A] border-b border-[#E6E4EB] shadow-xl px-4 py-4 max-h-[calc(100dvh-3.5rem)] overflow-y-auto"
            >
              <nav aria-label="Mobile Navigation" className="flex flex-col divide-y divide-[#E6E4EB]">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="min-h-[48px] px-2 py-3 text-base font-medium flex items-center justify-between text-[#26232A] hover:text-[#D43F17] active:bg-[#F7F7F9] transition-colors"
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="w-4 h-4 text-[#26232A]/40" aria-hidden="true" />
                  </a>
                ))}
              </nav>

              <div className="mt-4 pt-4 border-t border-[#E6E4EB] grid grid-cols-1 gap-2.5">
                <BuiltexButton
                  onClick={() => {
                    setMobileOpen(false);
                    onBookAppointment();
                  }}
                  variant="accent-dark"
                  className="w-full min-h-[48px] px-4 py-3 text-sm"
                >
                  Book Appointment
                </BuiltexButton>

                <a
                  href={BRAND_INFO.phoneHref}
                  className="min-h-[48px] px-4 py-3 rounded-lg border border-[#E6E4EB] bg-[#F7F7F9] text-sm font-semibold text-[#26232A] hover:border-[#D43F17] inline-flex items-center justify-center gap-2 transition-colors tabular-nums"
                >
                  <PhoneCall className="w-4 h-4 text-[#D43F17]" aria-hidden="true" />
                  <span>Call {BRAND_INFO.phoneDisplay}</span>
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
