'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ExternalLink, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDueDate, getInitials } from '@/lib/format';
import { useDeleteTask } from '@/hooks/use-tasks';
import type { Task, TaskField } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  LabelChips,
  MemberAvatars,
  PriorityIcon,
  StatusIcon,
  memberAvatarUrl,
} from './task-visuals';

/**
 * A single task rendered as a table row for the list view. Column visibility
 * follows the shared `fields` map so it stays in sync with the Fields menu.
 * The whole row navigates to the task; the Actions cell stops propagation and
 * hosts its own menu + delete confirmation.
 */
export function TaskTableRow({
  task,
  fields,
}: {
  task: Task;
  fields: Record<TaskField, boolean>;
}) {
  const router = useRouter();
  const href = `/tasks/${task.id}`;
  const deleteTask = useDeleteTask();
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const reporter = task.reporterId ?? null;

  const go = () => router.push(href);

  const handleDelete = () => {
    deleteTask.mutate(task.id, {
      onSuccess: () => {
        toast.success('Task deleted');
        setDeleteOpen(false);
      },
      onError: () => toast.error('Could not delete the task.'),
    });
  };

  return (
    <tr
      onClick={go}
      onKeyDown={(e) => {
        if (e.key === 'Enter') go();
      }}
      tabIndex={0}
      className="cursor-pointer outline-none transition-colors hover:bg-accent/50 focus-visible:bg-accent/50"
    >
      {/* Title */}
      <td className="max-w-0 px-4 py-2.5 align-middle">
        <div className="truncate">{task.title}</div>
      </td>

      {fields.priority && (
        <td className="whitespace-nowrap px-4 py-2.5 align-middle">
          <PriorityIcon priority={task.priority} withLabel colorLabel />
        </td>
      )}

      {fields.members && (
        <td className="hidden whitespace-nowrap px-4 py-2.5 align-middle sm:table-cell">
          {task.members.length > 0 ? (
            <MemberAvatars members={task.members} max={3} />
          ) : (
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-dashed text-muted-foreground">
              <Plus className="h-3 w-3" />
            </span>
          )}
        </td>
      )}

      {fields.dueDate && (
        <td className="hidden whitespace-nowrap px-4 py-2.5 align-middle text-sm text-muted-foreground sm:table-cell">
          {task.dueDate ? formatDueDate(task.dueDate) : '—'}
        </td>
      )}

      {fields.labels && (
        <td className="hidden px-4 py-2.5 align-middle lg:table-cell">
          {task.labels.length > 0 ? (
            <LabelChips labels={task.labels} max={2} />
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </td>
      )}

      {fields.status && (
        <td className="hidden whitespace-nowrap px-4 py-2.5 align-middle lg:table-cell">
          <StatusIcon status={task.status} withLabel />
        </td>
      )}

      {fields.reporter && (
        <td className="hidden whitespace-nowrap px-4 py-2.5 align-middle md:table-cell">
          {reporter ? (
            <span className="inline-flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={memberAvatarUrl(reporter)}
                  alt={reporter.fullName}
                />
                <AvatarFallback className="text-[10px]">
                  {getInitials(reporter.fullName)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-sm">{reporter.fullName}</span>
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </td>
      )}

      {/* Actions */}
      <td
        className="w-12 px-2 py-2.5 text-right align-middle"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              aria-label={`Actions for ${task.title}`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem asChild>
              <Link href={href}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => setTimeout(() => setDeleteOpen(true), 0)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete this task?</DialogTitle>
              <DialogDescription>
                “{task.title}” will be permanently removed. This can’t be
                undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteTask.isPending}
                className={cn(deleteTask.isPending && 'opacity-70')}
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
