'use client';

import * as React from 'react';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { STATUS_ORDER, getStatusMeta } from '@/lib/task-meta';
import type { Task, TaskField, TaskStatus } from '@/types';
import { AddTaskDialog } from './add-task-dialog';
import { TaskTableRow } from './task-row';

interface ListViewProps {
  tasks: Task[];
  fields: Record<TaskField, boolean>;
  projectId?: string;
  /** When filtering/searching, hide status groups that have no matches. */
  hideEmptyGroups?: boolean;
}

export function ListView({
  tasks,
  fields,
  projectId,
  hideEmptyGroups,
}: ListViewProps) {
  const byStatus = React.useMemo(() => {
    const map = {} as Record<TaskStatus, Task[]>;
    for (const status of STATUS_ORDER) {
      map[status] = tasks.filter((t) => t.status === status);
    }
    return map;
  }, [tasks]);

  return (
    <div className="space-y-5">
      {STATUS_ORDER.map((status) => {
        const groupTasks = byStatus[status];
        if (hideEmptyGroups && groupTasks.length === 0) return null;
        return (
          <ListGroup
            key={status}
            status={status}
            tasks={groupTasks}
            fields={fields}
            projectId={projectId}
          />
        );
      })}
    </div>
  );
}

function ListGroup({
  status,
  tasks,
  fields,
  projectId,
}: {
  status: TaskStatus;
  tasks: Task[];
  fields: Record<TaskField, boolean>;
  projectId?: string;
}) {
  const [open, setOpen] = React.useState(true);
  const meta = getStatusMeta(status);
  const Chevron = open ? ChevronDown : ChevronRight;

  // title + actions are always shown; the rest follow the Fields toggles.
  const colSpan =
    2 +
    Number(fields.priority) +
    Number(fields.members) +
    Number(fields.dueDate) +
    Number(fields.labels) +
    Number(fields.status) +
    Number(fields.reporter);

  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mb-2 flex items-center gap-1.5 text-sm font-medium"
      >
        <Chevron className="h-4 w-4 text-muted-foreground" />
        <span>{meta.label}</span>
        <span className="text-xs font-normal text-muted-foreground">
          {tasks.length}
        </span>
      </button>

      {open && (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Task</th>
                {fields.priority && (
                  <th className="px-4 py-2.5 font-medium">Priority</th>
                )}
                {fields.members && (
                  <th className="hidden px-4 py-2.5 font-medium sm:table-cell">
                    Members
                  </th>
                )}
                {fields.dueDate && (
                  <th className="hidden px-4 py-2.5 font-medium sm:table-cell">
                    Due Date
                  </th>
                )}
                {fields.labels && (
                  <th className="hidden px-4 py-2.5 font-medium lg:table-cell">
                    Labels
                  </th>
                )}
                {fields.status && (
                  <th className="hidden px-4 py-2.5 font-medium lg:table-cell">
                    Status
                  </th>
                )}
                {fields.reporter && (
                  <th className="hidden px-4 py-2.5 font-medium md:table-cell">
                    Reporter
                  </th>
                )}
                <th className="px-4 py-2.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tasks.map((task) => (
                <TaskTableRow key={task.id} task={task} fields={fields} />
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td
                    colSpan={colSpan}
                    className="px-4 py-4 text-center text-sm text-muted-foreground"
                  >
                    No tasks here yet.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t">
                <td colSpan={colSpan} className="p-0">
                  <AddTaskDialog
                    defaultStatus={status}
                    projectId={projectId}
                    trigger={
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
                      >
                        <Plus className="h-4 w-4" />
                        Add Task
                      </button>
                    }
                  />
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </section>
  );
}
