import axios from 'axios';
import { getToken, clearToken } from './auth-storage';
import type {
  Activity,
  AuthResponse,
  Comment,
  CreateProjectInput,
  CreateTaskInput,
  Project,
  ReorderTasksInput,
  Task,
  TaskStatus,
  Priority,
  UpdateProjectInput,
  UpdateTaskInput,
  UpdateUserInput,
  User,
} from '@/types';

/**
 * Central axios instance. `baseURL` already includes the `/api` prefix that the
 * NestJS app sets via `app.setGlobalPrefix('api')`, so endpoint paths below are
 * written without it (e.g. `/auth/guest`).
 */
const baseURL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export const api = axios.create({ baseURL });

/** Attach the JWT (if any) to every outgoing request. */
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * On a 401 the token is stale/invalid: clear it and bounce to the login page
 * (unless we're already there, to avoid a redirect loop). The rejection is
 * re-thrown so callers/React Query still see the error.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (typeof window !== 'undefined' && status === 401) {
      clearToken();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

/* -------------------------------------------------------------------------- */
/*                                    Auth                                    */
/* -------------------------------------------------------------------------- */

export const authApi = {
  /** Create (or reuse) a guest account and receive a JWT + user. */
  guestLogin: async (): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/guest');
    return data;
  },
  /** Resolve the currently authenticated user from the token. */
  me: async (): Promise<User> => {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },
};

/* -------------------------------------------------------------------------- */
/*                                    Users                                   */
/* -------------------------------------------------------------------------- */

export const usersApi = {
  me: async (): Promise<User> => {
    const { data } = await api.get<User>('/users/me');
    return data;
  },
  /** Assignable teammates (self + seeded members) for pickers. */
  team: async (): Promise<User[]> => {
    const { data } = await api.get<User[]>('/users/team');
    return data;
  },
  update: async (input: UpdateUserInput): Promise<User> => {
    const { data } = await api.patch<User>('/users/me', input);
    return data;
  },
};

/* -------------------------------------------------------------------------- */
/*                                  Projects                                  */
/* -------------------------------------------------------------------------- */

export const projectsApi = {
  list: async (): Promise<Project[]> => {
    const { data } = await api.get<Project[]>('/projects');
    return data;
  },
  get: async (id: string): Promise<Project> => {
    const { data } = await api.get<Project>(`/projects/${id}`);
    return data;
  },
  create: async (input: CreateProjectInput): Promise<Project> => {
    const { data } = await api.post<Project>('/projects', input);
    return data;
  },
  update: async (id: string, input: UpdateProjectInput): Promise<Project> => {
    const { data } = await api.patch<Project>(`/projects/${id}`, input);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};

/* -------------------------------------------------------------------------- */
/*                                    Tasks                                   */
/* -------------------------------------------------------------------------- */

/** Query filters accepted by `GET /tasks`. */
export interface TaskListParams {
  projectId?: string;
  parentTaskId?: string;
  status?: TaskStatus;
  priority?: Priority;
  search?: string;
}

export const tasksApi = {
  list: async (params: TaskListParams = {}): Promise<Task[]> => {
    const { data } = await api.get<Task[]>('/tasks', { params });
    return data;
  },
  get: async (id: string): Promise<Task> => {
    const { data } = await api.get<Task>(`/tasks/${id}`);
    return data;
  },
  create: async (input: CreateTaskInput): Promise<Task> => {
    const { data } = await api.post<Task>('/tasks', input);
    return data;
  },
  update: async (id: string, input: UpdateTaskInput): Promise<Task> => {
    const { data } = await api.patch<Task>(`/tasks/${id}`, input);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
  /** Persist a new column order after a drag-and-drop reorder. */
  reorder: async (input: ReorderTasksInput): Promise<void> => {
    await api.patch('/tasks/reorder', input);
  },
  activity: async (id: string): Promise<Activity[]> => {
    const { data } = await api.get<Activity[]>(`/tasks/${id}/activity`);
    return data;
  },
};

/* -------------------------------------------------------------------------- */
/*                                  Comments                                  */
/* -------------------------------------------------------------------------- */

export const commentsApi = {
  list: async (taskId: string): Promise<Comment[]> => {
    const { data } = await api.get<Comment[]>(`/tasks/${taskId}/comments`);
    return data;
  },
  create: async (taskId: string, body: string): Promise<Comment> => {
    const { data } = await api.post<Comment>(`/tasks/${taskId}/comments`, {
      body,
    });
    return data;
  },
  remove: async (taskId: string, commentId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}/comments/${commentId}`);
  },
};
