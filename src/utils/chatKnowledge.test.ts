import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BRIICKS_SYSTEM_INSTRUCTION,
  buildOfflineConstructionReply,
  buildSystemInstruction,
  CHAT_STARTER_QUESTIONS_BY_LANG,
  parseChatSegments,
  sanitizeChatHistory,
  validateChatMessage,
} from './chatKnowledge';

test('validateChatMessage rejects empty or oversized prompts and accepts valid questions', () => {
  assert.equal(validateChatMessage('   ').valid, false);
  assert.equal(validateChatMessage(null).valid, false);
  assert.equal(validateChatMessage('x'.repeat(1501)).valid, false);

  const ok = validateChatMessage('  How much for 1800 sqft turnkey home?  ');
  assert.equal(ok.valid, true);
  assert.equal(ok.text, 'How much for 1800 sqft turnkey home?');
});

test('sanitizeChatHistory trims, maps assistant role to model, alternates cleanly, and ends on model', () => {
  const sanitized = sanitizeChatHistory([
    { role: 'assistant', text: 'Welcome to Briicks!' },
    { role: 'user', text: 'What is starting rate?' },
    { role: 'assistant', text: 'Starts from ₹2,350/sq.ft.' },
    { role: 'user', text: 'Trailing failed prompt' },
  ]);

  assert.equal(sanitized.length, 2);
  assert.equal(sanitized[0].role, 'user');
  assert.equal(sanitized[1].role, 'model');
  assert.equal(sanitized[1].parts[0].text, 'Starts from ₹2,350/sq.ft.');
});

test('parseChatSegments extracts bold segments and strips markdown heading prefixes', () => {
  const segments = parseChatSegments('### Essential Build\nStarts at **₹2,350/sq.ft** with **Fe-550D steel**.');
  assert.equal(segments.some((s) => s.bold && s.text === '₹2,350/sq.ft'), true);
  assert.equal(segments.some((s) => s.bold && s.text === 'Fe-550D steel'), true);
  assert.equal(segments.map((s) => s.text).join('').includes('**'), false);
  assert.equal(segments.map((s) => s.text).join('').includes('###'), false);
});

test('bilingual starter questions and system instructions configure English and Tamil modes', () => {
  assert.equal(CHAT_STARTER_QUESTIONS_BY_LANG.en.length, 4);
  assert.equal(CHAT_STARTER_QUESTIONS_BY_LANG.ta.length, 4);
  assert.match(CHAT_STARTER_QUESTIONS_BY_LANG.ta[0], /சதுர அடி/);

  const taInstruction = buildSystemInstruction('ta');
  assert.match(taInstruction, /TAMIL/);
  assert.match(taInstruction, /தமிழ்/);

  const enInstruction = buildSystemInstruction('en');
  assert.match(enInstruction, /ENGLISH/);
  assert.match(BRIICKS_SYSTEM_INSTRUCTION, /₹2,350/);
  assert.match(BRIICKS_SYSTEM_INSTRUCTION, /Annanagar East/);
});

test('buildOfflineConstructionReply computes sq.ft budgets and answers Tamil and English topics cleanly', () => {
  const costReply = buildOfflineConstructionReply('Estimate cost for 2000 sq.ft G+1 house', 'en');
  assert.match(costReply, /2,000 sq\.ft/);
  assert.match(costReply, /47,00,000/);

  const tamilSoilReply = buildOfflineConstructionReply('மண் பரிசோதனை (Soil Testing) ஏன் அவசியம்?', 'ta');
  assert.match(tamilSoilReply, /மண் பரிசோதனை/);
  assert.match(tamilSoilReply, /\+91 96008 10952/);
});

