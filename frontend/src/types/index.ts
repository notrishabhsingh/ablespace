/**
 * Shared API types. These mirror the JSON the NestJS backend returns after its
 * Mongoose `toJSON` transform, which exposes `id` (string) and drops `_id`/`__v`.
 * Reference fields (members, reporter, lead, author, etc.) are populated by the
 * backend on read, so here they are objects — not raw id strings.
 */

/** Task / project workflow status (matches backend TaskStatus enum). */
export type TaskStatus = 'backlog' | 'todo' | 'doing' | 'completed' | 'on_hold';

/** Priority level (matches backend Priority enum). */
export type Priority = 'no_priority' | 'urgent' | 'high' | 'medium' | 'low';

/** Activity feed entry kind (matches backend ActivityType enum). */
export type ActivityType =
  | 'created'
  | 'status_changed'
  | 'priority_changed'
  | 'assigned'
  | 'due_date_changed'
  | 'updated';

export interface User {
  id: string;
  email?: string;
  fullName: string;
  username?: string;
  title?: string;
  avatarUrl?: string;
  workspaceName?: string;
  isGuest: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Slim user shape returned when a reference is populated with a `select`. */
export interface UserRef {
  id: string;
  fullName: string;
  username?: string;
  avatarUrl?: string;
}

/** Slim project shape returned when Task.projectId is populated. */
export interface ProjectRef {
  id: string;
  name: string;
}

export interface Resource {
  label: string;
  url: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  labels: string[];
  members: UserRef[];
  reporterId?: UserRef | null;
  watchers: UserRef[];
  teams: string[];
  resources: Resource[];
  startDate?: string | null;
  dueDate?: string | null;
  projectId?: ProjectRef | null;
  parentTaskId?: string | null;
  locked: boolean;
  order: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  leadId?: UserRef | null;
  members: UserRef[];
  reporterId?: UserRef | null;
  dueDate?: string | null;
  labels: string[];
  teams: string[];
  order: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: UserRef;
  body: string;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  taskId: string;
  userId: UserRef;
  type: ActivityType;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

/* ----------------------------- Input payloads ---------------------------- */

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  labels?: string[];
  members?: string[];
  reporterId?: string;
  watchers?: string[];
  teams?: string[];
  resources?: Resource[];
  startDate?: string | null;
  dueDate?: string | null;
  projectId?: string;
  parentTaskId?: string;
  order?: number;
}

export type UpdateTaskInput = Partial<CreateTaskInput>;

export interface CreateProjectInput {
  name: string;
  description?: string;
  priority?: Priority;
  status?: TaskStatus;
  leadId?: string;
  members?: string[];
  reporterId?: string;
  dueDate?: string;
  labels?: string[];
  teams?: string[];
}

export type UpdateProjectInput = Partial<CreateProjectInput>;

export interface UpdateUserInput {
  fullName?: string;
  username?: string;
  title?: string;
  email?: string;
  avatarUrl?: string;
  workspaceName?: string;
}

export interface ReorderTasksInput {
  status: TaskStatus;
  orderedIds: string[];
}

/** Fields that can be shown/hidden via the "Fields" menu. */
export type TaskField =
  | 'priority'
  | 'members'
  | 'dueDate'
  | 'labels'
  | 'status'
  | 'reporter';

export type ViewMode = 'list' | 'board';
