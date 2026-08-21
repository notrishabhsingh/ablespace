'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ExternalLink, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDueDate, getInitials } from '@/lib/format';
import { useDeleteProject } from '@/hooks/use-projects';
import type { Project } from '@/types';
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
  PriorityIcon,
  StatusIcon,
  memberAvatarUrl,
} from '@/components/tasks/task-visuals';
import { ProjectFormDialog } from './project-form-dialog';

/** Visibility flags for the optional table columns. */
export interface ProjectColumns {
  priority: boolean;
  lead: boolean;
  dueDate: boolean;
  status: boolean;
  labels: boolean;
}

export function ProjectRow({
  project,
  columns,
}: {
  project: Project;
  columns: ProjectColumns;
}) {
  const router = useRouter();
  const href = `/projects/${project.id}`;
  const deleteProject = useDeleteProject();
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const lead = project.leadId ?? null;

  const go = () => router.push(href);

  const handleDelete = () => {
    deleteProject.mutate(project.id, {
      onSuccess: () => {
        toast.success('Project deleted');
        setDeleteOpen(false);
      },
      onError: () => toast.error('Could not delete the project.'),
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
      {/* Name */}
      <td className="max-w-0 px-4 py-2.5 align-middle">
        <div className="truncate font-medium">{project.name}</div>
        {project.description && (
          <div className="truncate text-xs text-muted-foreground">
            {project.description}
          </div>
        )}
      </td>

      {columns.priority && (
        <td className="whitespace-nowrap px-4 py-2.5 align-middle">
          <PriorityIcon priority={project.priority} withLabel colorLabel />
        </td>
      )}

      {columns.lead && (
        <td className="hidden whitespace-nowrap px-4 py-2.5 align-middle md:table-cell">
          {lead ? (
            <span className="inline-flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={memberAvatarUrl(lead)} alt={lead.fullName} />
                <AvatarFallback className="text-[10px]">
                  {getInitials(lead.fullName)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-sm">{lead.fullName}</span>
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </td>
      )}

      {columns.dueDate && (
        <td className="hidden whitespace-nowrap px-4 py-2.5 align-middle text-sm text-muted-foreground sm:table-cell">
          {project.dueDate ? formatDueDate(project.dueDate) : '—'}
        </td>
      )}

      {columns.status && (
        <td className="hidden whitespace-nowrap px-4 py-2.5 align-middle lg:table-cell">
          <StatusIcon status={project.status} withLabel />
        </td>
      )}

      {columns.labels && (
        <td className="hidden px-4 py-2.5 align-middle lg:table-cell">
          {project.labels.length > 0 ? (
            <LabelChips labels={project.labels} max={2} />
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </td>
      )}

      {/* Actions — stops row navigation and hosts the edit/delete dialogs. */}
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
              aria-label={`Actions for ${project.name}`}
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
            <DropdownMenuItem
              onSelect={() => setTimeout(() => setEditOpen(true), 0)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
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

        {/* Controlled edit dialog (no trigger — opened from the menu). */}
        <ProjectFormDialog
          mode="edit"
          project={project}
          open={editOpen}
          onOpenChange={setEditOpen}
        />

        {/* Delete confirmation */}
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete this project?</DialogTitle>
              <DialogDescription>
                This removes “{project.name}”. Tasks in this project are not
                deleted, but they’ll no longer be grouped under it.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteProject.isPending}
                className={cn(deleteProject.isPending && 'opacity-70')}
              >
                {deleteProject.isPending ? 'Deleting…' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </td>
    </tr>
  );
}
