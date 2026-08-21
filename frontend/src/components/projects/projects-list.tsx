'use client';

import * as React from 'react';
import {
  Calendar,
  CircleDot,
  Columns3,
  FolderKanban,
  ListFilter,
  Plus,
  Search,
  SignalHigh,
  Tag,
  User as UserIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Priority, TaskStatus } from '@/types';
import {
  PRIORITY_ORDER,
  STATUS_ORDER,
  getPriorityMeta,
  getStatusMeta,
} from '@/lib/task-meta';
import { useProjects } from '@/hooks/use-projects';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProjectFormDialog } from './project-form-dialog';
import { ProjectRow, type ProjectColumns } from './project-row';

const COLUMNS_KEY = 'pyramid.projects.columns';

const DEFAULT_COLUMNS: ProjectColumns = {
  priority: true,
  lead: true,
  dueDate: true,
  status: false,
  labels: false,
};

/** Order + labels + icons for the "Fields" column-visibility menu. */
const COLUMN_OPTIONS: {
  key: keyof ProjectColumns;
  label: string;
  icon: typeof SignalHigh;
}[] = [
  { key: 'priority', label: 'Priority', icon: SignalHigh },
  { key: 'lead', label: 'Lead', icon: UserIcon },
  { key: 'dueDate', label: 'Due Date', icon: Calendar },
  { key: 'status', label: 'Status', icon: CircleDot },
  { key: 'labels', label: 'Labels', icon: Tag },
];

interface ProjectFilters {
  priority: Priority[];
  status: TaskStatus[];
}

const EMPTY_FILTERS: ProjectFilters = { priority: [], status: [] };

export function ProjectsList() {
  const { data, isLoading, isError } = useProjects();
  const projects = React.useMemo(() => data ?? [], [data]);

  const [columns, setColumns] =
    React.useState<ProjectColumns>(DEFAULT_COLUMNS);
  const [filters, setFilters] = React.useState<ProjectFilters>(EMPTY_FILTERS);
  const [search, setSearch] = React.useState('');
  const [createOpen, setCreateOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  // Restore persisted column choices after mount (avoids hydration mismatch).
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(COLUMNS_KEY);
      if (saved) setColumns({ ...DEFAULT_COLUMNS, ...JSON.parse(saved) });
    } catch {
      /* ignore malformed storage */
    }
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (mounted) localStorage.setItem(COLUMNS_KEY, JSON.stringify(columns));
  }, [columns, mounted]);

  const toggleColumn = (key: keyof ProjectColumns) =>
    setColumns((prev) => ({ ...prev, [key]: !prev[key] }));

  const togglePriority = (p: Priority) =>
    setFilters((prev) => ({
      ...prev,
      priority: prev.priority.includes(p)
        ? prev.priority.filter((x) => x !== p)
        : [...prev.priority, p],
    }));

  const toggleStatus = (s: TaskStatus) =>
    setFilters((prev) => ({
      ...prev,
      status: prev.status.includes(s)
        ? prev.status.filter((x) => x !== s)
        : [...prev.status, s],
    }));

  const activeFilterCount = filters.priority.length + filters.status.length;

  const visibleProjects = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      if (q) {
        const haystack = `${p.name} ${p.description}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (filters.priority.length && !filters.priority.includes(p.priority)) {
        return false;
      }
      if (filters.status.length && !filters.status.includes(p.status)) {
        return false;
      }
      return true;
    });
  }, [projects, search, filters]);

  // Column span for the full-width "Add Projects" footer row.
  const colSpan =
    2 + // name + actions
    Number(columns.priority) +
    Number(columns.lead) +
    Number(columns.dueDate) +
    Number(columns.status) +
    Number(columns.labels);

  const searchInput = (
    <div className="relative">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search projects…"
        className="h-8 w-full pl-8 sm:w-44 lg:w-56"
      />
    </div>
  );

  const toolbar = (
    <>
      <div className="hidden sm:block">{searchInput}</div>

      {/* Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="relative h-8 w-8"
            aria-label="Filter projects"
          >
            <ListFilter className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Priority</DropdownMenuLabel>
          {PRIORITY_ORDER.map((p) => {
            const meta = getPriorityMeta(p);
            const Icon = meta.icon;
            return (
              <DropdownMenuCheckboxItem
                key={p}
                checked={filters.priority.includes(p)}
                onCheckedChange={() => togglePriority(p)}
                onSelect={(e) => e.preventDefault()}
              >
                <Icon className={cn('mr-2 h-4 w-4', meta.iconClass)} />
                {meta.label}
              </DropdownMenuCheckboxItem>
            );
          })}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Status</DropdownMenuLabel>
          {STATUS_ORDER.map((s) => {
            const meta = getStatusMeta(s);
            const Icon = meta.icon;
            return (
              <DropdownMenuCheckboxItem
                key={s}
                checked={filters.status.includes(s)}
                onCheckedChange={() => toggleStatus(s)}
                onSelect={(e) => e.preventDefault()}
              >
                <Icon className={cn('mr-2 h-4 w-4', meta.iconClass)} />
                {meta.label}
              </DropdownMenuCheckboxItem>
            );
          })}
          {activeFilterCount > 0 && (
            <>
              <DropdownMenuSeparator />
              <button
                type="button"
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                Clear filters
              </button>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Fields (column visibility) */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1.5">
            <Columns3 className="h-4 w-4" />
            <span className="hidden sm:inline">Fields</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Columns</DropdownMenuLabel>
          {COLUMN_OPTIONS.map(({ key, label, icon: Icon }) => (
            <DropdownMenuCheckboxItem
              key={key}
              checked={columns[key]}
              onCheckedChange={() => toggleColumn(key)}
              onSelect={(e) => e.preventDefault()}
            >
              <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
              {label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button size="sm" className="h-8 gap-1.5" onClick={() => setCreateOpen(true)}>
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Add Project</span>
      </Button>
    </>
  );

  return (
    <>
      <PageHeader title="Projects" actions={toolbar} />

      {/* Mobile search */}
      <div className="border-b px-3 py-2 sm:hidden">{searchInput}</div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <CenteredMessage
            title="Couldn't load projects"
            body="Something went wrong talking to the server. Please try again."
          />
        ) : projects.length === 0 ? (
          <EmptyState onCreate={() => setCreateOpen(true)} />
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Projects</th>
                  {columns.priority && (
                    <th className="px-4 py-2.5 font-medium">Priority</th>
                  )}
                  {columns.lead && (
                    <th className="hidden px-4 py-2.5 font-medium md:table-cell">
                      Lead
                    </th>
                  )}
                  {columns.dueDate && (
                    <th className="hidden px-4 py-2.5 font-medium sm:table-cell">
                      Due Date
                    </th>
                  )}
                  {columns.status && (
                    <th className="hidden px-4 py-2.5 font-medium lg:table-cell">
                      Status
                    </th>
                  )}
                  {columns.labels && (
                    <th className="hidden px-4 py-2.5 font-medium lg:table-cell">
                      Labels
                    </th>
                  )}
                  <th className="px-4 py-2.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {visibleProjects.map((project) => (
                  <ProjectRow
                    key={project.id}
                    project={project}
                    columns={columns}
                  />
                ))}
                {visibleProjects.length === 0 && (
                  <tr>
                    <td
                      colSpan={colSpan}
                      className="px-4 py-8 text-center text-sm text-muted-foreground"
                    >
                      No projects match your search or filters.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t">
                  <td colSpan={colSpan} className="p-0">
                    <button
                      type="button"
                      onClick={() => setCreateOpen(true)}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
                    >
                      <Plus className="h-4 w-4" />
                      Add Projects
                    </button>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Single controlled create dialog shared by the header + footer buttons. */}
      <ProjectFormDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </>
  );
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="border-b bg-muted/50 px-4 py-2.5">
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="divide-y">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <Skeleton className="h-4 w-40 flex-1" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
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

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <FolderKanban className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">No projects yet</p>
        <p className="text-sm text-muted-foreground">
          Create a project to group related tasks.
        </p>
      </div>
      <Button size="sm" className="gap-1.5" onClick={onCreate}>
        <Plus className="h-4 w-4" />
        Add Project
      </Button>
    </div>
  );
}
