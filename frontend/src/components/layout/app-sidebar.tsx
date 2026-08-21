'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from './nav-config';
import { UserMenu } from './user-menu';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Sidebar contents shared by the desktop rail and the mobile drawer. The
 * workspace switcher sits at the top (its dropdown holds theming + settings),
 * followed by the primary nav. When `collapsed` the rail shows icons only, with
 * tooltips revealing labels on hover.
 */
export function AppSidebar({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="p-2">
        <UserMenu collapsed={collapsed} />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-2 scrollbar-thin">
        {!collapsed && (
          <p className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Workspace
          </p>
        )}

        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;

          const link = (
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center rounded-md text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                collapsed ? 'h-9 w-9 justify-center' : 'gap-3 px-3 py-2',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          }
          return <div key={item.href}>{link}</div>;
        })}
      </nav>
    </div>
  );
}
