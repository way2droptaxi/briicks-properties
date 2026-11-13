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

  // Ensure history strictly starts with a user turn, alternates user -> model, and ends on a model turn
  // so appending the next user message via chat.sendMessage never produces consecutive same-role turns.
  const firstUserIdx = validItems.findIndex((item) => item.role === 'user');
  if (firstUserIdx === -1) return [];

  const sliced = validItems.slice(firstUserIdx);
  const alternating: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  for (const item of sliced) {
    const prev = alternating[alternating.length - 1];
    if (prev && prev.role === item.role) {
      prev.parts[0].text = `${prev.parts[0].text}\n${item.text}`;
      continue;
    }
    alternating.push({
      role: item.role,
      parts: [{ text: item.text }],
    });
  }

  if (alternating.length > 0 && alternating[alternating.length - 1].role === 'user') {
    alternating.pop();
  }

  return alternating;
}

function formatLakhsINR(amount: number): string {
  return new Intl.NumberFormat('en-IN').format(Math.round(amount));
}

function extractAreaSqFt(text: string): number | null {
  const areaMatch = text.replace(/,/g, '').match(/\b(\d{3,5})\s*(?:sq\.?\s*ft|sqft|sft|சதுர\s*அடி)?\b/i);
  if (!areaMatch) return null;
  const parsed = Number(areaMatch[1]);
  if (!Number.isFinite(parsed) || parsed < 400 || parsed > 50000) return null;
  return parsed;
}

export function buildOfflineConstructionReply(
  rawMessage: string,
  language: ChatLanguage = 'en'
): string {
  const lower = rawMessage.toLowerCase();
  const area = extractAreaSqFt(rawMessage);

  const isSoil =
    /soil|மண்|borehole|foundation|அடித்தளம்|geotech|testing|பரிசோதனை/.test(lower);
  const isJv =
    /\bjv\b|joint\s*venture|landowner|நில\s*உரிமையாளர்|கூட்டு/.test(lower);
  const isRenovation =
    /renovat|remodel|plumbing|electrical|புதுப்பிக்க|மறுசீரமை/.test(lower);
  const isInterior =
    /interior|kitchen|wardrobe|joinery|உள்\s*அலங்காரம்|இன்டீரியர்/.test(lower);
  const isWarranty =
    /warrant|quality|checks|qa|maintenance|வாரண்டி|தரம்|பராமரிப்பு/.test(lower);
  const isContact =
    /office|address|phone|call|contact|where|chennai|anna\s*nagar|அலுவலகம்|முகவரி|தொடர்பு|தொலைபேசி/.test(
      lower
    );
  const isCost =
    area !== null ||
    /rate|cost|price|estimate|budget|package|2350|2,350|sq\.?ft|sqft|செலவு|கட்டணம்|சதுர\s*அடி|பேக்கேஜ்/.test(
      lower
    );

  if (language === 'ta') {
    if (isSoil) {
      return `வீடு கட்டுவதற்கு முன் கட்டாய மண் பரிசோதனை (Soil Testing) மிகவும் அவசியம். இது நிலத்தின் தாங்கும் திறன் (Bearing Capacity) மற்றும் நிலத்தடி நீர் மட்டத்தை துல்லியமாக கண்டறிந்து சரியான அடித்தளம் (Foundation) அமைக்க உதவுகிறது.\n\n- எதிர்காலத்தில் சுவர் விரிசல் அல்லது கட்டிடம் இறங்குவதை (Settlement) முற்றிலும் தடுக்கும்.\n- தேவைக்கு அதிகமான கம்பி/கான்கிரீட் செலவை குறைத்து பாதுகாப்பான Structural Design அமைக்க உதவும்.\n- Briicks Properties-ல் ஒவ்வொரு திட்டத்திற்கும் 10 வருட Structural Warranty உடன் மண் பரிசோதனை செய்யப்படுகிறது. இலவச தளப் பார்வைக்கு +91 96008 10952 என்ற எண்ணில் அழைக்கவும்.`;
    }

    if (isJv) {
      return `சென்னையில் உள்ள நில உரிமையாளர்களுக்கு Briicks Properties வெளிப்படையான Joint Venture (JV) கூட்டுக் கட்டுமான சேவையை வழங்குகிறது:\n\n- CMDA / Corporation அனுமதி, 100% கட்டுமான முதலீடு மற்றும் முழு ப்ராஜெக்ட் நிர்வாகமும் எங்கள் பொறுப்பு.\n- FSI மதிப்பீடு மற்றும் Area-Sharing ஒப்பந்தம் மூலம் நில உரிமையாளர்களுக்கு அதிகபட்ச லாபம் உறுதி செய்யப்படுகிறது.\n- ஒவ்வொரு தளத்திலும் 200+ தரப் பரிசோதனைகள் (QA Checks) மற்றும் Zero Cost Overrun உடன் குறித்த நேரத்தில் ஒப்படைப்பு.\n\nஉங்கள் நிலம் குறித்த JV விவரங்களுக்கு +91 96008 10952 என்ற எண்ணில் எங்கள் பொறியாளர்களைத் தொடர்பு கொள்ளவும்.`;
    }

    if (isRenovation) {
      return `Briicks Properties-ல் பழைய வீடுகள் மற்றும் வணிக கட்டிடங்களுக்கு முழுமையான Renovation சேவைகள் செய்யப்படுகின்றன:\n\n- Concealed Plumbing & Electrical மறுசீரமைப்பு மற்றும் Waterproofing.\n- Structural Retrofitting, முகப்பு எலிவேஷன் மாற்றம் மற்றும் கூடுதல் தளம் கட்டுதல்.\n- வேலை தொடங்கும் முன்பே தெளிவான BOQ (Bill of Quantities) வழங்கப்படுவதால் கூடுதல் செலவு வராது.\n\nதளப் பார்வை மற்றும் மதிப்பீட்டிற்கு +91 96008 10952-ஐ அழைக்கவும்.`;
    }

    if (isInterior) {
      return `Turnkey Plus (₹2,650 / சதுர அடி) மற்றும் Signature Luxury (₹3,100 / சதுர அடி) பேக்கேஜ்களில் முழுமையான Interior Design & Custom Joinery அடங்கும்:\n\n- Moisture-resistant BWP Plywood Modular Kitchen & Wardrobes.\n- False Ceiling, Concealed Lighting மற்றும் பிராண்டட் Bath/MEP ஃபிட்டிங்குகள்.\n- Signature Luxury பேக்கேஜில் தேக்கு மர வேலைப்பாடுகள் (Teakwood Joinery) மற்றும் பிரீமியம் கற்கள் வழங்கப்படும்.`;
    }

    if (isWarranty) {
      return `Briicks Properties-ல் தரம் மற்றும் நம்பகத்தன்மைக்கு முக்கியத்துவம் அளிக்கப்படுகிறது:\n\n- ஒவ்வொரு தளத்திலும் 200+ QA தரப் பரிசோதனைகள் (Fe-550D Steel, Concrete Cube Strength, Curing).\n- 10 வருட Structural Building Warranty மற்றும் ஒப்படைப்புக்குப் பிறகு 1 வருட இலவச பராமரிப்பு.\n- முன்பே முடிவு செய்யப்பட்ட BOQ மூலம் Zero Cost Overruns & On-Time Delivery உறுதி செய்யப்படுகிறது.`;
    }

    if (isContact) {
      return `Briicks Properties அலுவலக முகவரி மற்றும் தொடர்பு விவரங்கள்:\n\n- முகவரி: 1st Floor, 1, 30th St, O Block, Anna Nagar East, Chennai, Tamil Nadu 600102.\n- தொலைபேசி: +91 96008 10952\n- மின்னஞ்சல்: briicksbricks.properties@outlook.com\n\nஇந்தப் பக்கத்தில் உள்ள "Book Free Site Visit" மூலம் நேரடிப் பொறியாளர் ஆலோசனையை முன்பதிவு செய்யலாம்.`;
    }

    if (isCost) {
      const targetArea = area ?? 1000;
      const essential = formatLakhsINR(targetArea * 2350);
      const turnkey = formatLakhsINR(targetArea * 2650);
      const luxury = formatLakhsINR(targetArea * 3100);
      return `${formatLakhsINR(targetArea)} சதுர அடி கட்டுமானத்திற்கான உத்தேச செலவு விவரம் (Briicks Properties):\n\n- Essential Build (₹2,350 / சதுர அடி): ₹${essential} – அடிப்படை கட்டுமானம் மற்றும் தரமான ஃபினிஷிங்.\n- Turnkey Plus (₹2,650 / சதுர அடி): ₹${turnkey} – முழுமையான Turnkey கட்டுமானம், Modular Interiors & பிராண்டட் MEP.\n- Signature Luxury (₹3,100 / சதுர அடி): ₹${luxury} – பிரத்யேக தேக்கு மர வேலைப்பாடுகள், பிரீமியம் கற்கள் & Smart Provisions.\n\nஅனைத்து பேக்கேஜ்களிலும் மண் பரிசோதனை (Soil Testing), 200+ QA Checks/Floor மற்றும் 10 வருட Structural Warranty அடங்கும். துல்லியமான கணக்கீட்டிற்கு Estimator பிரிவைப் பார்க்கவும் அல்லது +91 96008 10952-ஐ அழைக்கவும்.`;
    }

    return `வணக்கம்! Briicks Properties (அண்ணா நகர் கிழக்கு, சென்னை) 15+ வருட அனுபவம், 70+ திட்டங்கள் மற்றும் 10 வருட Structural Warranty உடன் கட்டுமான சேவைகளை வழங்குகிறது:\n\n- Essential Build: ₹2,350 / சதுர அடி முதல்.\n- Turnkey Plus (₹2,650) & Signature Luxury (₹3,100 / சதுர அடி).\n- சேவைகள்: New Construction, Turnkey House, Interior Works, Renovation, Structural/Architectural Planning & Joint Venture.\n\nஉங்கள் சதுர அடி (sq.ft), மண் பரிசோதனை அல்லது JV குறித்த கேள்வியை கேட்கலாம், அல்லது +91 96008 10952-ல் தொடர்பு கொள்ளலாம்.`;
  }

  if (isSoil) {
    return `Mandatory geotechnical soil testing before excavation determines your plot's exact soil bearing capacity and groundwater table—preventing foundation settlement or structural cracks later.\n\n- Ensures safe, seismic-compliant footing sizing without over-engineering material costs.\n- Paired with Fe-550D reinforcement steel, 200+ QA checks per floor, and our 10-year structural warranty.\n- Book a free Chennai site consultation via +91 96008 10952 to schedule a borehole audit for your plot.`;
  }

  if (isJv) {
    return `Briicks Properties partners with Chennai landowners through transparent Joint Venture (JV) developments:\n\n- 100% capital deployment, CMDA/corporation approvals, architectural planning, construction, and marketing handled end-to-end.\n- Feasibility study and FSI maximization model clear area-sharing returns before agreement.\n- Backed by locked timelines, 200+ QA checks per floor, and a 10-year structural warranty.\n\nCall +91 96008 10952 or visit our Anna Nagar East office to discuss your plot's JV potential.`;
  }

  if (isRenovation) {
    return `Our Building Renovations division handles structural retrofitting, concealed plumbing and electrical rewiring, waterproofing remediation, facade uplifts, and vertical floor extensions across Chennai.\n\n- Phased execution minimizes household disruption.\n- Locked stage-wise Bill of Quantities (BOQ) prevents mid-project cost escalations.\n\nCall +91 96008 10952 for an on-site structural inspection.`;
  }

  if (isInterior) {
    return `Our Interior Design & Turnkey team builds functional, custom interiors integrated seamlessly with the civil shell:\n\n- Space-optimized BWP plywood modular kitchens, wardrobes, false ceilings, and concealed ambient lighting.\n- Included in Turnkey Plus (₹2,650/sq.ft) and elevated with teakwood joinery and premium stone finishes in Signature Luxury (₹3,100/sq.ft).`;
  }

  if (isWarranty) {
    return `Every Briicks Properties build is governed by strict civil QA standards:\n\n- 200+ documented quality assurance checkpoints per floor (Fe-550D steel checks, concrete cube strength, curing cycles, and plumbing pressure tests).\n- 10-year structural building warranty plus 1-year free post-handover maintenance.\n- Zero Cost Overruns Guarantee backed by a locked pre-mobilization BOQ.`;
  }

  if (isContact) {
    return `Briicks Properties Studio & Engineering Desk:\n\n- Office: 1st Floor, 1, 30th St, O Block, Annanagar East, Chennai, Tamil Nadu 600102.\n- Phone: +91 96008 10952\n- Email: briicksbricks.properties@outlook.com\n\nUse "Book Free Site Visit" below to schedule a direct consultation with our senior civil engineers.`;
  }

  if (isCost) {
    const targetArea = area ?? 1000;
    const essential = formatLakhsINR(targetArea * 2350);
    const turnkey = formatLakhsINR(targetArea * 2650);
    const luxury = formatLakhsINR(targetArea * 3100);
    return `Estimated construction budget for ${formatLakhsINR(targetArea)} sq.ft with Briicks Properties:\n\n- Essential Build (₹2,350/sq.ft): ₹${essential} — Core RCC structural construction with standard architectural finishes.\n- Turnkey Plus (₹2,650/sq.ft): ₹${turnkey} — Complete turnkey build including modular interiors, elevation & branded MEP fittings.\n- Signature Luxury (₹3,100/sq.ft): ₹${luxury} — Custom bespoke interiors, teakwood joinery, smart provisions & premium stone.\n\nAll packages include mandatory soil testing, 200+ QA checks per floor, zero cost overruns, and a 10-year structural warranty. Try our interactive Cost Estimator on this page or call +91 96008 10952.`;
  }

  return `Briicks Properties (Anna Nagar East, Chennai) brings 15+ years of civil engineering experience, 70+ completed projects, and 350,000+ sq.ft built:\n\n- Packages start from ₹2,350/sq.ft (Essential Build), ₹2,650/sq.ft (Turnkey Plus), and ₹3,100/sq.ft (Signature Luxury).\n- Core Services: New Constructions, Turnkey Houses, Interiors, Renovations, Structural & Architectural Planning, and Joint Ventures.\n- Every project includes certified soil testing, 200+ QA checks/floor, zero cost overruns, and a 10-year structural warranty.\n\nAsk about any sq.ft size, soil testing, or JV details, or call +91 96008 10952.`;
}

