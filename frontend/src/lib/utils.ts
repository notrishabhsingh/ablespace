import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge conditional class names and resolve Tailwind conflicts.
 * `clsx` flattens the conditional inputs; `twMerge` then dedupes so that e.g.
 * `cn('px-2', 'px-4')` correctly yields `px-4`.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
