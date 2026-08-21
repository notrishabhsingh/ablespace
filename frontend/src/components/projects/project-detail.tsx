'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { useDeleteProject, useProject } from '@/hooks/use-projects';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PriorityIcon, StatusIcon } from '@/components/tasks/task-visuals';
import { TasksWorkspace } from '@/components/tasks/tasks-workspace';
import { ProjectFormDialog } from './project-form-dialog';

export function ProjectDetail({ projectId }: { projectId: string }) {
  const router = useRouter();
  const { data: project, isLoading, isError } = useProject(projectId);
  const deleteProject = useDeleteProject();
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const handleDelete = () => {
    deleteProject.mutate(projectId, {
      onSuccess: () => {
        toast.success('Project deleted');
        router.push('/projects');
      },
      onError: () => toast.error('Could not delete the project.'),
    });
  };

  if (isLoading) {
    return (
      <>
        <PageHeader title="Project" />
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <Skeleton className="h-6 w-48" />
        </div>
      </>
    );
  }

  if (isError || !project) {
    return (
      <>
        <PageHeader title="Project" />
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="text-sm font-medium">Project not found</p>
          <Button asChild size="sm" variant="outline">
            <Link href="/projects">Back to projects</Link>
          </Button>
        </div>
      </>
    );
  }

  const headerLeft = (
    <div className="flex min-w-0 items-center gap-2">
      <nav className="flex min-w-0 items-center gap-1.5 text-sm">
        <Link
          href="/projects"
          className="shrink-0 text-muted-foreground hover:text-foreground"
        >
          Projects
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="max-w-[40vw] truncate font-medium">
          {project.name}
        </span>
      </nav>
      <span className="hidden items-center gap-1 md:inline-flex">
        <StatusIcon status={project.status} />
        <PriorityIcon priority={project.priority} />
      </span>
      <ProjectFormDialog
        mode="edit"
        project={project}
        trigger={
          <Button variant="ghost" size="icon" aria-label="Edit project">
            <Pencil className="h-4 w-4" />
          </Button>
        }
      />
      <Button
        variant="ghost"
        size="icon"
        aria-label="Delete project"
        onClick={() => setDeleteOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <>
      <TasksWorkspace
        projectId={project.id}
        title={project.name}
        headerLeft={headerLeft}
      />

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
            >
              {deleteProject.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
