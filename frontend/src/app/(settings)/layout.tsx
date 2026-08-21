import { AuthGuard } from '@/components/auth/auth-guard';
import { SettingsShell } from '@/components/settings/settings-shell';

/**
 * Layout for the Settings area. Reuses the auth guard but swaps the main app
 * chrome for the settings sub-sidebar (Profile / Theme / Color).
 */
export default function SettingsGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <SettingsShell>{children}</SettingsShell>
    </AuthGuard>
  );
}
