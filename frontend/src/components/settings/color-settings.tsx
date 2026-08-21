'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ACCENTS,
  ACCENT_META,
  useAccent,
  type Accent,
} from '@/components/providers/color-provider';

export function ColorSettings() {
  const { accent, setAccent } = useAccent();

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Color</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick an accent color. It tints primary buttons, active navigation and
          selections — while status and priority colors stay consistent.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {ACCENTS.map((value: Accent) => {
            const meta = ACCENT_META[value];
            const active = accent === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setAccent(value)}
                aria-pressed={active}
                className={cn(
                  'flex items-center gap-3 rounded-xl border p-3 text-left transition-colors',
                  active
                    ? 'border-primary ring-1 ring-primary'
                    : 'hover:border-foreground/20 hover:bg-accent/40',
                )}
              >
                <span
                  className="h-8 w-8 shrink-0 rounded-full ring-1 ring-border"
                  style={{ backgroundColor: meta.swatch }}
                />
                <span className="text-sm font-medium">{meta.label}</span>
                {active && <Check className="ml-auto h-4 w-4 text-primary" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
