import 'dotenv/config';
import express from 'express';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import {
  buildSystemInstruction,
  sanitizeChatHistory,
  validateChatMessage,
} from './src/utils/chatKnowledge.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

function createGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  app.get('/api/maps-config', (_req, res) => {
    res.json({
      apiKey: process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '',
    });
  });

  app.post('/api/chat', async (req, res) => {
    const validation = validateChatMessage(req.body?.message);
    if (!validation.valid) {
      res.status(400).json({ error: validation.error });
      return;
    }

    const ai = createGeminiClient();
    if (!ai) {
      res.status(503).json({
        error:
          'Construction advisor is temporarily unavailable because the Gemini API key is not configured.',
      });
      return;
    }

    try {
      const history = sanitizeChatHistory(req.body?.history);
      const language = req.body?.language === 'ta' ? 'ta' : 'en';
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
        res.status(502).json({
          error: 'Could not generate a response right now. Please try rephrasing your question.',
        });
        return;
      }

      res.json({ reply });
    } catch (err: unknown) {
      const status =
        typeof err === 'object' && err !== null && 'status' in err
          ? Number((err as { status?: unknown }).status)
          : 500;
      const message = err instanceof Error ? err.message : 'Unexpected server error';
      console.error('Gemini construction chat error:', status, message);

      if (status === 429 || message.includes('429') || message.includes('RESOURCE_EXHAUSTED')) {
        res.status(429).json({
          error: 'High inquiry volume right now. Please wait a few seconds and try again.',
        });
        return;
      }

      if (
        status === 403 ||
        message.includes('403') ||
        message.includes('PERMISSION_DENIED') ||
        message.includes('API_KEY_INVALID') ||
        message.includes('API key not valid')
      ) {
        res.status(502).json({
          error: 'Gemini API authentication needs attention in Settings > Secrets.',
        });
        return;
      }

      if (status === 404 || message.includes('NOT_FOUND')) {
        res.status(502).json({
          error: 'Selected Gemini model is unavailable right now. Please retry shortly.',
        });
        return;
      }

      res.status(500).json({
        error: `Unable to reach our construction advisor right now (${status || 'network'}). Please call +91 96008 10952 or retry.`,
      });
    }
  });

  const httpServer = http.createServer(app);

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        ws: { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Briicks Properties server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
