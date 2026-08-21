import {
  format,
  formatDistanceToNow,
  isPast,
  isToday,
  isValid,
  parseISO,
} from 'date-fns';

/** Safely parse an ISO string (or null) into a Date, or return null. */
function toDate(value?: string | null): Date | null {
  if (!value) return null;
  const date = typeof value === 'string' ? parseISO(value) : value;
  return isValid(date) ? date : null;
}

/** e.g. "Apr 12" (same year) or "Apr 12, 2025" (other years). */
export function formatDate(value?: string | null): string {
  const date = toDate(value);
  if (!date) return '';
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return format(date, sameYear ? 'MMM d' : 'MMM d, yyyy');
}

/** Longer form used in detail panels, e.g. "April 12, 2025". */
export function formatLongDate(value?: string | null): string {
  const date = toDate(value);
  return date ? format(date, 'MMMM d, yyyy') : '';
}

/** Table/column form matching the Figma, e.g. "12 Sep 2026". */
export function formatDueDate(value?: string | null): string {
  const date = toDate(value);
  return date ? format(date, 'd MMM yyyy') : '';
}

/** Range like "Apr 12 → Apr 20", collapsing to one side if the other is empty. */
export function formatDateRange(
  start?: string | null,
  end?: string | null,
): string {
  const s = formatDate(start);
  const e = formatDate(end);
  if (s && e) return `${s} → ${e}`;
  return s || e || '';
}

/** True when a due date is in the past and not today (drives the red pill). */
export function isOverdue(value?: string | null): boolean {
  const date = toDate(value);
  if (!date) return false;
  return isPast(date) && !isToday(date);
}

/** Relative label for activity/comments, e.g. "3 hours ago". */
export function formatRelativeTime(value?: string | null): string {
  const date = toDate(value);
  if (!date) return '';
  return formatDistanceToNow(date, { addSuffix: true });
}

/** Compact initials for avatar fallbacks, e.g. "Dexter Morgan" → "DM". */
export function getInitials(name?: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
