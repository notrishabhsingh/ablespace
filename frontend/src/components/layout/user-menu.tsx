'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Check,
  ChevronsUpDown,
  LogOut,
  Moon,
  Palette,
  Settings,
  Sun,
  SunMoon,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import {
  ACCENTS,
  ACCENT_META,
  useAccent,
  type Accent,
} from '@/components/providers/color-provider';
import { getInitials } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function avatarFor(seed: string, explicit?: string): string {
  return explicit || `https://api.dicebear.com/7.x/thumbs/svg?seed=${seed}`;
}

/**
 * The sidebar workspace switcher. Its dropdown holds the two theming axes
 * (light/dark + accent Color Mode), a Settings link and Logout — matching the
 * Figma user menu. Renders a compact avatar-only trigger when the sidebar rail
 * is collapsed.
 */
export function UserMenu({ collapsed = false }: { collapsed?: boolean }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { accent, setAccent } = useAccent();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const name = user?.fullName ?? 'Guest';
  const subtitle = user?.email ?? (user?.username ? `@${user.username}` : 'Guest workspace');
  const avatar = avatarFor(user?.id ?? name, user?.avatarUrl);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex items-center gap-2 rounded-md text-left outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring',
            collapsed ? 'h-9 w-9 justify-center p-0' : 'w-full p-2',
          )}
        >
          <Avatar className="h-7 w-7">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium leading-tight">
                  {name}
                </p>
                <p className="truncate text-xs leading-tight text-muted-foreground">
                  {subtitle}
                </p>
              </div>
              <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        side={collapsed ? 'right' : 'bottom'}
        className="w-60"
      >
        <DropdownMenuLabel className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="truncate text-xs font-normal text-muted-foreground">
              {subtitle}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Change Theme (light/dark) */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <SunMoon className="h-4 w-4" />
            Change Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => setTheme('light')}>
              <Sun className="h-4 w-4" />
              Light
              {mounted && theme === 'light' && (
                <Check className="ml-auto h-4 w-4" />
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>
              <Moon className="h-4 w-4" />
              Dark
              {mounted && theme === 'dark' && (
                <Check className="ml-auto h-4 w-4" />
              )}
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Color Mode (accent) */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Palette className="h-4 w-4" />
            Color Mode
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {ACCENTS.map((a: Accent) => (
              <DropdownMenuItem key={a} onClick={() => setAccent(a)}>
                <span
                  className="h-3.5 w-3.5 rounded-full ring-1 ring-border"
                  style={{ backgroundColor: ACCENT_META[a].swatch }}
                />
                {ACCENT_META[a].label}
                {accent === a && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/settings')}>
          <Settings className="h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={logout}>
          <LogOut className="h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
