import { useState, useEffect, type FormEvent } from 'react';
import { CheckCircle2, Loader2, Lock, Mail, MapPin, PhoneCall, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { BRAND_INFO, SERVICES } from '../data/briicksData';
import {
  formatFriendlyFirestoreError,
  submitAppointment,
  subscribeToNewsletter,
} from '../lib/firebase';
import {
  APPOINTMENT_LIMITS,
  validateConsultationForm,
  validateNewsletterEmail,
  type ConsultationFormErrors,
  type ConsultationFormValues,
} from '../utils/estimator';
import { AdminInquiriesModal } from './AdminInquiriesModal';
import {
  ARCHITECTURAL_EASE,
  BuiltexButton,
  BuiltexSplitHeading,
  RevealBlock,
} from './MotionPrimitives';
import { OfficeLocationMap } from './OfficeLocationMap';

interface ContactFooterSectionProps {
  preselectedService: string;
  prefilledMessage: string;
  onSelectLocationForQuote: (locationSummary: string) => void;
}

export function ContactFooterSection({
  preselectedService,
  prefilledMessage,
  onSelectLocationForQuote,
}: ContactFooterSectionProps) {
  const normalizeServiceOption = (svc: string) =>
    svc === 'New Constructions' ? 'New Construction' : svc;

  const [formValues, setFormValues] = useState<ConsultationFormValues>({
    name: '',
    email: '',
    phone: '',
    service: normalizeServiceOption(preselectedService) || 'New Construction',
    message: prefilledMessage || '',
  });
  const [errors, setErrors] = useState<ConsultationFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [submittedSnapshot, setSubmittedSnapshot] = useState<ConsultationFormValues | null>(null);

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'submitting' | 'error' | 'subscribed'>('idle');
  const [newsletterError, setNewsletterError] = useState<string | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  useEffect(() => {
    if (preselectedService) {
      setFormValues((prev) => ({ ...prev, service: normalizeServiceOption(preselectedService) }));
      setSubmittedRef(null);
      setSubmitError(null);
    }
  }, [preselectedService]);

  useEffect(() => {
    if (prefilledMessage) {
      setFormValues((prev) => ({ ...prev, message: prefilledMessage }));
      setSubmittedRef(null);
      setSubmitError(null);
    }
  }, [prefilledMessage]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validateConsultationForm(formValues);
    setErrors(validationErrors);
    setSubmitError(null);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitAppointment(formValues);
      setSubmittedSnapshot(result.snapshot);
      setSubmittedRef(result.referenceCode);
    } catch (err) {
      setSubmitError(formatFriendlyFirestoreError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedRef(null);
    setSubmittedSnapshot(null);
    setSubmitError(null);
    setErrors({});
    setFormValues({
      name: '',
      email: '',
      phone: '',
      service: 'New Construction',
      message: '',
    });
  };

  const handleNewsletterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setNewsletterError(null);
    if (!validateNewsletterEmail(newsletterEmail)) {
      setNewsletterStatus('error');
      setNewsletterError('Please enter a valid email address.');
      return;
    }

    setNewsletterStatus('submitting');
    try {
      await subscribeToNewsletter(newsletterEmail);
      setNewsletterStatus('subscribed');
      setNewsletterEmail('');
    } catch (err) {
      setNewsletterStatus('error');
      setNewsletterError(formatFriendlyFirestoreError(err));
    }
  };

  const serviceOptions = [
    'New Construction',
    'Turnkey House Construction',
    'Interior Design & Works',
    'Building Renovations',
    'Structural Planning',
    'Architectural Planning',
    'Joint Venture',
  ];

  return (
    <>
      {/* Consultation & Quote Section */}
      <section id="contact" className="scroll-mt-14 sm:scroll-mt-16 py-14 sm:py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-start">
            {/* Left Column: Chennai Office & Direct Contact */}
            <RevealBlock className="lg:col-span-5 space-y-5 sm:space-y-6">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-[#D43F17]">
                  Book An Appointment
                </p>
                <BuiltexSplitHeading
                  as="h2"
                  segments={[{ text: 'Request Your Construction Quote Today' }]}
                  className="mt-2.5 sm:mt-3 font-display font-bold text-[#26232A] tracking-tight leading-tight"
                  style={{ fontSize: 'clamp(1.75rem, 3vw, 2.75rem)', textWrap: 'balance' }}
                />
                <p className="mt-3.5 sm:mt-4 text-[15px] sm:text-base text-[#26232A]/75 leading-relaxed">
                  Speak directly with our senior civil engineers in Anna Nagar East for plot
                  inspections, joint-venture feasibility, or a customized turnkey cost sheet.
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4 pt-4 border-t border-[#E6E4EB]">
                <a
                  href={BRAND_INFO.phoneHref}
                  className="min-h-[56px] flex items-start gap-3.5 p-4 rounded-xl bg-[#F7F7F9] border border-[#E6E4EB] hover:border-[#D43F17]/60 transition-colors"
                >
                  <PhoneCall className="w-5 h-5 text-[#D43F17] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#26232A]/65 block">
                      Direct Engineering Desk
                    </span>
                    <span className="text-base font-bold text-[#26232A] tabular-nums">
                      {BRAND_INFO.phoneDisplay}
                    </span>
                  </div>
                </a>

                <a
                  href={`mailto:${BRAND_INFO.email}`}
                  className="min-h-[56px] flex items-start gap-3.5 p-4 rounded-xl bg-[#F7F7F9] border border-[#E6E4EB] hover:border-[#D43F17]/60 transition-colors"
                >
                  <Mail className="w-5 h-5 text-[#D43F17] shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="min-w-0">
                    <span className="text-xs uppercase tracking-wider text-[#26232A]/65 block">
                      Email Specifications
                    </span>
                    <span className="text-sm sm:text-base font-semibold text-[#26232A] break-all">
                      {BRAND_INFO.email}
                    </span>
                  </div>
                </a>

                <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#F7F7F9] border border-[#E6E4EB]">
                  <MapPin className="w-5 h-5 text-[#D43F17] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#26232A]/65 block">
                      Chennai Office
                    </span>
                    <span className="text-sm text-[#26232A]/85 leading-relaxed block mt-0.5">
                      {BRAND_INFO.address}
                    </span>
                  </div>
                </div>
              </div>
            </RevealBlock>

            {/* Right Column: Validated Consultation Form */}
            <RevealBlock delay={0.1} className="lg:col-span-7 bg-[#F7F7F9] rounded-2xl border border-[#E6E4EB] p-5 sm:p-8">
              {submittedRef && submittedSnapshot ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: ARCHITECTURAL_EASE }}
                  role="status"
                  aria-live="polite"
                  className="bg-white rounded-xl border border-[#E6E4EB] p-6 sm:p-8 space-y-5"
                >
                  <div className="flex items-center gap-3 text-[#D43F17]">
                    <CheckCircle2 className="w-7 h-7 shrink-0" aria-hidden="true" />
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider block">
                        Appointment Request Saved
                      </span>
                      <h3 className="font-display font-bold text-xl text-[#26232A]">
                        Thank you, {submittedSnapshot.name}
                      </h3>
                    </div>
                  </div>

                  <p className="text-sm text-[#26232A]/80 leading-relaxed">
                    Our Chennai engineering team has received your inquiry for{' '}
                    <strong className="text-[#26232A]">{submittedSnapshot.service}</strong>. We will
                    reach out on <strong className="tabular-nums">{submittedSnapshot.phone}</strong>{' '}
                    within 1 business day to schedule your site review.
                  </p>

                  <div className="p-4 rounded-lg bg-[#F7F7F9] border border-[#E6E4EB] text-xs text-[#26232A]/80 space-y-1.5">
                    <div>
                      <span className="font-semibold text-[#26232A]">Reference ID:</span>{' '}
                      <span className="tabular-nums font-bold text-[#D43F17]">{submittedRef}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#26232A]">Email:</span>{' '}
                      {submittedSnapshot.email}
                    </div>
                    {submittedSnapshot.message && (
                      <div>
                        <span className="font-semibold text-[#26232A]">Project Notes:</span>{' '}
                        {submittedSnapshot.message}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full sm:w-auto min-h-[46px] inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#26232A] hover:bg-[#D43F17] rounded-lg transition-colors cursor-pointer"
                  >
                    Submit Another Request
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <label
                        htmlFor="quote-name"
                        className="block text-xs font-semibold uppercase tracking-wider text-[#26232A]/80 mb-1.5"
                      >
                        Full Name *
                      </label>
                      <input
                        id="quote-name"
                        type="text"
                        required
                        autoComplete="name"
                        placeholder="e.g. Karthik Subramanian"
                        value={formValues.name}
                        onChange={(e) => {
                          setFormValues((p) => ({ ...p, name: e.target.value }));
                          if (errors.name) setErrors((ePrev) => ({ ...ePrev, name: undefined }));
                        }}
                        className="w-full min-h-[46px] px-4 py-3 text-base sm:text-sm bg-white border border-[#E6E4EB] rounded-lg focus:outline-none focus:border-[#D43F17]"
                      />
                      {errors.name && (
                        <p className="mt-1.5 text-xs font-medium text-[#B83210]" role="alert">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="quote-email"
                        className="block text-xs font-semibold uppercase tracking-wider text-[#26232A]/80 mb-1.5"
                      >
                        Email Address *
                      </label>
                      <input
                        id="quote-email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={formValues.email}
                        onChange={(e) => {
                          setFormValues((p) => ({ ...p, email: e.target.value }));
                          if (errors.email) setErrors((ePrev) => ({ ...ePrev, email: undefined }));
                        }}
                        className="w-full min-h-[46px] px-4 py-3 text-base sm:text-sm bg-white border border-[#E6E4EB] rounded-lg focus:outline-none focus:border-[#D43F17]"
                      />
                      {errors.email && (
                        <p className="mt-1.5 text-xs font-medium text-[#B83210]" role="alert">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <label
                        htmlFor="quote-phone"
                        className="block text-xs font-semibold uppercase tracking-wider text-[#26232A]/80 mb-1.5"
                      >
                        Phone Number *
                      </label>
                      <input
                        id="quote-phone"
                        type="tel"
                        inputMode="tel"
                        required
                        autoComplete="tel"
                        placeholder="+91 96008 10952"
                        value={formValues.phone}
                        onChange={(e) => {
                          setFormValues((p) => ({ ...p, phone: e.target.value }));
                          if (errors.phone) setErrors((ePrev) => ({ ...ePrev, phone: undefined }));
                        }}
                        className="w-full min-h-[46px] px-4 py-3 text-base sm:text-sm bg-white border border-[#E6E4EB] rounded-lg tabular-nums focus:outline-none focus:border-[#D43F17]"
                      />
                      {errors.phone && (
                        <p className="mt-1.5 text-xs font-medium text-[#B83210]" role="alert">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="quote-service"
                        className="block text-xs font-semibold uppercase tracking-wider text-[#26232A]/80 mb-1.5"
                      >
                        Service Required *
                      </label>
                      <select
                        id="quote-service"
                        value={formValues.service}
                        onChange={(e) => {
                          setFormValues((p) => ({ ...p, service: e.target.value }));
                          if (errors.service) {
                            setErrors((ePrev) => ({ ...ePrev, service: undefined }));
                          }
                        }}
                        className="w-full min-h-[46px] px-4 py-3 text-base sm:text-sm bg-white border border-[#E6E4EB] rounded-lg focus:outline-none focus:border-[#D43F17]"
                      >
                        {serviceOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      {errors.service && (
                        <p className="mt-1.5 text-xs font-medium text-[#B83210]" role="alert">
                          {errors.service}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="quote-message"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#26232A]/80 mb-1.5"
                    >
                      Plot Location &amp; Project Details
                    </label>
                    <textarea
                      id="quote-message"
                      rows={4}
                      maxLength={APPOINTMENT_LIMITS.messageMax}
                      placeholder="Share your plot size, location in Chennai, number of floors, or expected start timeline..."
                      value={formValues.message}
                      onChange={(e) => {
                        setFormValues((p) => ({ ...p, message: e.target.value }));
                        if (errors.message) setErrors((ePrev) => ({ ...ePrev, message: undefined }));
                      }}
                      className="w-full px-4 py-3 text-base sm:text-sm bg-white border border-[#E6E4EB] rounded-lg focus:outline-none focus:border-[#D43F17]"
                    />
                    {errors.message && (
                      <p className="mt-1.5 text-xs font-medium text-[#B83210]" role="alert">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {submitError && (
                    <div
                      className="p-3.5 rounded-lg bg-[#FFF1EC] border border-[#F05228]/35 text-xs font-medium text-[#B83210]"
                      role="alert"
                    >
                      {submitError}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pt-2">
                    <span className="text-xs text-[#26232A]/65">
                      Saved securely to Briicks Properties inquiry desk for review by our engineers.
                    </span>
                    <BuiltexButton
                      type="submit"
                      variant="accent-dark"
                      disabled={isSubmitting}
                      showArrow={!isSubmitting}
                      className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 text-sm disabled:opacity-65"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                          <span>Saving Request...</span>
                        </>
                      ) : (
                        'Submit Consultation Request'
                      )}
                    </BuiltexButton>
                  </div>
                </form>
              )}
            </RevealBlock>
          </div>

          <OfficeLocationMap onSelectLocationForQuote={onSelectLocationForQuote} />
        </div>
      </section>

      {/* Builtex-Style Dark Structured Footer */}
      <footer className="bg-[#19171C] text-white border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-12 pb-24 sm:py-16">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 pb-10 sm:pb-12 border-b border-white/12">
            {/* Brand & Contact Column */}
            <RevealBlock className="col-span-2 lg:col-span-4 space-y-4">
              <a
                href="#top"
                aria-label="Briicks Properties — Rising Above"
                className="inline-flex items-center bg-white px-3.5 py-2 rounded-xl hover:opacity-95 transition-opacity"
              >
                <img
                  src="/assets/aistudio/BRIICKS_Properties_Rising_Above_Logo_f405ac32.png"
                  alt="Briicks Properties — Rising Above"
                  className="h-9 sm:h-10 w-auto object-contain block"
                />
              </a>
              <p className="text-sm text-white/70 leading-relaxed max-w-sm">
                Combining innovative architectural planning with disciplined structural craftsmanship
                to deliver homes and commercial buildings built to last.
              </p>
              <div className="pt-2 space-y-2 text-sm text-white/80">
                <div>
                  <a href={BRAND_INFO.phoneHref} className="inline-block py-0.5 hover:text-[#F05228] tabular-nums">
                    {BRAND_INFO.phoneDisplay}
                  </a>
                </div>
                <div>
                  <a href={`mailto:${BRAND_INFO.email}`} className="inline-block py-0.5 hover:text-[#F05228] break-all">
                    {BRAND_INFO.email}
                  </a>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">{BRAND_INFO.address}</p>
              </div>
            </RevealBlock>

            {/* Quick Links */}
            <RevealBlock delay={0.08} className="col-span-1 lg:col-span-2">
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-white mb-3.5 sm:mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li>
                  <a href="#top" className="inline-block py-1 hover:text-white transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#about" className="inline-block py-1 hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#services" className="inline-block py-1 hover:text-white transition-colors">
                    Our Services
                  </a>
                </li>
                <li>
                  <a href="#estimator" className="inline-block py-1 hover:text-white transition-colors">
                    Cost Estimator
                  </a>
                </li>
                <li>
                  <a href="#projects" className="inline-block py-1 hover:text-white transition-colors">
                    Projects
                  </a>
                </li>
                <li>
                  <a href="#contact" className="inline-block py-1 hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </RevealBlock>

            {/* Our Services */}
            <RevealBlock delay={0.14} className="col-span-1 lg:col-span-3">
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-white mb-3.5 sm:mb-4">
                Our Services
              </h3>
              <ul className="space-y-2 text-sm text-white/70">
                {SERVICES.slice(0, 5).map((service) => (
                  <li key={service.id}>
                    <a href="#services" className="inline-block py-1 hover:text-white transition-colors">
                      {service.title}
                    </a>
                  </li>
                ))}
              </ul>
            </RevealBlock>

            {/* Newsletter */}
            <RevealBlock delay={0.2} className="col-span-2 lg:col-span-3 space-y-4">
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-white">
                Project Updates
              </h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Subscribe for Chennai building cost guides, material insights, and completed site
                tours.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-2">
                <label htmlFor="footer-newsletter" className="sr-only">
                  Email address for project updates
                </label>
                <input
                  id="footer-newsletter"
                  type="email"
                  placeholder="Enter Email Address"
                  value={newsletterEmail}
                  onChange={(e) => {
                    setNewsletterEmail(e.target.value);
                    if (newsletterStatus !== 'idle') setNewsletterStatus('idle');
                  }}
                  className="flex-1 min-w-0 min-h-[44px] px-3.5 py-2.5 text-base sm:text-sm bg-[#26232A] border border-white/15 rounded-lg text-white placeholder:text-white/45 focus:outline-none focus:border-[#F05228]"
                />
                <button
                  type="submit"
                  disabled={newsletterStatus === 'submitting'}
                  aria-label="Subscribe to project updates"
                  className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-[#D43F17] hover:bg-[#B83210] text-white transition-colors shrink-0 cursor-pointer disabled:opacity-60"
                >
                  {newsletterStatus === 'submitting' ? (
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Send className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              </form>
              {newsletterStatus === 'error' && (
                <p className="text-xs text-[#F05228]" role="alert">
                  {newsletterError || 'Please enter a valid email address.'}
                </p>
              )}
              {newsletterStatus === 'subscribed' && (
                <p className="text-xs text-emerald-400" role="status">
                  Subscribed. You will receive our next Chennai construction guide.
                </p>
              )}
            </RevealBlock>
          </div>

          <div className="pt-7 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/55">
            <p>© {new Date().getFullYear()} Briicks Properties. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center gap-5">
              <button
                type="button"
                onClick={() => setIsAdminModalOpen(true)}
                className="inline-flex items-center gap-1.5 py-1.5 text-white/65 hover:text-[#F05228] transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Admin Leads</span>
              </button>
              <a
                href="https://www.facebook.com/briicks.official"
                target="_blank"
                rel="noreferrer"
                className="py-1.5 hover:text-white transition-colors"
              >
                Facebook
              </a>
              <a
                href="https://www.instagram.com/briicks_properties"
                target="_blank"
                rel="noreferrer"
                className="py-1.5 hover:text-white transition-colors"
              >
                Instagram
              </a>
              <a
                href="https://www.youtube.com/@BriicksProperties"
                target="_blank"
                rel="noreferrer"
                className="py-1.5 hover:text-white transition-colors"
              >
                YouTube
              </a>
            </div>
          </div>
        </div>
      </footer>

      <AdminInquiriesModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </>
  );
}
