'use client';

import * as React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { formatRelativeTime, getInitials } from '@/lib/format';
import { useTaskActivity } from '@/hooks/use-tasks';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { memberAvatarUrl } from './task-visuals';

/**
 * The "Updates" activity feed shown beneath the Details card (Figma 07). This is
 * a server-generated audit trail (status/priority/assignment changes) — distinct
 * from the human discussion in Comments. Collapsible to match the design.
 */
export function TaskActivity({ taskId }: { taskId: string }) {
  const { data: activity, isLoading } = useTaskActivity(taskId);
  const [open, setOpen] = React.useState(true);
  const list = activity ?? [];

  return (
    <section className="rounded-xl border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1.5 px-4 py-3 text-sm font-semibold"
      >
        {open ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        Updates
      </button>

      {open && (
        <div className="border-t px-4 py-3">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-3 w-40" />
                </div>
              ))}
            </div>
          ) : list.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No activity recorded yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {list.map((a) => (
                <li key={a.id} className="flex items-start gap-2 text-sm">
                  <Avatar className="h-6 w-6 shrink-0">
                    <AvatarImage
                      src={memberAvatarUrl(a.userId)}
                      alt={a.userId.fullName}
                    />
                    <AvatarFallback className="text-[9px]">
                      {getInitials(a.userId.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {a.userId.fullName}
                    </span>{' '}
                    {a.message}
                    <span className="ml-1 whitespace-nowrap text-xs">
                      · {formatRelativeTime(a.createdAt)}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
