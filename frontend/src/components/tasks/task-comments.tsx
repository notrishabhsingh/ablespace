'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  MoreHorizontal,
  Paperclip,
  SendHorizontal,
  Smile,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRelativeTime, getInitials } from '@/lib/format';
import type { Comment } from '@/types';
import {
  useComments,
  useCreateComment,
  useDeleteComment,
} from '@/hooks/use-comments';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { memberAvatarUrl } from './task-visuals';

/**
 * The task's discussion thread (Figma 07). A comment list followed by a reply
 * composer and a top-level "Add a comment" composer. Activity/"Updates" lives
 * separately in the right details column — this column is conversation only.
 *
 * Note: threaded replies aren't persisted (the API stores flat comments), so
 * both composers post a top-level comment; the reply box is a second entry
 * point shown once a conversation exists. See README for this deviation.
 */
export function TaskComments({ taskId }: { taskId: string }) {
  const { data: comments, isLoading } = useComments(taskId);
  const createComment = useCreateComment(taskId);
  const list = comments ?? [];

  const post = (body: string, onDone: () => void) =>
    createComment.mutate(body, {
      onSuccess: onDone,
      onError: () => toast.error('Could not post your comment.'),
    });

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold">Comments</h2>

      {isLoading ? (
        <FeedSkeleton />
      ) : list.length === 0 ? (
        <p className="rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">
          No comments yet. Start the conversation.
        </p>
      ) : (
        <>
          <ul className="space-y-3">
            {list.map((c) => (
              <CommentCard key={c.id} taskId={taskId} comment={c} />
            ))}
          </ul>
          <Composer
            placeholder="Leave a reply…"
            withAvatar
            pending={createComment.isPending}
            onSubmit={post}
          />
        </>
      )}

      <Composer
        placeholder="Add a comment…"
        pending={createComment.isPending}
        onSubmit={post}
      />
    </section>
  );
}

/** A single comment with author, timestamp, body, and (own-only) delete menu. */
function CommentCard({
  taskId,
  comment,
}: {
  taskId: string;
  comment: Comment;
}) {
  const { user } = useAuth();
  const deleteComment = useDeleteComment(taskId);
  const isOwn = user?.id === comment.authorId.id;

  return (
    <li className="group rounded-lg border bg-background p-3">
      <div className="flex items-start gap-3">
        <Avatar className="h-7 w-7 shrink-0">
          <AvatarImage
            src={memberAvatarUrl(comment.authorId)}
            alt={comment.authorId.fullName}
          />
          <AvatarFallback className="text-[10px]">
            {getInitials(comment.authorId.fullName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-primary">
              {comment.authorId.fullName}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(comment.createdAt)}
            </span>
            <div className="ml-auto flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <span
                aria-hidden
                className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground"
              >
                <Smile className="h-4 w-4" />
              </span>
              {isOwn && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      aria-label="Comment actions"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onSelect={() =>
                        deleteComment.mutate(comment.id, {
                          onError: () =>
                            toast.error('Could not delete the comment.'),
                        })
                      }
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          <p className="mt-1 whitespace-pre-wrap break-words text-sm text-foreground/90">
            {comment.body}
          </p>
        </div>
      </div>
    </li>
  );
}

/** Rounded input row with a decorative attach glyph and a send button. */
function Composer({
  placeholder,
  withAvatar = false,
  pending,
  onSubmit,
}: {
  placeholder: string;
  withAvatar?: boolean;
  pending: boolean;
  onSubmit: (body: string, onDone: () => void) => void;
}) {
  const { user } = useAuth();
  const [value, setValue] = React.useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = value.trim();
    if (!body) return;
    onSubmit(body, () => setValue(''));
  };

  return (
    <form
      onSubmit={submit}
      className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 focus-within:ring-1 focus-within:ring-ring"
    >
      {withAvatar && (
        <Avatar className="h-7 w-7 shrink-0">
          <AvatarImage
            src={user ? memberAvatarUrl(user) : undefined}
            alt={user?.fullName ?? 'You'}
          />
          <AvatarFallback className="text-[10px]">
            {getInitials(user?.fullName)}
          </AvatarFallback>
        </Avatar>
      )}
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
      <Paperclip aria-hidden className="h-4 w-4 shrink-0 text-muted-foreground" />
      <button
        type="submit"
        disabled={!value.trim() || pending}
        aria-label="Send"
        className={cn(
          'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
          (!value.trim() || pending) && 'pointer-events-none opacity-40',
        )}
      >
        <SendHorizontal className="h-4 w-4" />
      </button>
    </form>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex gap-3 rounded-lg border p-3">
          <Skeleton className="h-7 w-7 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
