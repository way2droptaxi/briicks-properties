import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import {
  buildOfflineConstructionReply,
  buildSystemInstruction,
  sanitizeChatHistory,
  validateChatMessage,
} from '../src/utils/chatKnowledge.ts';

interface VercelRequestLike {
  method?: string;
  body?: unknown;
}

interface VercelResponseLike {
  status: (code: number) => VercelResponseLike;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
  end: () => void;
}

function parseBody(raw: unknown): Record<string, unknown> {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  if (typeof raw === 'object') {
    return raw as Record<string, unknown>;
  }
  return {};
}

export default async function handler(req: VercelRequestLike, res: VercelResponseLike) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    res.status(405).json({ error: 'Method not allowed. Use POST /api/chat.' });
    return;
  }

  const body = parseBody(req.body);
  const validation = validateChatMessage(body.message);
  if (!validation.valid) {
    res.status(400).json({ error: validation.error });
    return;
  }

  const language = body.language === 'ta' ? 'ta' : 'en';
  const apiKey = process.env.GEMINI_API_KEY;

  // If deployed on Vercel without GEMINI_API_KEY env var configured yet,
  // serve verified Briicks Properties bilingual engineering guidance cleanly.
  if (!apiKey) {
    res.status(200).json({
      reply: buildOfflineConstructionReply(validation.text, language),
    });
    return;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const history = sanitizeChatHistory(body.history);
    const chat = ai.chats.create({
      model: 'gemini-4-hydrogen',
      history,
      config: {
        systemInstruction: buildSystemInstruction(language),
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const response = await chat.sendMessage({ message: validation.text });
    const reply = (response.text ?? '').trim();

    if (!reply) {
      res.status(200).json({
        reply: buildOfflineConstructionReply(validation.text, language),
      });
      return;
    }

    res.status(200).json({ reply });
  } catch (err: unknown) {
    const status =
      typeof err === 'object' && err !== null && 'status' in err
        ? Number((err as { status?: unknown }).status)
        : 500;
    const message = err instanceof Error ? err.message : 'Unexpected server error';
    console.error('Vercel Gemini construction chat error:', status, message);

    if (status === 429 || message.includes('429') || message.includes('RESOURCE_EXHAUSTED')) {
      res.status(429).json({
        error: 'High inquiry volume right now. Please wait a few seconds and try again.',
      });
      return;
    }

    // Fall back to verified Briicks Properties construction knowledge for transient/auth issues
    // so visitors never hit a dead-end error card.
    res.status(200).json({
      reply: buildOfflineConstructionReply(validation.text, language),
    });
  }
}
