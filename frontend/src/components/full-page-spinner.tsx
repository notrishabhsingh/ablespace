import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Centered full-viewport spinner for auth/route transitions. */
export function FullPageSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex min-h-screen w-full items-center justify-center bg-background',
        className,
      )}
    >
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}
