'use client';

import * as React from 'react';
import { ListChecks, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaskField, ViewMode } from '@/types';
import { useTasks } from '@/hooks/use-tasks';
import { useTeam } from '@/hooks/use-team';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { BoardView } from './board-view';
import { ListView } from './list-view';
import { FieldsMenu } from './fields-menu';
import { FilterMenu } from './filter-menu';
import { AddTaskDialog } from './add-task-dialog';
import {
  DEFAULT_FIELDS,
  EMPTY_FILTERS,
  type TaskFilters,
  countActiveFilters,
  filterTasks,
} from './view-state';

const VIEW_KEY = 'pyramid.tasks.view';
const FIELDS_KEY = 'pyramid.tasks.fields';

interface TasksWorkspaceProps {
  /** Scopes the workspace to a project (list + creation). */
  projectId?: string;
  /** Header title (used when `headerLeft` is not provided). */
  title?: string;
  /** Custom header-left content, e.g. a project breadcrumb. */
  headerLeft?: React.ReactNode;
}

export function TasksWorkspace({
  projectId,
  title = 'Tasks',
  headerLeft,
}: TasksWorkspaceProps) {
  const [view, setView] = React.useState<ViewMode>('board');
  const [fields, setFields] =
    React.useState<Record<TaskField, boolean>>(DEFAULT_FIELDS);
  const [filters, setFilters] = React.useState<TaskFilters>(EMPTY_FILTERS);
  const [search, setSearch] = React.useState('');
  const [mounted, setMounted] = React.useState(false);
  const searchRef = React.useRef<HTMLInputElement>(null);

  const { data, isLoading, isError } = useTasks({ projectId });
  const { data: team } = useTeam();
  const allTasks = React.useMemo(() => data ?? [], [data]);

  // Restore persisted view + fields after mount (avoids SSR hydration mismatch).
  React.useEffect(() => {
    try {
      const savedView = localStorage.getItem(VIEW_KEY);
      if (savedView === 'list' || savedView === 'board') setView(savedView);
      const savedFields = localStorage.getItem(FIELDS_KEY);
      if (savedFields) {
        setFields({ ...DEFAULT_FIELDS, ...JSON.parse(savedFields) });
      }
    } catch {
      /* ignore malformed storage */
    }
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (mounted) localStorage.setItem(VIEW_KEY, view);
  }, [view, mounted]);

  React.useEffect(() => {
    if (mounted) localStorage.setItem(FIELDS_KEY, JSON.stringify(fields));
  }, [fields, mounted]);

  // Reset transient filters/search when switching projects.
  React.useEffect(() => {
    setFilters(EMPTY_FILTERS);
    setSearch('');
  }, [projectId]);

  // ⌘F / Ctrl+F focuses the in-app task search.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const availableLabels = React.useMemo(() => {
    const set = new Set<string>();
    allTasks.forEach((t) => t.labels.forEach((l) => set.add(l)));
    return Array.from(set).sort();
  }, [allTasks]);

  const visibleTasks = React.useMemo(
    () => filterTasks(allTasks, filters, search),
    [allTasks, filters, search],
  );

  const isFiltering = countActiveFilters(filters) > 0 || search.trim() !== '';

  const toggleField = (field: TaskField) =>
    setFields((prev) => ({ ...prev, [field]: !prev[field] }));

  const toolbar = (
    <>
      <div className="relative hidden sm:block">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={searchRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks…"
          className="h-8 w-44 pl-8 lg:w-56"
        />
      </div>
      <FilterMenu
        filters={filters}
        onChange={setFilters}
        people={team ?? []}
        availableLabels={availableLabels}
      />
      <FieldsMenu
        view={view}
        onViewChange={setView}
        fields={fields}
        onFieldToggle={toggleField}
      />
      <AddTaskDialog
        projectId={projectId}
        trigger={
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New task</span>
          </Button>
        }
      />
    </>
  );

  return (
    <>
      <PageHeader title={title} actions={toolbar}>
        {headerLeft}
      </PageHeader>

      {/* Mobile search (header is tight on small screens) */}
      <div className="border-b px-3 py-2 sm:hidden">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks…"
            className="h-8 w-full pl-8"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <CenteredMessage
            title="Couldn't load tasks"
            body="Something went wrong talking to the server. Please try again."
          />
        ) : allTasks.length === 0 ? (
          <EmptyState projectId={projectId} />
        ) : visibleTasks.length === 0 ? (
          <CenteredMessage
            title="No matching tasks"
            body="Try adjusting your search or filters."
          />
        ) : view === 'board' ? (
          <BoardView tasks={visibleTasks} fields={fields} projectId={projectId} />
        ) : (
          <ListView
            tasks={visibleTasks}
            fields={fields}
            projectId={projectId}
            hideEmptyGroups={isFiltering}
          />
        )}
      </div>
    </>
  );
}

function LoadingState() {
  return (
    <div className="flex gap-4">
      {Array.from({ length: 4 }).map((_, col) => (
        <div key={col} className="w-72 shrink-0 space-y-2">
          <Skeleton className="h-6 w-32" />
          {Array.from({ length: 3 }).map((_, row) => (
            <Skeleton key={row} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  );
}

function CenteredMessage({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1 py-16 text-center">
      <p className="text-sm font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function EmptyState({ projectId }: { projectId?: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <ListChecks className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">No tasks yet</p>
        <p className="text-sm text-muted-foreground">
          Create your first task to get started.
        </p>
      </div>
      <AddTaskDialog
        projectId={projectId}
        trigger={
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            New task
          </Button>
        }
      />
    </div>
  );
}
