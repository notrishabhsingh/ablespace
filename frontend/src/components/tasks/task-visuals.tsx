'use client';

import { CalendarDays, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate, getInitials, isOverdue } from '@/lib/format';
import { getPriorityMeta, getStatusMeta } from '@/lib/task-meta';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Priority, TaskStatus, UserRef } from '@/types';

export function memberAvatarUrl(member: {
  id?: string;
  username?: string;
  fullName?: string;
  avatarUrl?: string;
}): string {
  if (member.avatarUrl) return member.avatarUrl;
  const seed = member.username || member.fullName || member.id || 'user';
  return `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(seed)}`;
}

/** Status glyph in its fixed semantic color, optionally with its label. */
export function StatusIcon({
  status,
  className,
  withLabel = false,
}: {
  status: TaskStatus;
  className?: string;
  withLabel?: boolean;
}) {
  const meta = getStatusMeta(status);
  const Icon = meta.icon;
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className={cn('h-4 w-4 shrink-0', meta.iconClass, className)} />
      {withLabel && <span className="text-sm">{meta.label}</span>}
    </span>
  );
}

/** Priority glyph in its fixed semantic color, optionally with its label. */
export function PriorityIcon({
  priority,
  className,
  withLabel = false,
  colorLabel = false,
}: {
  priority: Priority;
  className?: string;
  withLabel?: boolean;
  /** When true the label text also takes the priority's semantic color. */
  colorLabel?: boolean;
}) {
  const meta = getPriorityMeta(priority);
  const Icon = meta.icon;
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className={cn('h-4 w-4 shrink-0', meta.iconClass, className)} />
      {withLabel && (
        <span className={cn('text-sm', colorLabel && meta.iconClass)}>
          {meta.label}
        </span>
      )}
    </span>
  );
}

/** Overlapping member avatars with a "+N" overflow chip. */
export function MemberAvatars({
  members,
  max = 3,
  size = 'sm',
}: {
  members: UserRef[];
  max?: number;
  size?: 'sm' | 'md';
}) {
  if (!members?.length) return null;
  const shown = members.slice(0, max);
  const extra = members.length - shown.length;
  const dim = size === 'md' ? 'h-7 w-7' : 'h-6 w-6';

  return (
    <div className="flex -space-x-2">
      {shown.map((m) => (
        <Tooltip key={m.id}>
          <TooltipTrigger asChild>
            <Avatar className={cn(dim, 'ring-2 ring-background')}>
              <AvatarImage src={memberAvatarUrl(m)} alt={m.fullName} />
              <AvatarFallback className="text-[10px]">
                {getInitials(m.fullName)}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>{m.fullName}</TooltipContent>
        </Tooltip>
      ))}
      {extra > 0 && (
        <span
          className={cn(
            dim,
            'inline-flex items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground ring-2 ring-background',
          )}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}

/** Due-date pill; turns rose/red when overdue, matching the Figma. */
export function DueDatePill({
  date,
  className,
}: {
  date?: string | null;
  className?: string;
}) {
  if (!date) return null;
  const overdue = isOverdue(date);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium',
        overdue
          ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400'
          : 'border-border bg-muted/60 text-muted-foreground',
        className,
      )}
    >
      <CalendarDays className="h-3 w-3" />
      {formatDate(date)}
    </span>
  );
}

/** Label chips prefixed with a tag glyph. */
export function LabelChips({
  labels,
  max = 3,
  className,
}: {
  labels: string[];
  max?: number;
  className?: string;
}) {
  if (!labels?.length) return null;
  const shown = labels.slice(0, max);
  const extra = labels.length - shown.length;
  return (
    <div className={cn('flex flex-wrap items-center gap-1', className)}>
      <Tag className="h-3 w-3 text-muted-foreground" />
      {shown.map((label) => (
        <span
          key={label}
          className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"
        >
          {label}
        </span>
      ))}
      {extra > 0 && (
        <span className="text-[11px] text-muted-foreground">+{extra}</span>
      )}
    </div>
  );
}
