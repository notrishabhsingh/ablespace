'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useCreateProject, useUpdateProject } from '@/hooks/use-projects';
import { useTeam } from '@/hooks/use-team';
import type {
  CreateProjectInput,
  Priority,
  Project,
  TaskStatus,
} from '@/types';
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
  PersonSelect,
  PrioritySelect,
  StatusSelect,
} from '../tasks/task-inputs';

interface ProjectFormDialogProps {
  /** 'create' starts blank; 'edit' pre-fills from `project`. */
  mode: 'create' | 'edit';
  /** The project being edited (required when mode === 'edit'). */
  project?: Project;
  /** Optional trigger element. Omit when driving `open` yourself. */
  trigger?: React.ReactNode;
  /** Controlled open state (pair with `onOpenChange`). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Fired with the project id after a successful create/update. */
  onSaved?: (id: string) => void;
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

export function ProjectFormDialog({
  mode,
  project,
  trigger,
  open: controlledOpen,
  onOpenChange,
  onSaved,
}: ProjectFormDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (isControlled) onOpenChange?.(next);
      else setInternalOpen(next);
    },
    [isControlled, onOpenChange],
  );
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [status, setStatus] = React.useState<TaskStatus>('todo');
  const [priority, setPriority] = React.useState<Priority>('no_priority');
  const [dueDate, setDueDate] = React.useState<string | null>(null);
  const [leadId, setLeadId] = React.useState<string | null>(null);
  const [members, setMembers] = React.useState<string[]>([]);
  const [labelsInput, setLabelsInput] = React.useState('');

  const { data: team } = useTeam();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const isPending = createProject.isPending || updateProject.isPending;

  // Seed the form: from the project when editing, blank when creating.
  const seed = React.useCallback(() => {
    setName(project?.name ?? '');
    setDescription(project?.description ?? '');
    setStatus(project?.status ?? 'todo');
    setPriority(project?.priority ?? 'no_priority');
    setDueDate(project?.dueDate ?? null);
    setLeadId(project?.leadId?.id ?? null);
    setMembers(project?.members.map((m) => m.id) ?? []);
    setLabelsInput(project?.labels.join(', ') ?? '');
  }, [project]);

  // Seed the form whenever the dialog opens — covers both the trigger path and
  // an externally controlled `open` (e.g. opened from a row's actions menu).
  React.useEffect(() => {
    if (open) seed();
  }, [open, seed]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Give your project a name first.');
      return;
    }

    // Always send the full set of fields so edits can also clear values.
    const input: CreateProjectInput = {
      name: trimmed,
      description: description.trim(),
      status,
      priority,
      leadId: leadId ?? undefined,
      members,
      labels: parseLabels(labelsInput),
    };
    if (dueDate) input.dueDate = dueDate;

    if (mode === 'edit' && project) {
      updateProject.mutate(
        { id: project.id, input },
        {
          onSuccess: (updated) => {
            toast.success('Project updated');
            setOpen(false);
            onSaved?.(updated.id);
          },
          onError: () => toast.error('Could not update the project.'),
        },
      );
    } else {
      createProject.mutate(input, {
        onSuccess: (created) => {
          toast.success('Project created');
          setOpen(false);
          onSaved?.(created.id);
        },
        onError: () => toast.error('Could not create the project.'),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit project' : 'Create project'}
          </DialogTitle>
          <DialogDescription>
            Group related tasks under a project. You can refine the details
            later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="project-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="project-name"
              autoFocus
              placeholder="e.g. Marketing website revamp"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              rows={3}
              placeholder="What is this project about?"
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
              <Label>Lead</Label>
              <PersonSelect
                value={leadId}
                onChange={setLeadId}
                people={team ?? []}
                placeholder="No lead"
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

          <div className="space-y-1.5">
            <Label htmlFor="project-labels">Labels</Label>
            <Input
              id="project-labels"
              placeholder="Comma-separated, e.g. web, q3"
              value={labelsInput}
              onChange={(e) => setLabelsInput(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className={cn(isPending && 'opacity-70')}
            >
              {isPending
                ? 'Saving…'
                : mode === 'edit'
                  ? 'Save changes'
                  : 'Create project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
