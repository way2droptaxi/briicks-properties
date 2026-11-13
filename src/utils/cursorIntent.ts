export type CursorMode = 'default' | 'interactive' | 'action' | 'text';

export interface CursorState {
  mode: CursorMode;
  label: string;
}

export interface TargetMetadata {
  tagName?: string;
  role?: string | null;
  cursorLabel?: string | null;
  inputType?: string | null;
}

const TEXT_INPUT_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);
const INTERACTIVE_TAGS = new Set(['A', 'BUTTON', 'SUMMARY', 'LABEL']);
const INTERACTIVE_ROLES = new Set(['button', 'link', 'tab', 'menuitem', 'checkbox', 'radio']);

/**
 * Pure cursor intent resolver used by ArchitecturalCursor and unit-tested independently.
 */
export function resolveCursorStateFromMeta(meta: TargetMetadata | null): CursorState {
  if (!meta) {
    return { mode: 'default', label: '' };
  }

  const tag = (meta.tagName ?? '').toUpperCase();
  const role = (meta.role ?? '').toLowerCase();
  const inputType = (meta.inputType ?? '').toLowerCase();

  if (
    TEXT_INPUT_TAGS.has(tag) &&
    inputType !== 'range' &&
    inputType !== 'checkbox' &&
    inputType !== 'radio' &&
    inputType !== 'button' &&
    inputType !== 'submit'
  ) {
    return { mode: 'text', label: '' };
  }

  if (meta.cursorLabel && meta.cursorLabel.trim().length > 0) {
    return { mode: 'action', label: meta.cursorLabel.trim() };
  }

  if (INTERACTIVE_TAGS.has(tag) || INTERACTIVE_ROLES.has(role) || inputType === 'range' || inputType === 'checkbox') {
    return { mode: 'interactive', label: '' };
  }

  return { mode: 'default', label: '' };
}

/**
 * Walks up from a real DOM Element (if available) to resolve the nearest semantic cursor state.
 */
export function resolveCursorStateFromElement(target: EventTarget | null): CursorState {
  if (typeof Element === 'undefined' || !(target instanceof Element)) {
    return { mode: 'default', label: '' };
  }

  const textEl = target.closest('input, textarea, select');
  if (textEl) {
    return resolveCursorStateFromMeta({
      tagName: textEl.tagName,
      inputType: textEl.getAttribute('type'),
    });
  }

  const interactiveEl = target.closest(
    'a, button, [role="button"], [role="link"], [role="tab"], label, [data-cursor]'
  );

  if (interactiveEl) {
    const customLabel = interactiveEl.getAttribute('data-cursor');
    return resolveCursorStateFromMeta({
      tagName: interactiveEl.tagName,
      role: interactiveEl.getAttribute('role'),
      cursorLabel: customLabel,
    });
  }

  return { mode: 'default', label: '' };
}
