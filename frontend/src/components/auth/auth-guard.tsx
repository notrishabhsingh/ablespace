'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth-storage';
import { useAuth } from '@/hooks/use-auth';
import { FullPageSpinner } from '@/components/full-page-spinner';

/**
 * Route guard for the authenticated app. Redirects to /login when there is no
 * token, or when resolving the current user fails (a 401 is also handled by the
 * axios interceptor). Shows a spinner while the session is being established.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading, isError } = useAuth();
  const hasToken = typeof window !== 'undefined' && Boolean(getToken());

  useEffect(() => {
    if (!hasToken || isError) {
      router.replace('/login');
    }
  }, [hasToken, isError, router]);

  if (!hasToken || isLoading || !isAuthenticated) {
    return <FullPageSpinner />;
  }

  return <>{children}</>;
}
