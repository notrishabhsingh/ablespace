'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useCreateTask } from '@/hooks/use-tasks';
import { useTeam } from '@/hooks/use-team';
import type { CreateTaskInput, Priority, TaskStatus } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  DueDatePicker,
  MemberMultiSelect,
  PrioritySelect,
  StatusSelect,
} from './task-inputs';

interface AddTaskDialogProps {
  /** Pre-selects the status (used when opening from a board column / list group). */
  defaultStatus?: TaskStatus;
  /** Scopes the task to a project. */
  projectId?: string;
  /** Creates the task as a subtask of another. */
  parentTaskId?: string;
  /** The clickable element that opens the dialog. */
  trigger: React.ReactNode;
  /** Fired after a task is successfully created. */
  onCreated?: () => void;
}

function parseLabels(input: string): string[] {
  return Array.from(
    new Set(
      input
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  );
}

export function AddTaskDialog({
  defaultStatus = 'todo',
  projectId,
  parentTaskId,
  trigger,
  onCreated,
}: AddTaskDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [status, setStatus] = React.useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = React.useState<Priority>('no_priority');
  const [dueDate, setDueDate] = React.useState<string | null>(null);
  const [members, setMembers] = React.useState<string[]>([]);
  const [labelsInput, setLabelsInput] = React.useState('');

  const { data: team } = useTeam();
  const createTask = useCreateTask();

  const reset = React.useCallback(() => {
    setTitle('');
    setDescription('');
    setStatus(defaultStatus);
    setPriority('no_priority');
    setDueDate(null);
    setMembers([]);
    setLabelsInput('');
  }, [defaultStatus]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) reset();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      toast.error('Give your task a title first.');
      return;
    }

    const input: CreateTaskInput = {
      title: trimmed,
      status,
      priority,
    };
    if (description.trim()) input.description = description.trim();
    if (dueDate) input.dueDate = dueDate;
    if (members.length) input.members = members;
    const labels = parseLabels(labelsInput);
    if (labels.length) input.labels = labels;
    if (projectId) input.projectId = projectId;
    if (parentTaskId) input.parentTaskId = parentTaskId;

    createTask.mutate(input, {
      onSuccess: () => {
        toast.success('Task created');
        handleOpenChange(false);
        onCreated?.();
      },
      onError: () => toast.error('Could not create the task. Please try again.'),
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {parentTaskId ? 'New subtask' : 'Create task'}
          </DialogTitle>
          <DialogDescription>
            Add a task to your workspace. You can refine the details later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="task-title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="task-title"
              autoFocus
              placeholder="e.g. Design the onboarding flow"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              rows={3}
              placeholder="Add more detail…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <StatusSelect
                value={status}
                onChange={setStatus}
                className="w-full"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <PrioritySelect
                value={priority}
                onChange={setPriority}
                className="w-full"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Due date</Label>
              <DueDatePicker
                value={dueDate}
                onChange={setDueDate}
                className="w-full"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Members</Label>
              <MemberMultiSelect
                value={members}
                onChange={setMembers}
                people={team ?? []}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-labels">Labels</Label>
            <Input
              id="task-labels"
              placeholder="Comma-separated, e.g. design, frontend"
              value={labelsInput}
              onChange={(e) => setLabelsInput(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTask.isPending}
              className={cn(createTask.isPending && 'opacity-70')}
            >
              {createTask.isPending ? 'Creating…' : 'Create task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
