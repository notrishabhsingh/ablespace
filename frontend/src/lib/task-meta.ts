import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  CircleDashed,
  CircleDotDashed,
  MinusCircle,
  PauseCircle,
  SignalHigh,
  SignalLow,
  SignalMedium,
  type LucideIcon,
} from 'lucide-react';
import type { Priority, TaskStatus } from '@/types';

/**
 * Presentation metadata for the task/project status and priority enums.
 *
 * Per the design spec these colors are SEMANTIC and fixed — they do NOT follow
 * the selected accent. Only `--primary` (buttons, active nav, checkboxes,
 * calendar selection) tracks the accent; status and priority stay constant so
 * the board stays readable no matter which Color Mode is active.
 */

export interface StatusMeta {
  value: TaskStatus;
  label: string;
  icon: LucideIcon;
  /** Tailwind text-color class for the status glyph. */
  iconClass: string;
}

export interface PriorityMeta {
  value: Priority;
  label: string;
  icon: LucideIcon;
  iconClass: string;
}

export const STATUS_META: Record<TaskStatus, StatusMeta> = {
  backlog: {
    value: 'backlog',
    label: 'Backlog',
    icon: CircleDashed,
    iconClass: 'text-amber-500',
  },
  todo: {
    value: 'todo',
    label: 'To Do',
    icon: Circle,
    iconClass: 'text-zinc-400',
  },
  doing: {
    value: 'doing',
    label: 'Doing',
    icon: CircleDotDashed,
    iconClass: 'text-blue-500',
  },
  completed: {
    value: 'completed',
    label: 'Completed',
    icon: CheckCircle2,
    iconClass: 'text-emerald-500',
  },
  on_hold: {
    value: 'on_hold',
    label: 'On Hold',
    icon: PauseCircle,
    iconClass: 'text-zinc-500',
  },
};

export const PRIORITY_META: Record<Priority, PriorityMeta> = {
  no_priority: {
    value: 'no_priority',
    label: 'No priority',
    icon: MinusCircle,
    iconClass: 'text-zinc-400',
  },
  urgent: {
    value: 'urgent',
    label: 'Urgent',
    icon: AlertTriangle,
    iconClass: 'text-rose-500',
  },
  high: {
    value: 'high',
    label: 'High',
    icon: SignalHigh,
    iconClass: 'text-orange-500',
  },
  medium: {
    value: 'medium',
    label: 'Medium',
    icon: SignalMedium,
    iconClass: 'text-amber-500',
  },
  low: {
    value: 'low',
    label: 'Low',
    icon: SignalLow,
    iconClass: 'text-zinc-400',
  },
};

/** Canonical ordering for status groups (list) and columns (board). */
export const STATUS_ORDER: TaskStatus[] = [
  'backlog',
  'todo',
  'doing',
  'completed',
  'on_hold',
];

/** Canonical ordering for priority menus (most to least urgent). */
export const PRIORITY_ORDER: Priority[] = [
  'urgent',
  'high',
  'medium',
  'low',
  'no_priority',
];

export const getStatusMeta = (status: TaskStatus): StatusMeta =>
  STATUS_META[status] ?? STATUS_META.todo;

export const getPriorityMeta = (priority: Priority): PriorityMeta =>
  PRIORITY_META[priority] ?? PRIORITY_META.no_priority;
