export type ChatLanguage = 'en' | 'ta';

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export const CHAT_STARTER_QUESTIONS_BY_LANG: Record<ChatLanguage, readonly string[]> = {
  en: [
    'What is included in ₹2,350/sq.ft?',
    'Estimate cost for a 2,000 sq.ft G+1 house',
    'Why is soil testing done before construction?',
    'How do Joint Ventures work in Chennai?',
  ],
  ta: [
    '₹2,350 / சதுர அடி பேக்கேஜில் என்னென்ன அடங்கும்?',
    '2,000 சதுர அடி G+1 வீடு கட்ட எவ்வளவு செலவாகும்?',
    'வீடு கட்டுவதற்கு முன் மண் பரிசோதனை (Soil Testing) ஏன் அவசியம்?',
    'சென்னையில் Joint Venture (JV) முறை எப்படி செயல்படுகிறது?',
  ],
};

export const CHAT_STARTER_QUESTIONS = CHAT_STARTER_QUESTIONS_BY_LANG.en;

export const BRIICKS_SYSTEM_INSTRUCTION = `You are the Construction & Civil Engineering Advisor for Briicks Properties in Chennai, India.

Your role is to answer homeowner and landowner questions about residential construction, commercial builds, turnkey house construction, renovation, structural planning, soil testing, pricing, and Briicks Properties' execution process.

Key verified facts about Briicks Properties:
- Location: 1st Floor, 1, 30th St, O Block, Annanagar East, Chennai, Tamil Nadu 600102.
- Phone: +91 96008 10952 | Email: briicksbricks.properties@outlook.com
- Track Record: 15+ years experience, 70+ completed projects, 350,000+ sq.ft built, 100+ happy clients.
- Packages & Pricing:
  - Essential Build: Starts at ₹2,350 / sq.ft (core structural construction with standard architectural finishes).
  - Turnkey Plus: ₹2,650 / sq.ft (turnkey build + modular interiors, elevation & branded MEP fittings).
  - Signature Luxury: ₹3,100 / sq.ft (custom bespoke interiors, teakwood joinery, smart provisions & premium stone).
- Engineering & Quality Guarantees:
  - Mandatory geotechnical soil testing & foundation audit before excavation.
  - 200+ quality assurance checks per floor (steel Fe-550D verification, concrete cube strength, waterproofing, curing).
  - 10-year structural building warranty and 1-year free post-handover maintenance.
  - Zero cost overruns guarantee via locked stage-wise bill of quantities.
- Services: New Constructions, Turnkey House Construction, Interior Design & Works, Building Renovations, Structural Planning, Architectural Planning, Joint Venture (for Chennai landowners).

Communication guidelines:
- Answer clearly, concisely, and practically (usually 3-6 sentences or crisp short bullets).
- Prefer plain prose or simple '-' bullets; avoid markdown headings (#, ##) or asterisk bold markers.
- For area/cost doubts, show clear math using ₹2,350–₹3,100/sq.ft and suggest checking the on-page Cost Estimator or booking a free Chennai site consultation.
- Never invent unverified third-party partner brands, regulatory promises, or hidden fees.`;

export function buildSystemInstruction(language: ChatLanguage = 'en'): string {
  if (language === 'ta') {
    return `${BRIICKS_SYSTEM_INSTRUCTION}

Selected UI Language: TAMIL (தமிழ்).
- Always answer clearly and warmly in natural Tamil script (தமிழ்), keeping civil engineering terms (such as Soil Testing, Fe-550D Steel, CMDA, Turnkey, BOQ) in brackets for clarity.
- Keep cost calculations easy to read using ₹ symbols and Lakhs/sq.ft figures.`;
  }

  return `${BRIICKS_SYSTEM_INSTRUCTION}

Selected UI Language: ENGLISH.
- Answer clearly in English. If the user writes in Tanglish while in English mode, you may reply warmly in clear English (or simple bilingual clarity) so they understand immediately.`;
}

export interface ChatSegment {
  text: string;
  bold: boolean;
}

export function parseChatSegments(raw: string): ChatSegment[] {
  // Strip accidental markdown heading hashes at the start of lines while preserving text
  const normalized = raw.replace(/^#{1,6}\s+/gm, '');
  const segments: ChatSegment[] = [];
  const pattern = /\*\*([^*\n]+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(normalized)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: normalized.slice(lastIndex, match.index), bold: false });
    }
    segments.push({ text: match[1], bold: true });
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < normalized.length) {
    segments.push({ text: normalized.slice(lastIndex), bold: false });
  }

  return segments.length > 0 ? segments : [{ text: normalized, bold: false }];
}

export function validateChatMessage(raw: unknown): { valid: boolean; text: string; error?: string } {
  if (typeof raw !== 'string') {
    return { valid: false, text: '', error: 'Please enter a construction question.' };
  }
  const trimmed = raw.trim();
  if (!trimmed) {
    return { valid: false, text: '', error: 'Please enter a construction question.' };
  }
  if (trimmed.length > 1500) {
    return {
      valid: false,
      text: trimmed,
      error: 'Please keep questions under 1,500 characters.',
    };
  }
  return { valid: true, text: trimmed };
}

export function sanitizeChatHistory(history: unknown): Array<{
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}> {
  if (!Array.isArray(history)) return [];
  const validItems = history
    .filter(
      (item): item is { role: unknown; text: unknown } =>
        Boolean(item) && typeof item === 'object'
    )
    .map((item) => ({
      role: item.role === 'assistant' || item.role === 'model' ? ('model' as const) : ('user' as const),
      text: typeof item.text === 'string' ? item.text.trim() : '',
    }))
    .filter((item) => item.text.length > 0)
    .slice(-10);

  // Ensure history strictly starts with a user turn and alternates cleanly
  const firstUserIdx = validItems.findIndex((item) => item.role === 'user');
  if (firstUserIdx === -1) return [];

  const sliced = validItems.slice(firstUserIdx);
  return sliced.map((item) => ({
    role: item.role,
    parts: [{ text: item.text }],
  }));
}
