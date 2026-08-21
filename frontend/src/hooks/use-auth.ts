'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { clearToken, getToken, setToken } from '@/lib/auth-storage';
import { queryKeys } from '@/lib/query-keys';

/**
 * Auth surface for the app. Backed by React Query so the current user is cached
 * and shared across every component that calls this hook (no extra context
 * needed). `GET /auth/me` runs only when a token is present.
 */
export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const hasToken = typeof window !== 'undefined' && Boolean(getToken());

  const meQuery = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authApi.me,
    enabled: hasToken,
    staleTime: 5 * 60_000,
    retry: false,
  });

  const guestMutation = useMutation({
    mutationFn: authApi.guestLogin,
    onSuccess: (data) => {
      setToken(data.token);
      // Prime the cache so the app shell has the user immediately.
      queryClient.setQueryData(queryKeys.auth.me, data.user);
    },
  });

  const logout = () => {
    clearToken();
    queryClient.clear();
    router.replace('/login');
  };

  return {
    user: meQuery.data,
    isAuthenticated: Boolean(meQuery.data),
    /** True only while we actually have a token and are resolving the user. */
    isLoading: hasToken && meQuery.isLoading,
    isError: meQuery.isError,
    loginAsGuest: guestMutation.mutateAsync,
    isLoggingIn: guestMutation.isPending,
    logout,
  };
}
