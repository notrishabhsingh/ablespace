'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { tasksApi, type TaskListParams } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import type {
  CreateTaskInput,
  ReorderTasksInput,
  UpdateTaskInput,
} from '@/types';

/** List tasks for the given filters (workspace root, a project, or subtasks). */
export function useTasks(params: TaskListParams = {}) {
  return useQuery({
    queryKey: queryKeys.tasks.list(params),
    queryFn: () => tasksApi.list(params),
  });
}

export function useTask(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.tasks.detail(id ?? ''),
    queryFn: () => tasksApi.get(id as string),
    enabled: Boolean(id),
  });
}

export function useTaskActivity(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.tasks.activity(id ?? ''),
    queryFn: () => tasksApi.activity(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) => tasksApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.tasks.all }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) =>
      tasksApi.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.tasks.all }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.tasks.all }),
  });
}

export function useReorderTasks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ReorderTasksInput) => tasksApi.reorder(input),
    // The board applies an optimistic local update; on settle we resync with
    // the server so any divergence is corrected.
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.tasks.all }),
  });
}
