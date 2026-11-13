import { useEffect } from 'react';
import { ArrowUpRight, CheckCircle2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { BUILD_PROCESS_STEPS, type ServiceItem } from '../data/briicksData';
import { SafeImage } from './SafeImage';
import { ARCHITECTURAL_EASE } from './MotionPrimitives';

interface WalkthroughModalProps {
  mode: 'walkthrough' | 'service' | null;
  service: ServiceItem | null;
  onClose: () => void;
  onRequestQuote: (serviceTitle?: string) => void;
}

export function WalkthroughModal({
  mode,
  service,
  onClose,
  onRequestQuote,
}: WalkthroughModalProps) {
  useEffect(() => {
    if (!mode) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mode, onClose]);

  return (
    <AnimatePresence>
      {mode && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={
            mode === 'service' && service ? service.title : 'Briicks Properties 4-Stage Build Process'
          }
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-[#19171C]/75 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 20 }}
            transition={{ duration: 0.25, ease: ARCHITECTURAL_EASE }}
            className="w-full max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl border border-[#E6E4EB] overflow-hidden max-h-[88dvh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-[#E6E4EB] flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#D43F17]">
                  {mode === 'service' && service ? service.category : 'How We Build'}
                </p>
                <h3 className="font-display font-bold text-lg sm:text-xl text-[#26232A] mt-0.5 truncate">
                  {mode === 'service' && service
                    ? `${service.number}. ${service.title}`
                    : '4-Stage Turnkey Construction Process'}
                </h3>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="inline-flex items-center justify-center w-11 h-11 rounded-lg border border-[#E6E4EB] text-[#26232A] hover:border-[#D43F17] hover:text-[#D43F17] transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6">
              {mode === 'service' && service ? (
                <>
                  <div className="h-44 sm:h-52 rounded-xl overflow-hidden border border-[#E6E4EB]">
                    <SafeImage
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm sm:text-base text-[#26232A]/80 leading-relaxed">
                    {service.fullDesc}
                  </p>
                  <div className="space-y-3 pt-2 border-t border-[#E6E4EB]">
                    <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-[#26232A]">
                      Included Engineering Deliverables
                    </h4>
                    <ul className="space-y-2.5">
                      {service.deliverables.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-sm text-[#26232A]/85">
                          <CheckCircle2
                            className="w-4 h-4 text-[#D43F17] shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="divide-y divide-[#E6E4EB]">
                  {BUILD_PROCESS_STEPS.map((stage, idx) => (
                    <motion.div
                      key={stage.step}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.06, ease: ARCHITECTURAL_EASE }}
                      className="py-4 first:pt-0 last:pb-0 flex items-start gap-3.5 sm:gap-4"
                    >
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#F7F7F9] border border-[#E6E4EB] font-display font-bold text-sm text-[#D43F17] tabular-nums shrink-0">
                        {stage.step}
                      </span>
                      <div>
                        <h4 className="font-display font-bold text-base text-[#26232A]">
                          {stage.title}
                        </h4>
                        <p className="mt-1 text-sm text-[#26232A]/75 leading-relaxed">
                          {stage.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 sm:px-6 py-4 bg-[#F7F7F9] border-t border-[#E6E4EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-[#26232A]/70 text-center sm:text-left">
                Starts from ₹2,350/sq.ft · 10-Year Structural Warranty
              </span>
              <button
                type="button"
                onClick={() => {
                  const svcTitle = mode === 'service' && service ? service.title : undefined;
                  onClose();
                  onRequestQuote(svcTitle);
                }}
                className="w-full sm:w-auto min-h-[46px] inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-[#D43F17] hover:bg-[#B83210] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>Request Quote</span>
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
