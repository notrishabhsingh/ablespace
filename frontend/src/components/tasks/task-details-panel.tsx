'use client';

import * as React from 'react';
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Plus,
  Settings2,
  X,
} from 'lucide-react';
import { formatLongDate, getInitials } from '@/lib/format';
import type { Task, UpdateTaskInput } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  DueDatePicker,
  MemberMultiSelect,
  PrioritySelect,
  StatusSelect,
  type PickablePerson,
} from './task-inputs';
import { memberAvatarUrl } from './task-visuals';

interface TaskDetailsPanelProps {
  task: Task;
  team: PickablePerson[];
  onUpdate: (input: UpdateTaskInput) => void;
}

/** Optional rows the user can add/remove via the + and gear menus. */
const OPTIONAL_FIELDS = [
  { key: 'teams', label: 'Teams' },
  { key: 'reporter', label: 'Reporter' },
  { key: 'created', label: 'Created' },
] as const;

type OptionalKey = (typeof OPTIONAL_FIELDS)[number]['key'];
type Visibility = Record<OptionalKey, boolean>;

const STORAGE_KEY = 'pyramid.task.details';
const DEFAULT_VISIBILITY: Visibility = {
  teams: true,
  reporter: true,
  created: false,
};

/** Inline, borderless control styling so values read like text, not form fields. */
const inlineControl =
  'h-8 justify-start gap-1.5 border-0 bg-transparent px-2 font-normal shadow-none hover:bg-muted';

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <span className="w-16 shrink-0 pt-2 text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function TaskDetailsPanel({
  task,
  team,
  onUpdate,
}: TaskDetailsPanelProps) {
  const [expanded, setExpanded] = React.useState(true);
  const [visible, setVisible] = React.useState<Visibility>(DEFAULT_VISIBILITY);

  // Persist the user's chosen optional rows across visits (client-only).
  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setVisible({ ...DEFAULT_VISIBILITY, ...JSON.parse(raw) });
    } catch {
      /* ignore malformed storage */
    }
  }, []);

  const setField = (key: OptionalKey, value: boolean) => {
    setVisible((prev) => {
      const next = { ...prev, [key]: value };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* storage may be unavailable */
      }
      return next;
    });
  };

  const reporter = task.reporterId ?? undefined;
  const hidden = OPTIONAL_FIELDS.filter((f) => !visible[f.key]);

  return (
    <section className="rounded-xl border">
      <div className="flex items-center gap-1.5 px-4 py-3">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1.5 text-sm font-semibold"
          aria-expanded={expanded}
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          Details
        </button>

        <div className="ml-auto flex items-center gap-0.5">
          {/* + : add one of the currently-hidden optional rows */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground"
                aria-label="Add property"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Add property</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {hidden.length === 0 ? (
                <DropdownMenuItem disabled>All properties shown</DropdownMenuItem>
              ) : (
                hidden.map((f) => (
                  <DropdownMenuItem
                    key={f.key}
                    onSelect={() => setField(f.key, true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {f.label}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* gear : manage which optional rows are visible */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground"
                aria-label="Configure properties"
              >
                <Settings2 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Properties</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {OPTIONAL_FIELDS.map((f) => (
                <DropdownMenuCheckboxItem
                  key={f.key}
                  checked={visible[f.key]}
                  onCheckedChange={(v) => setField(f.key, Boolean(v))}
                >
                  {f.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {expanded && (
        <div className="border-t px-4 py-2">
          <DetailRow label="Status">
            <StatusSelect
              value={task.status}
              onChange={(status) => onUpdate({ status })}
              className={inlineControl}
            />
          </DetailRow>

          <DetailRow label="Priority">
            <PrioritySelect
              value={task.priority}
              onChange={(priority) => onUpdate({ priority })}
              className={inlineControl}
            />
          </DetailRow>

          <DetailRow label="Members">
            <MemberMultiSelect
              value={task.members.map((m) => m.id)}
              onChange={(members) => onUpdate({ members })}
              people={team}
              className={inlineControl}
            />
          </DetailRow>

          <DetailRow label="Dates">
            <div className="flex items-center gap-1">
              <DueDatePicker
                value={task.startDate}
                onChange={(startDate) => onUpdate({ startDate })}
                placeholder="Start"
                className={inlineControl}
              />
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              <DueDatePicker
                value={task.dueDate}
                onChange={(dueDate) => onUpdate({ dueDate })}
                placeholder="End"
                className={inlineControl}
              />
            </div>
          </DetailRow>

          <DetailRow label="Labels">
            <ChipEditor
              values={task.labels}
              onChange={(labels) => onUpdate({ labels })}
              placeholder="Add a label…"
            />
          </DetailRow>

          {visible.teams && (
            <DetailRow label="Teams">
              <ChipEditor
                values={task.teams}
                onChange={(teams) => onUpdate({ teams })}
                placeholder="Add a team…"
              />
            </DetailRow>
          )}

          {visible.reporter && (
            <DetailRow label="Reporter">
              {reporter ? (
                <div className="flex items-center gap-2 py-1.5">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={memberAvatarUrl(reporter)}
                      alt={reporter.fullName}
                    />
                    <AvatarFallback className="text-[10px]">
                      {getInitials(reporter.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{reporter.fullName}</span>
                </div>
              ) : (
                <span className="inline-block py-1.5 text-sm text-muted-foreground">
                  —
                </span>
              )}
            </DetailRow>
          )}

          {visible.created && (
            <DetailRow label="Created">
              <span className="inline-block py-1.5 text-sm">
                {formatLongDate(task.createdAt)}
              </span>
            </DetailRow>
          )}
        </div>
      )}
    </section>
  );
}

/**
 * Removable chips + an input that commits on Enter/comma/blur. Shared by the
 * Labels and Teams rows (both are free-form string lists on the task).
 */
function ChipEditor({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = React.useState('');

  const add = () => {
    const value = draft.trim();
    if (!value) return;
    if (!values.includes(value)) onChange([...values, value]);
    setDraft('');
  };

  const remove = (value: string) =>
    onChange(values.filter((v) => v !== value));

  return (
    <div className="space-y-1.5 py-1">
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {values.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"
            >
              {value}
              <button
                type="button"
                aria-label={`Remove ${value}`}
                onClick={() => remove(value)}
                className="hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
        placeholder={placeholder}
        className="h-8 border-0 bg-transparent px-2 shadow-none hover:bg-muted focus-visible:bg-muted focus-visible:ring-0"
      />
    </div>
  );
}
