import { Triangle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Pyramid brand mark: a rounded square with a filled triangle, matching the
 * Figma logo. Uses `foreground`/`background` (not `primary`) so it stays a
 * neutral black-on-white in light mode and inverts cleanly in dark mode —
 * deliberately independent of the selected accent.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-foreground text-background',
        className,
      )}
      aria-hidden
    >
      <Triangle className="h-[18px] w-[18px] fill-current" strokeWidth={0} />
    </div>
  );
}
