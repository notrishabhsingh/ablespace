'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ChevronRight,
  Copy,
  ExternalLink,
  Eye,
  Link2,
  Lock,
  MoreHorizontal,
  PanelRight,
  Paperclip,
  Plus,
  Share2,
  Tag,
  Trash2,
  Unlock,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { isOverdue } from '@/lib/format';
import type { Resource, Task, UpdateTaskInput } from '@/types';
import { useDeleteTask, useTask, useUpdateTask } from '@/hooks/use-tasks';
import { useTeam } from '@/hooks/use-team';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { DueDatePicker, MemberMultiSelect } from './task-inputs';
import { TaskDetailsPanel } from './task-details-panel';
import { SubtaskList } from './subtask-list';
import { TaskComments } from './task-comments';
import { TaskActivity } from './task-activity';

export function TaskDetail({ taskId }: { taskId: string }) {
  const router = useRouter();
  const { data: task, isLoading, isError } = useTask(taskId);
  const { data: team } = useTeam();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [showDetails, setShowDetails] = React.useState(true);
  const [locked, setLocked] = React.useState(false);

  // Keep the local lock affordance in sync with the loaded task.
  React.useEffect(() => {
    if (task) setLocked(task.locked);
  }, [task]);

  const patch = (input: UpdateTaskInput) =>
    updateTask.mutate({ id: taskId, input });

  const copyLink = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard
      ?.writeText(window.location.href)
      .then(() => toast.success('Link copied to clipboard'))
      .catch(() => toast.error('Could not copy the link.'));
  };

  const handleDelete = () => {
    deleteTask.mutate(taskId, {
      onSuccess: () => {
        toast.success('Task deleted');
        router.push('/tasks');
      },
      onError: () => toast.error('Could not delete the task.'),
    });
  };

  if (isLoading) {
    return (
      <>
        <PageHeader title="Task" />
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-5xl space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </>
    );
  }

  if (isError || !task) {
    return (
      <>
        <PageHeader title="Task" />
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="text-sm font-medium">Task not found</p>
          <Button asChild size="sm" variant="outline">
            <Link href="/tasks">Back to tasks</Link>
          </Button>
        </div>
      </>
    );
  }

  const project = task.projectId ?? null;
  const watcherCount = task.watchers?.length ?? 0;

  const breadcrumb = (
    <nav className="flex min-w-0 items-center gap-1.5 text-sm">
      <Link
        href={project ? `/projects/${project.id}` : '/tasks'}
        className="shrink-0 text-muted-foreground hover:text-foreground"
      >
        {project ? project.name : 'Tasks'}
      </Link>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="truncate font-medium">{task.title}</span>
    </nav>
  );

  const headerActions = (
    <div className="flex items-center gap-0.5">
      <Button
        variant="ghost"
        size="icon"
        className={cn('h-8 w-8', locked && 'text-primary')}
        aria-label={locked ? 'Unlock task' : 'Lock task'}
        title={locked ? 'Unlock task' : 'Lock task'}
        onClick={() => setLocked((v) => !v)}
      >
        {locked ? (
          <Lock className="h-4 w-4" />
        ) : (
          <Unlock className="h-4 w-4" />
        )}
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1 rounded-md border px-2 text-sm text-primary transition-colors hover:bg-accent"
            aria-label={`${watcherCount} watching`}
            title="Watchers"
          >
            <Eye className="h-4 w-4" />
            {watcherCount}
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-56 p-2">
          <p className="px-1 pb-1 text-xs font-medium text-muted-foreground">
            Watchers
          </p>
          {watcherCount === 0 ? (
            <p className="px-1 py-1 text-sm text-muted-foreground">
              No one is watching yet.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {task.watchers.map((w) => (
                <li key={w.id} className="px-1 py-1 text-sm">
                  {w.fullName}
                </li>
              ))}
            </ul>
          )}
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        aria-label="Copy link"
        title="Copy link"
        onClick={copyLink}
      >
        <Share2 className="h-4 w-4" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="More actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onSelect={copyLink}>
            <Copy className="mr-2 h-4 w-4" />
            Copy link
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => setTimeout(() => setConfirmOpen(true), 0)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        size="icon"
        className={cn('h-8 w-8', showDetails && 'bg-accent text-foreground')}
        aria-label={showDetails ? 'Hide details' : 'Show details'}
        title={showDetails ? 'Hide details' : 'Show details'}
        onClick={() => setShowDetails((v) => !v)}
      >
        <PanelRight className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <>
      <PageHeader actions={headerActions}>{breadcrumb}</PageHeader>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4 md:p-6 lg:flex-row">
          {/* Main column */}
          <div className="min-w-0 flex-1 space-y-6">
            <div className="space-y-2">
              <input
                key={`${task.id}-title`}
                defaultValue={task.title}
                aria-label="Task title"
                className="w-full bg-transparent text-2xl font-semibold outline-none placeholder:text-muted-foreground"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.currentTarget.blur();
                }}
                onBlur={(e) => {
                  const value = e.target.value.trim();
                  if (!value) {
                    e.target.value = task.title;
                    return;
                  }
                  if (value !== task.title) patch({ title: value });
                }}
              />
              <textarea
                key={`${task.id}-desc`}
                defaultValue={task.description}
                placeholder="Add a description…"
                rows={2}
                className="w-full resize-y bg-transparent text-sm leading-relaxed text-muted-foreground outline-none placeholder:text-muted-foreground"
                onBlur={(e) => {
                  const value = e.target.value;
                  if (value !== task.description) patch({ description: value });
                }}
              />
            </div>

            {/* Quick-glance properties (mirror the right-hand Details panel) */}
            <div className="space-y-1">
              <PropertyLine label="Properties">
                <MemberMultiSelect
                  value={task.members.map((m) => m.id)}
                  onChange={(members) => patch({ members })}
                  people={team ?? []}
                  placeholder="Assignee"
                  className="h-7 gap-1.5 border-0 bg-transparent px-1.5 font-normal shadow-none hover:bg-muted"
                />
                <DueDatePicker
                  value={task.dueDate}
                  onChange={(dueDate) => patch({ dueDate })}
                  placeholder="Due date"
                  className={cn(
                    'h-7 gap-1.5 px-2 font-normal shadow-none',
                    task.dueDate && isOverdue(task.dueDate)
                      ? 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400'
                      : task.dueDate
                        ? 'border bg-transparent hover:bg-muted'
                        : 'border border-dashed bg-transparent text-muted-foreground hover:bg-muted',
                  )}
                />
              </PropertyLine>

              <PropertyLine label="Labels">
                <PropertyLabels
                  labels={task.labels}
                  onChange={(labels) => patch({ labels })}
                />
              </PropertyLine>

              <PropertyLine label="Resources">
                <ResourcesInline task={task} onUpdate={patch} />
              </PropertyLine>
            </div>

            <SubtaskList parentTaskId={task.id} />
            <TaskComments taskId={task.id} />
          </div>

          {/* Details + activity */}
          {showDetails && (
            <aside className="w-full shrink-0 space-y-4 lg:w-80">
              <div className="lg:sticky lg:top-0 lg:space-y-4">
                <TaskDetailsPanel
                  task={task}
                  team={team ?? []}
                  onUpdate={patch}
                />
                <TaskActivity taskId={task.id} />
              </div>
            </aside>
          )}
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this task?</DialogTitle>
            <DialogDescription>
              This permanently removes “{task.title}” and its subtasks. This
              can’t be undone.
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
    </>
  );
}

/** A labeled, single-line property row used above the subtasks table. */
function PropertyLine({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-20 shrink-0 pt-1.5 text-sm text-muted-foreground">
        {label}
      </span>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
        {children}
      </div>
    </div>
  );
}

/** Bordered label chips (tag glyph) plus a popover to add a new label. */
function PropertyLabels({
  labels,
  onChange,
}: {
  labels: string[];
  onChange: (labels: string[]) => void;
}) {
  const [draft, setDraft] = React.useState('');
  const [open, setOpen] = React.useState(false);

  const add = () => {
    const value = draft.trim();
    if (!value) return;
    if (!labels.includes(value)) onChange([...labels, value]);
    setDraft('');
    setOpen(false);
  };

  const remove = (label: string) =>
    onChange(labels.filter((l) => l !== label));

  return (
    <>
      {labels.map((label) => (
        <span
          key={label}
          className="group inline-flex items-center gap-1 rounded-md border bg-background px-2 py-0.5 text-xs"
        >
          <Tag className="h-3 w-3 text-muted-foreground" />
          {label}
          <button
            type="button"
            aria-label={`Remove ${label}`}
            onClick={() => remove(label)}
            className="text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md border border-dashed px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <Plus className="h-3 w-3" />
            Add label
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-56 space-y-2">
          <Label htmlFor="add-label" className="text-xs">
            New label
          </Label>
          <Input
            id="add-label"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. Research"
            className="h-8"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                add();
              }
            }}
          />
          <Button size="sm" className="w-full" onClick={add}>
            Add label
          </Button>
        </PopoverContent>
      </Popover>
    </>
  );
}

/** Existing resource chips plus an "Add document or link…" popover. */
function ResourcesInline({
  task,
  onUpdate,
}: {
  task: Task;
  onUpdate: (input: UpdateTaskInput) => void;
}) {
  const [label, setLabel] = React.useState('');
  const [url, setUrl] = React.useState('');
  const [open, setOpen] = React.useState(false);

  const add = () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;
    const resource: Resource = {
      label: label.trim() || trimmedUrl,
      url: trimmedUrl,
    };
    onUpdate({ resources: [...task.resources, resource] });
    setLabel('');
    setUrl('');
    setOpen(false);
  };

  const remove = (index: number) =>
    onUpdate({ resources: task.resources.filter((_, i) => i !== index) });

  return (
    <>
      {task.resources.map((r, i) => (
        <span
          key={`${r.url}-${i}`}
          className="group inline-flex items-center gap-1.5 rounded-md border bg-background px-2 py-0.5 text-xs"
        >
          <a
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            {r.label}
          </a>
          <button
            type="button"
            aria-label={`Remove ${r.label}`}
            onClick={() => remove(i)}
            className="text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Paperclip className="h-3.5 w-3.5" />
            Add document or link…
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 space-y-2">
          <div className="space-y-1.5">
            <Label htmlFor="resource-label" className="text-xs">
              Label
            </Label>
            <Input
              id="resource-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Design file"
              className="h-8"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="resource-url" className="text-xs">
              URL
            </Label>
            <Input
              id="resource-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              className="h-8"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  add();
                }
              }}
            />
          </div>
          <Button size="sm" className="w-full gap-1.5" onClick={add}>
            <Link2 className="h-3.5 w-3.5" />
            Add resource
          </Button>
        </PopoverContent>
      </Popover>
    </>
  );
}
