'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Plus,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDueDate } from '@/lib/format';
import type { Task } from '@/types';
import { useDeleteTask, useTasks, useUpdateTask } from '@/hooks/use-tasks';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MemberAvatars, PriorityIcon } from './task-visuals';
import { AddTaskDialog } from './add-task-dialog';

/**
 * Subtasks rendered as a compact table (Figma 07/09): Task | Priority | Members
 * | Due Date | Actions, with a collapsible header and an "Add Subtasks" footer
 * row. Kept intentionally close to the main list tables for visual consistency.
 */
export function SubtaskList({ parentTaskId }: { parentTaskId: string }) {
  const { data, isLoading } = useTasks({ parentTaskId });
  const [open, setOpen] = React.useState(true);
  const subtasks = data ?? [];
  const done = subtasks.filter((s) => s.status === 'completed').length;

  return (
    <section className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm font-semibold"
      >
        {open ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        Subtasks
        {subtasks.length > 0 && (
          <span className="font-normal text-muted-foreground">
            {done}/{subtasks.length}
          </span>
        )}
      </button>

      {open && (
        <div className="overflow-hidden rounded-lg border">
          {isLoading ? (
            <div className="space-y-2 p-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-2/3" />
            </div>
          ) : (
            <table className="w-full text-sm">
              {subtasks.length > 0 && (
                <thead>
                  <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Task</th>
                    <th className="px-3 py-2 font-medium">Priority</th>
                    <th className="hidden px-3 py-2 font-medium sm:table-cell">
                      Members
                    </th>
                    <th className="hidden px-3 py-2 font-medium sm:table-cell">
                      Due Date
                    </th>
                    <th className="w-10 px-3 py-2 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
              )}
              <tbody className="divide-y">
                {subtasks.map((task) => (
                  <SubtaskRow key={task.id} task={task} />
                ))}
                <tr>
                  <td colSpan={5} className="p-0">
                    <AddTaskDialog
                      parentTaskId={parentTaskId}
                      trigger={
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
                        >
                          <Plus className="h-4 w-4" />
                          Add Subtasks
                        </button>
                      }
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      )}
    </section>
  );
}

/** One subtask row: title link, priority, members, due date, and an actions menu. */
function SubtaskRow({ task }: { task: Task }) {
  const router = useRouter();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const isDone = task.status === 'completed';

  const go = () => router.push(`/tasks/${task.id}`);

  const toggleDone = () =>
    updateTask.mutate({
      id: task.id,
      input: { status: isDone ? 'todo' : 'completed' },
    });

  const handleDelete = () =>
    deleteTask.mutate(task.id, {
      onSuccess: () => {
        toast.success('Subtask deleted');
        setConfirmOpen(false);
      },
      onError: () => toast.error('Could not delete the subtask.'),
    });

  return (
    <tr
      onClick={go}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') go();
      }}
      className="cursor-pointer outline-none transition-colors hover:bg-muted/40 focus-visible:bg-muted/40"
    >
      <td className="max-w-0 px-3 py-2.5">
        <span
          className={cn(
            'block truncate',
            isDone && 'text-muted-foreground line-through',
          )}
        >
          {task.title}
        </span>
      </td>
      <td className="px-3 py-2.5">
        <PriorityIcon priority={task.priority} withLabel colorLabel />
      </td>
      <td className="hidden px-3 py-2.5 sm:table-cell">
        {task.members.length > 0 ? (
          <MemberAvatars members={task.members} max={3} />
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="hidden whitespace-nowrap px-3 py-2.5 text-muted-foreground sm:table-cell">
        {task.dueDate ? formatDueDate(task.dueDate) : '—'}
      </td>
      <td className="px-3 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              aria-label="Subtask actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onSelect={go}>Open subtask</DropdownMenuItem>
            <DropdownMenuItem onSelect={toggleDone}>
              {isDone ? 'Mark incomplete' : 'Mark complete'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => setTimeout(() => setConfirmOpen(true), 0)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete this subtask?</DialogTitle>
              <DialogDescription>
                This permanently removes “{task.title}”. This can’t be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteTask.isPending}
              >
                {deleteTask.isPending ? 'Deleting…' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </td>
    </tr>
  );
}
