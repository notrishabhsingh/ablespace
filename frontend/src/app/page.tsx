'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth-storage';
import { FullPageSpinner } from '@/components/full-page-spinner';

/**
 * Entry route. Redirects to the app if a session token exists, otherwise to the
 * login screen. Runs client-side because the token lives in localStorage.
 */
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getToken() ? '/tasks' : '/login');
  }, [router]);

  return <FullPageSpinner />;
}
