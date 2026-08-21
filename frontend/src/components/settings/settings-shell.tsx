'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowLeft,
  Palette,
  Search,
  SunMoon,
  User as UserIcon,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface SettingsNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const SETTINGS_NAV: SettingsNavItem[] = [
  { href: '/settings/profile', label: 'Profile', icon: UserIcon },
  { href: '/settings/theme', label: 'Theme', icon: SunMoon },
  { href: '/settings/color', label: 'Color', icon: Palette },
];

/**
 * Chrome for the Settings area. Mirrors the app's framed-window look but swaps
 * the main navigation for a dedicated settings sub-sidebar ("Back to app",
 * search, and the Profile / Theme / Color sections), matching the Figma.
 */
export function SettingsShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-muted/40">
      {/* Desktop sub-sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col gap-3 p-3 lg:flex">
        <SettingsSidebar />
      </aside>

      {/* Content panel */}
      <main className="flex min-w-0 flex-1 flex-col p-2 lg:pl-0">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-background shadow-sm">
          {/* Mobile top nav (the sub-sidebar collapses to tabs) */}
          <div className="lg:hidden">
            <div className="flex items-center gap-2 border-b px-3 py-2">
              <Link
                href="/tasks"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to app
              </Link>
            </div>
            <nav className="flex items-center gap-1 overflow-x-auto border-b px-3 py-2">
              {SETTINGS_NAV.map((item) => (
                <SettingsTab key={item.href} item={item} />
              ))}
            </nav>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}

function SettingsSidebar() {
  const [query, setQuery] = React.useState('');
  const q = query.trim().toLowerCase();
  const items = q
    ? SETTINGS_NAV.filter((i) => i.label.toLowerCase().includes(q))
    : SETTINGS_NAV;

  return (
    <>
      <Link
        href="/tasks"
        className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to app
      </Link>

      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="h-9 pl-8"
        />
      </div>

      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <SettingsNavLink key={item.href} item={item} />
        ))}
        {items.length === 0 && (
          <p className="px-2 py-1.5 text-sm text-muted-foreground">
            No settings match “{query}”.
          </p>
        )}
      </nav>
    </>
  );
}

function useIsActive(href: string) {
  const pathname = usePathname();
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SettingsNavLink({ item }: { item: SettingsNavItem }) {
  const active = useIsActive(item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
        active
          ? 'bg-accent font-medium text-accent-foreground'
          : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
      )}
    >
      <Icon className="h-4 w-4" />
      {item.label}
    </Link>
  );
}

function SettingsTab({ item }: { item: SettingsNavItem }) {
  const active = useIsActive(item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors',
        active
          ? 'bg-accent font-medium text-accent-foreground'
          : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
      )}
    >
      <Icon className="h-4 w-4" />
      {item.label}
    </Link>
  );
}
