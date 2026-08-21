'use client';

import { AppSidebar } from './app-sidebar';
import { useSidebar } from './sidebar-context';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { TooltipProvider } from '@/components/ui/tooltip';

/**
 * App chrome: a full-height gray canvas holding the desktop sidebar rail and a
 * rounded white content panel (the "framed window" look from Figma). On small
 * screens the sidebar becomes a slide-in drawer. The content panel is the
 * scroll container, so page headers stay put while their bodies scroll.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { collapsed, mobileOpen, setMobileOpen } = useSidebar();

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen overflow-hidden bg-muted/40">
        {/* Desktop rail */}
        <aside
          className={cn(
            'hidden shrink-0 flex-col transition-[width] duration-200 ease-in-out lg:flex',
            collapsed ? 'w-[68px]' : 'w-60',
          )}
        >
          <AppSidebar collapsed={collapsed} />
        </aside>

        {/* Content panel */}
        <main className="flex min-w-0 flex-1 flex-col p-2 lg:pl-0">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-background shadow-sm">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0" hideClose>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <AppSidebar collapsed={false} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
}
