import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import {
  ArrowUpRight,
  Building2,
  Languages,
  RotateCcw,
  Send,
  X,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  CHAT_STARTER_QUESTIONS_BY_LANG,
  parseChatSegments,
  type ChatLanguage,
  type ChatMessage,
} from '../utils/chatKnowledge';
import { ARCHITECTURAL_EASE } from './MotionPrimitives';

interface ConstructionChatbotProps {
  onBookConsultation: () => void;
}

/**
 * Custom Briicks-themed chatbot headset icon matching the uploaded bot design
 * in Briicks Properties' warm orange, crimson, obsidian, and stone palette.
 */
function ConstructionAdvisorIcon({ className = 'w-10 h-10' }: { className?: string }) {
  const uid = useId().replace(/:/g, '');
  const headClipId = `briicks-bot-head-${uid}`;
  const bezelClipId = `briicks-bot-bezel-${uid}`;
  const visorClipId = `briicks-bot-visor-${uid}`;

  return (
    <svg
      viewBox="0 0 64 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={headClipId}>
          <path d="M14.5 29C14.5 16.85 22.33 10 32 10C41.67 10 49.5 16.85 49.5 29C49.5 39.2 42.15 44.5 32 44.5C21.85 44.5 14.5 39.2 14.5 29Z" />
        </clipPath>
        <clipPath id={bezelClipId}>
          <rect x="20" y="19.5" width="24" height="17" rx="8.5" />
        </clipPath>
        <clipPath id={visorClipId}>
          <rect x="22.4" y="21.9" width="19.2" height="12.2" rx="6.1" />
        </clipPath>
      </defs>

      {/* Twin antennas */}
      <rect x="16" y="10.5" width="4" height="13" rx="2" fill="#19171C" />
      <rect x="44" y="10.5" width="4" height="13" rx="2" fill="#19171C" />

      {/* Left & right headset earcups in Briicks orange / crimson */}
      <rect x="9.5" y="22.5" width="9.5" height="16.5" rx="4.75" fill="#F05228" />
      <rect x="45" y="22.5" width="9.5" height="16.5" rx="4.75" fill="#D43F17" />

      {/* Curved boom microphone + capsule tip */}
      <path
        d="M52.8 34.5V40.8C52.8 46.8 48.2 50.6 41.8 50.6H38.5"
        stroke="#19171C"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="30.2" y="47.2" width="10.2" height="6.8" rx="3.4" fill="#19171C" />

      {/* Robot head dome with vertical two-tone stone/white shading */}
      <g clipPath={`url(#${headClipId})`}>
        <rect x="14" y="9" width="18" height="36" fill="#FFFFFF" />
        <rect x="32" y="9" width="18" height="36" fill="#E8E5EE" />
      </g>
      <path
        d="M14.5 29C14.5 16.85 22.33 10 32 10C41.67 10 49.5 16.85 49.5 29C49.5 39.2 42.15 44.5 32 44.5C21.85 44.5 14.5 39.2 14.5 29Z"
        stroke="#26232A"
        strokeOpacity="0.14"
        strokeWidth="1"
      />

      {/* Visor bezel with vertical two-tone shading */}
      <g clipPath={`url(#${bezelClipId})`}>
        <rect x="19" y="19" width="13" height="18" fill="#EFEDF4" />
        <rect x="32" y="19" width="13" height="18" fill="#DBD7E3" />
      </g>

      {/* Dark obsidian visor face */}
      <g clipPath={`url(#${visorClipId})`}>
        <rect x="22" y="21" width="10" height="14" fill="#26232A" />
        <rect x="32" y="21" width="10" height="14" fill="#19171C" />
      </g>

      {/* Glowing Briicks orange pill eyes */}
      <rect x="26.1" y="25.4" width="3.3" height="5.2" rx="1.65" fill="#FF6F47" />
      <rect x="34.6" y="25.4" width="3.3" height="5.2" rx="1.65" fill="#F05228" />
    </svg>
  );
}

const UI_COPY: Record<
  ChatLanguage,
  {
    drawerTitle: string;
    drawerSubtitle: string;
    welcome: string;
    youLabel: string;
    advisorLabel: string;
    quickTopicsHeading: string;
    loadingText: string;
    inputPlaceholder: string;
    visitPrompt: string;
    visitButton: string;
    networkError: string;
    fallbackError: string;
  }
> = {
  en: {
    drawerTitle: 'Construction & Cost Advisor',
    drawerSubtitle: 'Rates, Soil Testing, Structural Design & JV',
    welcome:
      'Welcome to Briicks Properties. Select English or தமிழ் above and ask anything about construction rates (starting ₹2,350/sq.ft), soil testing, structural plans, renovations, or Chennai Joint Ventures.',
    youLabel: 'YOU',
    advisorLabel: 'BRIICKS ENGINEER',
    quickTopicsHeading: 'Popular Construction Questions',
    loadingText: 'Preparing engineering guidance...',
    inputPlaceholder: 'Ask about cost, soil testing, floor plans...',
    visitPrompt: 'Need a site engineer inspection in Chennai?',
    visitButton: 'Book Free Site Visit',
    networkError: 'Network connection interrupted. Please try sending your question again.',
    fallbackError: 'Unable to answer right now. Please try again.',
  },
  ta: {
    drawerTitle: 'கட்டுமான & செலவு ஆலோசகர்',
    drawerSubtitle: 'சதுர அடி கட்டணம், மண் பரிசோதனை, பிளான் & JV',
    welcome:
      'வணக்கம்! பிரிக்ஸ் ப்ராப்பர்டீஸ் (Briicks Properties) கட்டுமான ஆலோசகர். சதுர அடி ₹2,350 முதல் வீடு கட்டும் கட்டணம், மண் பரிசோதனை, பிளான் மற்றும் Joint Venture குறித்த உங்கள் சந்தேகங்களை தமிழில் கேளுங்கள்.',
    youLabel: 'நீங்கள்',
    advisorLabel: 'பிரிக்ஸ் பொறியாளர்',
    quickTopicsHeading: 'அடிக்கடி கேட்கப்படும் கேள்விகள்',
    loadingText: 'பொறியியல் விவரங்களை தயார் செய்கிறது...',
    inputPlaceholder: 'வீடு கட்டும் செலவு, மண் பரிசோதனை பற்றி கேளுங்கள்...',
    visitPrompt: 'சென்னையில் இலவச தளப் பார்வை வேண்டுமா?',
    visitButton: 'தளப் பார்வை முன்பதிவு',
    networkError: 'இணைய இணைப்பு துண்டிக்கப்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.',
    fallbackError: 'தற்போது பதில் அளிக்க முடியவில்லை. சிறிது நேரம் கழித்து முயற்சிக்கவும்.',
  },
};

export function ConstructionChatbot({ onBookConsultation }: ConstructionChatbotProps) {
  const prefersReducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<ChatLanguage>('en');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', text: UI_COPY.en.welcome },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollEndRef = useRef<HTMLDivElement>(null);

  const copy = UI_COPY[language];
  const starterQuestions = CHAT_STARTER_QUESTIONS_BY_LANG[language];

  useEffect(() => {
    if (!open) return;
    if (messages.length > 1 || loading) {
      scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, loading]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const handleLanguageChange = (nextLang: ChatLanguage) => {
    if (nextLang === language) return;
    setLanguage(nextLang);
    setError(null);
    // Keep initial greeting synced with chosen language before any user messages exist
    setMessages((prev) =>
      prev.length === 1 && prev[0].role === 'assistant'
        ? [{ role: 'assistant', text: UI_COPY[nextLang].welcome }]
        : prev
    );
  };

  const sendMessage = async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || loading) return;

    const historySnapshot = messages;
    const userMessage: ChatMessage = { role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          language,
          history: historySnapshot.slice(1),
        }),
      });

      const payload = (await response.json()) as { reply?: string; error?: string };

      if (!response.ok || !payload.reply) {
        setError(payload.error || copy.fallbackError);
        return;
      }

      setMessages((prev) => [...prev, { role: 'assistant', text: payload.reply! }]);
    } catch {
      setError(copy.networkError);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const handleReset = () => {
    setMessages([{ role: 'assistant', text: UI_COPY[language].welcome }]);
    setError(null);
    setInput('');
  };

  return (
    <>
      {/* Architectural Studio Backdrop + Slide-Over Side Drawer */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-[#19171C]/45 backdrop-blur-[2px]"
              aria-hidden="true"
            />

            <motion.aside
              data-testid="construction-chatbot-panel"
              aria-label="Briicks Construction Q&A Assistant"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.28, ease: ARCHITECTURAL_EASE }}
              className="relative z-10 w-full sm:w-[440px] h-[100dvh] sm:h-[calc(100dvh-2rem)] sm:my-4 sm:mr-4 bg-white sm:rounded-2xl border border-[#E6E4EB] shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Architectural Blueprint Top Deck */}
              <div
                className="bg-[#19171C] text-white px-4 sm:px-5 pt-4 pb-4 border-b border-white/10 space-y-3"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              >
                {/* Row 1: Uploaded Briicks Brand Plaque + Language Switcher + Drawer Controls */}
                <div className="flex items-center justify-between gap-2">
                  <div className="bg-white px-2 py-1 rounded-lg shrink-0">
                    <img
                      src="/assets/aistudio/BRIICKS_Properties_Rising_Above_Logo_f405ac32.png"
                      alt="Briicks Properties — Rising Above"
                      className="h-5 sm:h-6 w-auto object-contain block"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <div
                      role="group"
                      aria-label="Select chatbot language"
                      className="inline-flex items-center p-0.5 bg-[#26232A] border border-white/15 rounded-lg shrink-0"
                    >
                      <Languages className="w-3 h-3 text-[#F05228] ml-1.5 mr-0.5 hidden sm:block shrink-0" aria-hidden="true" />
                      <button
                        type="button"
                        data-testid="chatbot-lang-en"
                        aria-pressed={language === 'en'}
                        onClick={() => handleLanguageChange('en')}
                        className={`min-h-[34px] px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          language === 'en'
                            ? 'bg-[#D43F17] text-white'
                            : 'text-white/75 hover:text-white'
                        }`}
                      >
                        EN
                      </button>
                      <button
                        type="button"
                        data-testid="chatbot-lang-ta"
                        aria-pressed={language === 'ta'}
                        onClick={() => handleLanguageChange('ta')}
                        className={`min-h-[34px] px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          language === 'ta'
                            ? 'bg-[#D43F17] text-white'
                            : 'text-white/75 hover:text-white'
                        }`}
                      >
                        தமிழ்
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleReset}
                      aria-label="Reset conversation"
                      title="Reset conversation"
                      className="w-10 h-10 rounded-lg border border-white/15 flex items-center justify-center text-white/75 hover:text-white hover:border-white/35 transition-colors cursor-pointer shrink-0"
                    >
                      <RotateCcw className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      aria-label="Close construction assistant"
                      className="w-10 h-10 rounded-lg border border-white/15 flex items-center justify-center text-white/75 hover:text-white hover:border-[#F05228] hover:bg-[#F05228]/15 transition-colors cursor-pointer shrink-0"
                    >
                      <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Row 2: Title + Subtitle */}
                <div className="min-w-0">
                  <h3 className="font-display font-bold text-base text-white leading-snug">
                    {copy.drawerTitle}
                  </h3>
                  <p className="text-xs text-white/65 truncate">{copy.drawerSubtitle}</p>
                </div>
              </div>

              {/* Editorial Transcript Feed */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-white">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] font-semibold tracking-widest uppercase text-[#26232A]/45 mb-1 px-1">
                      {msg.role === 'user' ? copy.youLabel : copy.advisorLabel}
                    </span>

                    <div
                      className={`max-w-[90%] rounded-xl px-4 py-3 text-[13px] sm:text-[13.5px] leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-[#19171C] text-white'
                          : 'bg-[#F7F7F9] text-[#26232A] border border-[#E6E4EB]'
                      }`}
                    >
                      {parseChatSegments(msg.text).map((seg, sIdx) =>
                        seg.bold ? (
                          <strong key={sIdx} className="font-semibold">
                            {seg.text}
                          </strong>
                        ) : (
                          <span key={sIdx}>{seg.text}</span>
                        )
                      )}
                    </div>
                  </div>
                ))}

                {/* Language-Specific Quick Topic Grid */}
                {messages.length === 1 && !loading && (
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#26232A]/55">
                      <Building2 className="w-3.5 h-3.5 text-[#D43F17]" aria-hidden="true" />
                      <span>{copy.quickTopicsHeading}</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {starterQuestions.map((question, qIdx) => (
                        <button
                          key={question}
                          type="button"
                          onClick={() => void sendMessage(question)}
                          className="group min-h-[44px] text-left px-3.5 py-2.5 text-[13px] font-medium text-[#26232A] bg-[#F7F7F9] hover:bg-white border border-[#E6E4EB] hover:border-[#D43F17] rounded-xl transition-colors flex items-center justify-between gap-2.5 cursor-pointer"
                        >
                          <span className="leading-snug">
                            <span className="text-[#D43F17] font-bold tabular-nums mr-2">
                              0{qIdx + 1}.
                            </span>
                            {question}
                          </span>
                          <ArrowUpRight
                            className="w-3.5 h-3.5 text-[#26232A]/40 group-hover:text-[#D43F17] shrink-0 transition-colors"
                            aria-hidden="true"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] font-semibold tracking-widest uppercase text-[#26232A]/45 mb-1 px-1">
                      {copy.advisorLabel}
                    </span>
                    <div className="bg-[#F7F7F9] border border-[#E6E4EB] rounded-xl px-4 py-3 text-xs text-[#26232A]/75">
                      {copy.loadingText}
                    </div>
                  </div>
                )}

                {error && (
                  <div
                    role="alert"
                    className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900"
                  >
                    {error}
                  </div>
                )}

                <div ref={scrollEndRef} />
              </div>

              {/* Studio Composer Dock */}
              <div className="border-t border-[#E6E4EB] bg-[#F7F7F9] p-3.5 sm:p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[#26232A]/70 truncate">
                    {copy.visitPrompt}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onBookConsultation();
                    }}
                    className="py-1 text-xs font-semibold text-[#D43F17] hover:text-[#B83210] underline whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {copy.visitButton}
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                  <label htmlFor="chatbot-question-input" className="sr-only">
                    {copy.inputPlaceholder}
                  </label>
                  <input
                    id="chatbot-question-input"
                    type="text"
                    placeholder={copy.inputPlaceholder}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={loading}
                    className="flex-1 min-w-0 min-h-[44px] px-3.5 py-2.5 text-base sm:text-sm bg-white border border-[#E6E4EB] rounded-xl focus:outline-none focus:border-[#D43F17]"
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    aria-label="Send message"
                    className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#D43F17] hover:bg-[#B83210] disabled:opacity-50 text-white transition-colors shrink-0 cursor-pointer"
                  >
                    <Send className="w-4 h-4" aria-hidden="true" />
                  </button>
                </form>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Icon-Only Chatbot Launcher */}
      {!open && (
        <motion.div
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40"
          animate={prefersReducedMotion ? undefined : { y: [0, -6, 0] }}
          transition={
            prefersReducedMotion
              ? undefined
              : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          <motion.button
            type="button"
            data-testid="chatbot-launcher-btn"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-label="Open construction Q&A assistant in English or Tamil"
            title="Open Briicks Construction Advisor (EN / தமிழ்)"
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.94 }}
            transition={{ duration: 0.18, ease: ARCHITECTURAL_EASE }}
            className="group relative w-14 h-14 sm:w-16 sm:h-16 rounded-full inline-flex items-center justify-center bg-[#FAF9FB] border-2 border-[#F05228]/75 hover:border-[#F05228] shadow-[0_14px_32px_-6px_rgba(25,23,28,0.34),0_6px_16px_-2px_rgba(240,82,40,0.28)] cursor-pointer transition-colors"
          >
            <ConstructionAdvisorIcon className="w-10 h-10 sm:w-11 sm:h-11 transition-transform duration-200 group-hover:scale-105" />
          </motion.button>
        </motion.div>
      )}
    </>
  );
}
