import { LayoutGrid, Package, type LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/** Primary workspace navigation, matching the Figma sidebar. */
export const NAV_ITEMS: NavItem[] = [
  { label: 'Tasks', href: '/tasks', icon: LayoutGrid },
  { label: 'Projects', href: '/projects', icon: Package },
];
