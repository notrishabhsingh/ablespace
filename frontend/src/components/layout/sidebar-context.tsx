'use client';

import * as React from 'react';

const STORAGE_KEY = 'pyramid.sidebar-collapsed';

interface SidebarContextValue {
  /** Desktop icon-rail collapse. */
  collapsed: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (value: boolean) => void;
  /** Mobile drawer open state. */
  mobileOpen: boolean;
  setMobileOpen: (value: boolean) => void;
  /** Guards against SSR/first-paint hydration mismatches. */
  mounted: boolean;
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(
  undefined,
);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsedState] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    try {
      setCollapsedState(window.localStorage.getItem(STORAGE_KEY) === 'true');
    } catch {
      /* ignore storage errors */
    }
  }, []);

  const setCollapsed = React.useCallback((value: boolean) => {
    setCollapsedState(value);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
      /* ignore storage errors */
    }
  }, []);

  const toggleCollapsed = React.useCallback(
    () => setCollapsed(!collapsed),
    [collapsed, setCollapsed],
  );

  const value = React.useMemo(
    () => ({
      collapsed,
      toggleCollapsed,
      setCollapsed,
      mobileOpen,
      setMobileOpen,
      mounted,
    }),
    [collapsed, toggleCollapsed, setCollapsed, mobileOpen, mounted],
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarContextValue {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return ctx;
}
