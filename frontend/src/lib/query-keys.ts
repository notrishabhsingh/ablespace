import type { TaskListParams } from './api';

/**
 * Centralized React Query cache keys. Keeping them in one factory avoids typos
 * and makes targeted invalidation easy (e.g. `queryClient.invalidateQueries({
 * queryKey: queryKeys.tasks.all })`).
 */
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  user: {
    me: ['user', 'me'] as const,
    team: ['user', 'team'] as const,
  },
  projects: {
    all: ['projects'] as const,
    detail: (id: string) => ['projects', id] as const,
  },
  tasks: {
    all: ['tasks'] as const,
    list: (params: TaskListParams) => ['tasks', 'list', params] as const,
    detail: (id: string) => ['tasks', id] as const,
    activity: (id: string) => ['tasks', id, 'activity'] as const,
  },
  comments: {
    list: (taskId: string) => ['tasks', taskId, 'comments'] as const,
  },
};
