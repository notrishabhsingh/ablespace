'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes/dist/types';

/**
 * Light/Dark theming via next-themes using the `class` strategy (adds `.dark`
 * to <html>). next-themes injects its own pre-paint script to avoid a flash of
 * the wrong theme, and persists the choice to localStorage automatically.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
