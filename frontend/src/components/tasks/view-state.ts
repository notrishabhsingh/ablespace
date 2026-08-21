import type { Priority, Task, TaskField, TaskStatus } from '@/types';

/**
 * Client-side view state for the tasks workspace. We fetch a workspace's (or
 * project's) tasks once and group/filter them in memory, so filters can be
 * multi-select and instant without extra round-trips.
 */
export interface TaskFilters {
  status: TaskStatus[];
  priority: Priority[];
  members: string[];
  labels: string[];
}

export const EMPTY_FILTERS: TaskFilters = {
  status: [],
  priority: [],
  members: [],
  labels: [],
};

/** How many filter facets are currently narrowing the list. */
export function countActiveFilters(f: TaskFilters): number {
  return (
    f.status.length + f.priority.length + f.members.length + f.labels.length
  );
}

/** Toggle a value within one of the filter arrays immutably. */
export function toggleFilterValue<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

/** Apply the active filters + search query to a task list (all client-side). */
export function filterTasks(
  tasks: Task[],
  filters: TaskFilters,
  search: string,
): Task[] {
  const q = search.trim().toLowerCase();
  return tasks.filter((task) => {
    if (filters.status.length && !filters.status.includes(task.status)) {
      return false;
    }
    if (filters.priority.length && !filters.priority.includes(task.priority)) {
      return false;
    }
    if (
      filters.members.length &&
      !task.members.some((m) => filters.members.includes(m.id))
    ) {
      return false;
    }
    if (
      filters.labels.length &&
      !task.labels.some((l) => filters.labels.includes(l))
    ) {
      return false;
    }
    if (q) {
      const haystack = [
        task.title,
        task.description,
        ...task.labels,
        ...task.members.map((m) => m.fullName),
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

/** Which optional columns/fields are visible. Status is implied by grouping. */
export const DEFAULT_FIELDS: Record<TaskField, boolean> = {
  priority: true,
  members: true,
  dueDate: true,
  labels: true,
  status: false,
  reporter: false,
};

export const FIELD_LABELS: Record<TaskField, string> = {
  priority: 'Priority',
  members: 'Members',
  dueDate: 'Due date',
  labels: 'Labels',
  status: 'Status',
  reporter: 'Reporter',
};

export const FIELD_ORDER: TaskField[] = [
  'priority',
  'members',
  'dueDate',
  'labels',
  'status',
  'reporter',
];
