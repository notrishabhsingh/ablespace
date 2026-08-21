'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { commentsApi } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';

export function useComments(taskId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.comments.list(taskId ?? ''),
    queryFn: () => commentsApi.list(taskId as string),
    enabled: Boolean(taskId),
  });
}

export function useCreateComment(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => commentsApi.create(taskId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.comments.list(taskId) });
      // A comment also produces server-side activity in some flows; refresh it.
      qc.invalidateQueries({ queryKey: queryKeys.tasks.activity(taskId) });
    },
  });
}

export function useDeleteComment(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => commentsApi.remove(taskId, commentId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.comments.list(taskId) }),
  });
}
