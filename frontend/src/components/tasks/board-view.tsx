'use client';

import * as React from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STATUS_ORDER, getStatusMeta } from '@/lib/task-meta';
import type { Task, TaskField, TaskStatus } from '@/types';
import { useReorderTasks } from '@/hooks/use-tasks';
import { StatusIcon } from './task-visuals';
import { TaskCard } from './task-card';
import { AddTaskDialog } from './add-task-dialog';

type Columns = Record<TaskStatus, string[]>;

/** Group task ids into status columns, preserving the server's ordering. */
function groupIds(tasks: Task[]): Columns {
  const cols = {} as Columns;
  for (const status of STATUS_ORDER) {
    cols[status] = tasks
      .filter((t) => t.status === status)
      .map((t) => t.id);
  }
  return cols;
}

interface BoardViewProps {
  tasks: Task[];
  fields: Record<TaskField, boolean>;
  projectId?: string;
}

export function BoardView({ tasks, fields, projectId }: BoardViewProps) {
  const reorder = useReorderTasks();
  const taskMap = React.useMemo(
    () => new Map(tasks.map((t) => [t.id, t])),
    [tasks],
  );

  const [columns, setColumns] = React.useState<Columns>(() =>
    groupIds(tasks),
  );
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const sourceRef = React.useRef<TaskStatus | null>(null);

  // Resync whenever the underlying (filtered) task list changes.
  React.useEffect(() => {
    setColumns(groupIds(tasks));
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const findContainer = React.useCallback(
    (id: string): TaskStatus | undefined => {
      if ((STATUS_ORDER as string[]).includes(id)) return id as TaskStatus;
      return STATUS_ORDER.find((s) => columns[s]?.includes(id));
    },
    [columns],
  );

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id);
    setActiveId(id);
    sourceRef.current = findContainer(id) ?? null;
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);
    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    setColumns((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];
      const overIsColumn = (STATUS_ORDER as string[]).includes(overId);
      const overIndex = overIsColumn ? overItems.length : overItems.indexOf(overId);
      const insertAt = overIndex >= 0 ? overIndex : overItems.length;
      return {
        ...prev,
        [activeContainer]: activeItems.filter((id) => id !== activeId),
        [overContainer]: [
          ...overItems.slice(0, insertAt),
          activeId,
          ...overItems.slice(insertAt),
        ],
      };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    const source = sourceRef.current;
    sourceRef.current = null;

    if (!over) {
      setColumns(groupIds(tasks)); // dropped outside — revert
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);
    const target = findContainer(activeId);
    if (!target) return;

    // `columns` already reflects any cross-column move from onDragOver, so we
    // finalize the ordering here from the current state, then persist.
    const items = columns[target];
    const oldIndex = items.indexOf(activeId);
    const overIsColumn = (STATUS_ORDER as string[]).includes(overId);
    const newIndex = overIsColumn ? items.length - 1 : items.indexOf(overId);
    const nextItems =
      oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex
        ? arrayMove(items, oldIndex, newIndex)
        : items;
    const next = { ...columns, [target]: nextItems };
    setColumns(next);

    // Persist the target column (sets status + order for its tasks)…
    reorder.mutate({ status: target, orderedIds: nextItems });
    // …and the source column too, if the task crossed columns.
    if (source && source !== target) {
      reorder.mutate({ status: source, orderedIds: next[source] });
    }
  }

  const activeTask = activeId ? taskMap.get(activeId) : undefined;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUS_ORDER.map((status) => (
          <BoardColumn
            key={status}
            status={status}
            taskIds={columns[status] ?? []}
            taskMap={taskMap}
            fields={fields}
            projectId={projectId}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <TaskCard task={activeTask} fields={fields} overlay className="w-64" />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function BoardColumn({
  status,
  taskIds,
  taskMap,
  fields,
  projectId,
}: {
  status: TaskStatus;
  taskIds: string[];
  taskMap: Map<string, Task>;
  fields: Record<TaskField, boolean>;
  projectId?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const meta = getStatusMeta(status);

  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <StatusIcon status={status} />
          <span className="text-sm font-medium">{meta.label}</span>
          <span className="text-xs text-muted-foreground">
            {taskIds.length}
          </span>
        </div>
        <AddTaskDialog
          defaultStatus={status}
          projectId={projectId}
          trigger={
            <button
              type="button"
              aria-label={`Add task to ${meta.label}`}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
            </button>
          }
        />
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 space-y-2 rounded-lg p-1 transition-colors',
          isOver && 'bg-accent/60',
        )}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {taskIds.map((id) => {
            const task = taskMap.get(id);
            if (!task) return null;
            return <SortableTaskCard key={id} task={task} fields={fields} />;
          })}
        </SortableContext>

        {taskIds.length === 0 && (
          <div className="rounded-lg border border-dashed py-8 text-center text-xs text-muted-foreground">
            No tasks
          </div>
        )}

        <AddTaskDialog
          defaultStatus={status}
          projectId={projectId}
          trigger={
            <button
              type="button"
              className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
              Add task
            </button>
          }
        />
      </div>
    </div>
  );
}

function SortableTaskCard({
  task,
  fields,
}: {
  task: Task;
  fields: Record<TaskField, boolean>;
}) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } =
    useSortable({ id: task.id });
  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn('touch-none', isDragging && 'opacity-40')}
    >
      <TaskCard task={task} fields={fields} />
    </div>
  );
}
