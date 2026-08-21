'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Task, TaskField } from '@/types';
import {
  DueDatePill,
  LabelChips,
  MemberAvatars,
  PriorityIcon,
  StatusIcon,
} from './task-visuals';

interface TaskCardProps {
  task: Task;
  fields: Record<TaskField, boolean>;
  /** Rendered inside a drag overlay — slightly lifted, non-interactive. */
  overlay?: boolean;
  className?: string;
}

export function TaskCard({ task, fields, overlay, className }: TaskCardProps) {
  const showLabels = fields.labels && task.labels.length > 0;
  const showFooter =
    (fields.status || (fields.dueDate && task.dueDate)) ||
    (fields.members && task.members.length > 0);

  const body = (
    <>
      <div className="flex items-start gap-2">
        {fields.priority && (
          <PriorityIcon priority={task.priority} className="mt-0.5" />
        )}
        <p className="line-clamp-2 flex-1 text-sm font-medium leading-snug">
          {task.title}
        </p>
      </div>

      {showLabels && <LabelChips labels={task.labels} className="mt-2" />}

      {showFooter && (
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {fields.status && <StatusIcon status={task.status} />}
            {fields.dueDate && <DueDatePill date={task.dueDate} />}
          </div>
          {fields.members && <MemberAvatars members={task.members} />}
        </div>
      )}
    </>
  );

  const classes = cn(
    'block rounded-lg border bg-card p-3 text-left shadow-sm transition-colors',
    overlay
      ? 'cursor-grabbing border-primary/50 shadow-lg'
      : 'hover:border-primary/40 hover:bg-accent/40',
    className,
  );

  // In the drag overlay we render a plain div (no navigation on drop).
  if (overlay) {
    return <div className={classes}>{body}</div>;
  }

  return (
    <Link href={`/tasks/${task.id}`} className={classes}>
      {body}
    </Link>
  );
}
