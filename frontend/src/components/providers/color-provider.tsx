'use client';

import * as React from 'react';

/**
 * Accent ("Color Mode") theming — the second theming axis, independent of
 * light/dark. It sets a `data-accent` attribute on <html>; globals.css maps that
 * to the shadcn `--primary` / `--primary-foreground` / `--ring` tokens, so the
 * accent drives primary buttons, active nav, checkboxes, the calendar selection
 * and the watcher tint — while status/priority colors stay fixed.
 *
 * Default accent is **Black** (the base monochrome palette), matching the Figma
 * mocks. Choice is persisted to localStorage and re-applied before paint by the
 * inline script in the root layout to avoid a flash of the wrong accent.
 */

export const ACCENTS = [
  'amber',
  'blue',
  'pink',
  'rose',
  'emerald',
  'black',
] as const;

export type Accent = (typeof ACCENTS)[number];

export const ACCENT_STORAGE_KEY = 'pyramid.accent';
export const DEFAULT_ACCENT: Accent = 'black';

/** Label + swatch color for the Color Mode menu. */
export const ACCENT_META: Record<Accent, { label: string; swatch: string }> = {
  black: { label: 'Black', swatch: '#18181b' },
  blue: { label: 'Blue', swatch: '#2563eb' },
  amber: { label: 'Amber', swatch: '#f59e0b' },
  pink: { label: 'Pink', swatch: '#ec4899' },
  rose: { label: 'Rose', swatch: '#e11d48' },
  emerald: { label: 'Emerald', swatch: '#10b981' },
};

function isAccent(value: unknown): value is Accent {
  return typeof value === 'string' && (ACCENTS as readonly string[]).includes(value);
}

function applyAccent(accent: Accent): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-accent', accent);
}

interface ColorContextValue {
  accent: Accent;
  setAccent: (accent: Accent) => void;
}

const ColorContext = React.createContext<ColorContextValue | undefined>(
  undefined,
);

export function ColorProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccentState] = React.useState<Accent>(DEFAULT_ACCENT);

  // Sync from localStorage on mount (the pre-paint script already applied the
  // attribute; this brings React state in line with it).
  React.useEffect(() => {
    const stored = window.localStorage.getItem(ACCENT_STORAGE_KEY);
    const next = isAccent(stored) ? stored : DEFAULT_ACCENT;
    setAccentState(next);
    applyAccent(next);
  }, []);

  const setAccent = React.useCallback((next: Accent) => {
    setAccentState(next);
    window.localStorage.setItem(ACCENT_STORAGE_KEY, next);
    applyAccent(next);
  }, []);

  const value = React.useMemo(() => ({ accent, setAccent }), [accent, setAccent]);

  return <ColorContext.Provider value={value}>{children}</ColorContext.Provider>;
}

export function useAccent(): ColorContextValue {
  const ctx = React.useContext(ColorContext);
  if (!ctx) {
    throw new Error('useAccent must be used within a ColorProvider');
  }
  return ctx;
}

/**
 * Inline script string executed before paint (placed in <head>). Reads the
 * persisted accent and sets `data-accent` immediately so the first paint uses
 * the correct primary color. Kept dependency-free and defensive so a
 * localStorage error can never block rendering.
 */
export const accentPrePaintScript = `
(function () {
  try {
    var a = localStorage.getItem('${ACCENT_STORAGE_KEY}');
    var allowed = ${JSON.stringify(ACCENTS)};
    if (!a || allowed.indexOf(a) === -1) a = '${DEFAULT_ACCENT}';
    document.documentElement.setAttribute('data-accent', a);
  } catch (e) {
    document.documentElement.setAttribute('data-accent', '${DEFAULT_ACCENT}');
  }
})();
`;
