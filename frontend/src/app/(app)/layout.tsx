import { AuthGuard } from '@/components/auth/auth-guard';
import { SidebarProvider } from '@/components/layout/sidebar-context';
import { AppShell } from '@/components/layout/app-shell';

/**
 * Layout for all authenticated routes. The guard gates access; SidebarProvider
 * holds rail/drawer state; AppShell renders the sidebar + framed content panel.
 */
export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppShell>{children}</AppShell>
      </SidebarProvider>
    </AuthGuard>
  );
}
