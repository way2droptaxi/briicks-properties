import { useMemo, useState } from 'react';
import { Check, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { KEY_FEATURES } from '../data/briicksData';
import {
  PACKAGE_TIERS,
  calculateConstructionEstimate,
  formatINR,
  type PackageTierId,
} from '../utils/estimator';
import {
  AnimatedINR,
  ARCHITECTURAL_EASE,
  BuiltexButton,
  BuiltexSplitHeading,
  RevealBlock,
} from './MotionPrimitives';

interface EstimatorFeaturesSectionProps {
  onApplyEstimateToQuote: (summaryText: string, suggestedService: string) => void;
}

export function EstimatorFeaturesSection({
  onApplyEstimateToQuote,
}: EstimatorFeaturesSectionProps) {
  const [areaSqFt, setAreaSqFt] = useState<number>(2200);
  const [floors, setFloors] = useState<number>(2);
  const [tierId, setTierId] = useState<PackageTierId>('essential');
  const [includeSoilAndStructural, setIncludeSoilAndStructural] = useState<boolean>(true);
  const [includeInteriorDesign, setIncludeInteriorDesign] = useState<boolean>(false);

  const estimate = useMemo(
    () =>
      calculateConstructionEstimate({
        areaSqFt,
        floors,
        tierId,
        includeSoilAndStructural,
        includeInteriorDesign,
      }),
    [areaSqFt, floors, tierId, includeSoilAndStructural, includeInteriorDesign]
  );

  const handleCarryEstimate = () => {
    const summary = `Estimated Build: ${estimate.areaSqFt} sq.ft (${estimate.floors} floor${
      estimate.floors > 1 ? 's' : ''
    }), ${estimate.tier.name} package${
      includeSoilAndStructural ? ' + Soil & Structural Planning' : ''
    }${includeInteriorDesign ? ' + Interior Design' : ''}. Indicative total: ${formatINR(
      estimate.totalEstimatedCost
    )}.`;

    const suggestedService = includeInteriorDesign
      ? 'Turnkey House Construction'
      : 'New Construction';
    onApplyEstimateToQuote(summary, suggestedService);
  };

  return (
    <section id="estimator" className="scroll-mt-14 sm:scroll-mt-16 py-14 sm:py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-start">
          {/* Left Column: Briicks Key Features & ₹2,350/sq.ft Baseline */}
          <div className="lg:col-span-5 space-y-5 sm:space-y-6">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-[#D43F17]">
                Key Features &amp; Transparent Pricing
              </p>
              <BuiltexSplitHeading
                as="h2"
                segments={[
                  { text: 'Everything Starts From Just ' },
                  { text: '₹2,350', className: 'text-[#D43F17] tabular-nums' },
                  { text: ' / sq.ft', className: 'text-lg sm:text-xl font-semibold text-[#26232A]/70' },
                ]}
                className="mt-2.5 sm:mt-3 font-display font-bold text-[#26232A] tracking-tight leading-tight"
                style={{ fontSize: 'clamp(1.75rem, 3vw, 2.65rem)', textWrap: 'balance' }}
              />
              <p className="mt-3.5 sm:mt-4 text-[15px] sm:text-base text-[#26232A]/75 leading-relaxed">
                No vague ballpark quotes or mid-project escalations. Every Briicks Properties floor
                passes 200+ documented quality assurance checkpoints from soil excavation to final
                paint.
              </p>
            </div>

            <div className="border-t border-[#E6E4EB] pt-5 sm:pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 sm:gap-3.5">
              {KEY_FEATURES.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 'some' }}
                  transition={{ duration: 0.35, delay: index * 0.025, ease: ARCHITECTURAL_EASE }}
                  className="flex items-center gap-3 py-1 text-sm font-medium text-[#26232A]"
                >
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[#F7F7F9] border border-[#E6E4EB] text-xs font-bold text-[#D43F17] tabular-nums shrink-0">
                    0{index + 1}
                  </span>
                  <span>{feature}</span>
                </motion.div>
              ))}
            </div>

            <RevealBlock delay={0.15} className="p-4 sm:p-5 rounded-xl bg-[#F7F7F9] border border-[#E6E4EB] flex items-start gap-3.5">
              <ShieldCheck className="w-6 h-6 text-[#D43F17] shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-sm text-[#26232A]/85 leading-relaxed">
                <strong className="font-semibold text-[#26232A]">Zero Cost Overrun Pledge:</strong>{' '}
                Material grades, steel tonnage, and concrete mixes are locked in writing before your
                foundation stone is laid.
              </div>
            </RevealBlock>
          </div>

          {/* Right Column: Interactive Construction Cost & Milestone Estimator */}
          <RevealBlock className="lg:col-span-7 bg-[#F7F7F9] rounded-2xl border border-[#E6E4EB] p-5 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 pb-5 sm:pb-6 border-b border-[#E6E4EB]">
              <div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-[#26232A]">
                  Interactive Project Cost Estimator
                </h3>
                <p className="text-xs sm:text-sm text-[#26232A]/70 mt-1">
                  Configure your built-up area and specification tier for an instant stage-wise
                  budget.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#D43F17] tabular-nums">
                {estimate.qualityCheckpoints}+ QA Checks Included
              </span>
            </div>

            {/* Package Selection */}
            <div className="mt-5 sm:mt-6">
              <span className="block text-xs font-semibold uppercase tracking-wider text-[#26232A]/70 mb-2.5 sm:mb-3">
                Select Construction Specification
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                {PACKAGE_TIERS.map((tier) => {
                  const selected = tier.id === tierId;
                  return (
                    <motion.button
                      key={tier.id}
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setTierId(tier.id)}
                      className={`text-left min-h-[58px] p-3.5 sm:p-4 rounded-xl border transition-colors duration-150 cursor-pointer flex sm:block items-center justify-between gap-3 ${
                        selected
                          ? 'bg-[#26232A] text-white border-[#26232A]'
                          : 'bg-white text-[#26232A] border-[#E6E4EB] hover:border-[#D43F17]/60'
                      }`}
                    >
                      <div className="text-sm font-display font-bold">{tier.name}</div>
                      <div
                        className={`sm:mt-1 text-base sm:text-lg font-bold tabular-nums ${
                          selected ? 'text-[#FF7852]' : 'text-[#D43F17]'
                        }`}
                      >
                        ₹{tier.ratePerSqFt.toLocaleString('en-IN')}{' '}
                        <span
                          className={`text-xs font-normal ${
                            selected ? 'text-white/75' : 'text-[#26232A]/65'
                          }`}
                        >
                          / sq.ft
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
              <p className="mt-2.5 text-xs text-[#26232A]/75 leading-relaxed">{estimate.tier.summary}</p>
            </div>

            {/* Area & Floors Controls */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="builtup-area-input"
                    className="text-xs font-semibold uppercase tracking-wider text-[#26232A]/75"
                  >
                    Built-Up Area (sq.ft)
                  </label>
                  <span className="text-sm font-bold text-[#26232A] tabular-nums">
                    {estimate.areaSqFt.toLocaleString('en-IN')} sq.ft
                  </span>
                </div>
                <div className="py-1.5">
                  <input
                    id="builtup-area-range"
                    type="range"
                    min={600}
                    max={8000}
                    step={100}
                    aria-label="Built-up area slider"
                    value={Math.min(8000, estimate.areaSqFt)}
                    onChange={(e) => setAreaSqFt(Number(e.target.value))}
                    className="w-full h-7 accent-[#D43F17] cursor-pointer"
                  />
                </div>
                <input
                  id="builtup-area-input"
                  type="number"
                  inputMode="numeric"
                  min={600}
                  max={25000}
                  step={50}
                  value={areaSqFt}
                  onChange={(e) => setAreaSqFt(Number(e.target.value) || 600)}
                  className="mt-1.5 w-full min-h-[44px] px-3.5 py-2 text-base sm:text-sm bg-white border border-[#E6E4EB] rounded-lg tabular-nums focus:outline-none focus:border-[#D43F17]"
                />
              </div>

              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-[#26232A]/75 mb-2">
                  Number of Floors
                </span>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((f) => {
                    const active = floors === f;
                    const label = f === 1 ? 'G' : `G+${f - 1}`;
                    return (
                      <motion.button
                        key={f}
                        type="button"
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setFloors(f)}
                        className={`min-h-[44px] py-2.5 text-sm font-semibold rounded-lg border transition-colors cursor-pointer tabular-nums ${
                          active
                            ? 'bg-[#D43F17] text-white border-[#D43F17]'
                            : 'bg-white text-[#26232A] border-[#E6E4EB] hover:border-[#D43F17]/60'
                        }`}
                      >
                        {label}
                      </motion.button>
                    );
                  })}
                </div>
                <p className="mt-2.5 text-xs text-[#26232A]/70 tabular-nums">
                  Est. Delivery Timeline: <strong className="text-[#26232A]">{estimate.estimatedMonths} months</strong>
                </p>
              </div>
            </div>

            {/* Optional Engineering & Interior Add-ons */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="min-h-[56px] flex items-start gap-3 p-3.5 rounded-xl bg-white border border-[#E6E4EB] cursor-pointer hover:border-[#D43F17]/50">
                <input
                  type="checkbox"
                  checked={includeSoilAndStructural}
                  onChange={(e) => setIncludeSoilAndStructural(e.target.checked)}
                  className="mt-0.5 w-5 h-5 accent-[#D43F17] rounded cursor-pointer shrink-0"
                />
                <span className="text-xs sm:text-sm">
                  <strong className="block font-semibold text-[#26232A]">
                    Soil Test &amp; Structural Drawings
                  </strong>
                  <span className="text-[#26232A]/70 tabular-nums">
                    +{formatINR(45000 + (floors - 1) * 15000)}
                  </span>
                </span>
              </label>

              <label className="min-h-[56px] flex items-start gap-3 p-3.5 rounded-xl bg-white border border-[#E6E4EB] cursor-pointer hover:border-[#D43F17]/50">
                <input
                  type="checkbox"
                  checked={includeInteriorDesign}
                  onChange={(e) => setIncludeInteriorDesign(e.target.checked)}
                  className="mt-0.5 w-5 h-5 accent-[#D43F17] rounded cursor-pointer shrink-0"
                />
                <span className="text-xs sm:text-sm">
                  <strong className="block font-semibold text-[#26232A]">
                    Turnkey Interior Package
                  </strong>
                  <span className="text-[#26232A]/70 tabular-nums">
                    +₹450 / sq.ft ({formatINR(estimate.areaSqFt * 450)})
                  </span>
                </span>
              </label>
            </div>

            {/* Output Summary & Milestones */}
            <div className="mt-6 p-5 sm:p-6 rounded-xl bg-[#26232A] text-white">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 pb-5 border-b border-white/15">
                <div>
                  <span className="text-xs uppercase tracking-wider text-white/70">
                    Indicative Total Project Investment
                  </span>
                  <div
                    data-testid="estimator-total"
                    className="mt-1 font-display font-extrabold text-3xl sm:text-4xl text-white tabular-nums"
                  >
                    <AnimatedINR value={estimate.totalEstimatedCost} formatter={formatINR} />
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-xs text-white/70 block">Effective All-In Rate</span>
                  <span className="text-lg font-bold text-[#F05228] tabular-nums">
                    <AnimatedINR value={estimate.effectiveRatePerSqFt} formatter={formatINR} /> / sq.ft
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-3 text-xs">
                {estimate.milestones.map((m) => (
                  <div key={m.label} className="space-y-1">
                    <span className="text-white/65 block">{m.label}</span>
                    <span className="font-semibold text-white tabular-nums block">
                      <AnimatedINR value={m.amount} formatter={formatINR} />{' '}
                      <span className="text-white/60">({m.percentage}%)</span>
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="inline-flex items-center gap-1.5 text-xs text-white/75">
                  <Check className="w-4 h-4 text-[#F05228] shrink-0" aria-hidden="true" />
                  <span>Includes 10-Year Structural Warranty &amp; 1-Year Maintenance</span>
                </span>
                <BuiltexButton
                  onClick={handleCarryEstimate}
                  variant="accent-light"
                  className="w-full sm:w-auto min-h-[48px] px-5 py-2.5 text-sm"
                >
                  Lock Estimate in Quote
                </BuiltexButton>
              </div>
            </div>
          </RevealBlock>
        </div>
      </div>
    </section>
  );
}
