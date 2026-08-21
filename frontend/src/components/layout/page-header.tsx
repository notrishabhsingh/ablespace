'use client';

import { Menu, PanelLeft } from 'lucide-react';
import { useSidebar } from './sidebar-context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  /** Simple title text (ignored if `children` is provided). */
  title?: string;
  /** Right-aligned action controls (search, filters, Add buttons, etc.). */
  actions?: React.ReactNode;
  /** Custom left content (e.g. a breadcrumb) replacing the title. */
  children?: React.ReactNode;
  className?: string;
}

/**
 * Sticky-feeling header for each page. Hosts the sidebar controls on the left:
 * a hamburger on mobile (opens the drawer) and the rail collapse toggle on
 * desktop — matching the collapse icon at the top of the main area in Figma.
 */
export function PageHeader({
  title,
  actions,
  children,
  className,
}: PageHeaderProps) {
  const { toggleCollapsed, setMobileOpen } = useSidebar();

  return (
    <header
      className={cn(
        'flex h-14 shrink-0 items-center gap-2 border-b px-3 sm:px-4',
        className,
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="hidden lg:inline-flex"
        onClick={toggleCollapsed}
        aria-label="Toggle sidebar"
      >
        <PanelLeft className="h-5 w-5" />
      </Button>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        {children ??
          (title ? (
            <h1 className="truncate text-base font-semibold sm:text-lg">
              {title}
            </h1>
          ) : null)}
      </div>

      {actions ? (
        <div className="flex items-center gap-1.5">{actions}</div>
      ) : null}
    </header>
  );
}
