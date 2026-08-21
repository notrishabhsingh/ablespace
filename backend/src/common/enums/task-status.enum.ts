/**
 * Workflow status for a task or project.
 * The board renders the four workflow lanes (todo/doing/completed/on_hold);
 * `backlog` is selectable in the task detail panel and appears in the list view.
 */
export enum TaskStatus {
  BACKLOG = 'backlog',
  TODO = 'todo',
  DOING = 'doing',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
}

export const TASK_STATUSES = Object.values(TaskStatus);
