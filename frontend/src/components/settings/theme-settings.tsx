'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Check, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeOption {
  value: 'light' | 'dark';
  label: string;
  description: string;
  icon: typeof Sun;
  /** Tailwind classes for the little preview swatch. */
  previewClass: string;
  barClass: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    value: 'light',
    label: 'Light',
    description: 'Bright surfaces with dark text.',
    icon: Sun,
    previewClass: 'bg-white border-zinc-200',
    barClass: 'bg-zinc-200',
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Dim surfaces that are easy on the eyes.',
    icon: Moon,
    previewClass: 'bg-zinc-900 border-zinc-700',
    barClass: 'bg-zinc-700',
  },
];

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // Treat "system" (or unresolved) as light for selection purposes.
  const current = mounted && theme === 'dark' ? 'dark' : 'light';

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Theme</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose how Pyramid looks. Your choice is saved on this device.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {THEME_OPTIONS.map((option) => {
            const active = current === option.value;
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setTheme(option.value)}
                aria-pressed={active}
                className={cn(
                  'group rounded-xl border p-4 text-left transition-colors',
                  active
                    ? 'border-primary ring-1 ring-primary'
                    : 'hover:border-foreground/20 hover:bg-accent/40',
                )}
              >
                {/* Preview */}
                <div
                  className={cn(
                    'mb-3 flex h-20 flex-col justify-center gap-1.5 rounded-lg border px-3',
                    option.previewClass,
                  )}
                >
                  <span className={cn('h-2 w-16 rounded-full', option.barClass)} />
                  <span className={cn('h-2 w-10 rounded-full', option.barClass)} />
                  <span className={cn('h-2 w-20 rounded-full', option.barClass)} />
                </div>

                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{option.label}</span>
                  {active && <Check className="ml-auto h-4 w-4 text-primary" />}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
