'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { projectsApi } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import type { CreateProjectInput, UpdateProjectInput } from '@/types';

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: projectsApi.list,
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id ?? ''),
    queryFn: () => projectsApi.get(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectInput) => projectsApi.create(input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.projects.all }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProjectInput }) =>
      projectsApi.update(id, input),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: queryKeys.projects.all });
      qc.invalidateQueries({ queryKey: queryKeys.projects.detail(updated.id) });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.remove(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.projects.all }),
  });
}
