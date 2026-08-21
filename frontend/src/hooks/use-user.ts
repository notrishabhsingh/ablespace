'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import type { UpdateUserInput, User } from '@/types';

/** Update the current user's profile and refresh the cached identity. */
export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateUserInput) => usersApi.update(input),
    onSuccess: (user: User) => {
      qc.setQueryData(queryKeys.auth.me, user);
      qc.setQueryData(queryKeys.user.me, user);
      qc.invalidateQueries({ queryKey: queryKeys.user.team });
    },
  });
}
