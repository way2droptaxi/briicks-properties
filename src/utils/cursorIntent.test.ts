import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveCursorStateFromMeta } from './cursorIntent';

test('resolveCursorStateFromMeta detects text inputs without overriding range sliders', () => {
  assert.deepEqual(
    resolveCursorStateFromMeta({ tagName: 'INPUT', inputType: 'email' }),
    { mode: 'text', label: '' }
  );
  assert.deepEqual(
    resolveCursorStateFromMeta({ tagName: 'TEXTAREA' }),
    { mode: 'text', label: '' }
  );
  assert.deepEqual(
    resolveCursorStateFromMeta({ tagName: 'INPUT', inputType: 'range' }),
    { mode: 'interactive', label: '' }
  );
});

test('resolveCursorStateFromMeta prioritizes custom action labels over generic interactive tags', () => {
  assert.deepEqual(
    resolveCursorStateFromMeta({ tagName: 'DIV', cursorLabel: 'View' }),
    { mode: 'action', label: 'View' }
  );
  assert.deepEqual(
    resolveCursorStateFromMeta({ tagName: 'BUTTON', cursorLabel: 'Explore' }),
    { mode: 'action', label: 'Explore' }
  );
});

test('resolveCursorStateFromMeta detects interactive elements and defaults cleanly', () => {
  assert.deepEqual(
    resolveCursorStateFromMeta({ tagName: 'BUTTON' }),
    { mode: 'interactive', label: '' }
  );
  assert.deepEqual(
    resolveCursorStateFromMeta({ tagName: 'DIV', role: 'tab' }),
    { mode: 'interactive', label: '' }
  );
  assert.deepEqual(
    resolveCursorStateFromMeta({ tagName: 'P' }),
    { mode: 'default', label: '' }
  );
  assert.deepEqual(resolveCursorStateFromMeta(null), { mode: 'default', label: '' });
});
