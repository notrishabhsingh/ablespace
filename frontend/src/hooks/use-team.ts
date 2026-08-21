'use client';

import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';

/** Assignable teammates for member/reporter/lead pickers. */
export function useTeam() {
  return useQuery({
    queryKey: queryKeys.user.team,
    queryFn: usersApi.team,
    staleTime: 5 * 60_000,
  });
}
