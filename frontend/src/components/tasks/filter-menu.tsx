'use client';

import { Filter, Tag } from 'lucide-react';
import { getInitials } from '@/lib/format';
import {
  PRIORITY_ORDER,
  STATUS_ORDER,
  getPriorityMeta,
  getStatusMeta,
} from '@/lib/task-meta';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PriorityIcon, StatusIcon, memberAvatarUrl } from './task-visuals';
import type { PickablePerson } from './task-inputs';
import {
  type TaskFilters,
  countActiveFilters,
  toggleFilterValue,
} from './view-state';

interface FilterMenuProps {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
  people: PickablePerson[];
  availableLabels: string[];
}

/** Prevents Radix from closing the menu when toggling a checkbox item. */
const keepOpen = (e: Event) => e.preventDefault();

export function FilterMenu({
  filters,
  onChange,
  people,
  availableLabels,
}: FilterMenuProps) {
  const active = countActiveFilters(filters);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filter</span>
          {active > 0 && (
            <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground">
              {active}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <StatusIcon status="doing" />
            Status
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {STATUS_ORDER.map((s) => (
              <DropdownMenuCheckboxItem
                key={s}
                checked={filters.status.includes(s)}
                onCheckedChange={() =>
                  onChange({
                    ...filters,
                    status: toggleFilterValue(filters.status, s),
                  })
                }
                onSelect={keepOpen}
              >
                <span className="flex items-center gap-2">
                  <StatusIcon status={s} />
                  {getStatusMeta(s).label}
                </span>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <PriorityIcon priority="high" />
            Priority
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {PRIORITY_ORDER.map((p) => (
              <DropdownMenuCheckboxItem
                key={p}
                checked={filters.priority.includes(p)}
                onCheckedChange={() =>
                  onChange({
                    ...filters,
                    priority: toggleFilterValue(filters.priority, p),
                  })
                }
                onSelect={keepOpen}
              >
                <span className="flex items-center gap-2">
                  <PriorityIcon priority={p} />
                  {getPriorityMeta(p).label}
                </span>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Avatar className="h-4 w-4">
              <AvatarFallback className="text-[8px]">M</AvatarFallback>
            </Avatar>
            Members
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="max-h-72 overflow-y-auto">
            {people.length === 0 && (
              <p className="px-2 py-1.5 text-sm text-muted-foreground">
                No teammates
              </p>
            )}
            {people.map((m) => (
              <DropdownMenuCheckboxItem
                key={m.id}
                checked={filters.members.includes(m.id)}
                onCheckedChange={() =>
                  onChange({
                    ...filters,
                    members: toggleFilterValue(filters.members, m.id),
                  })
                }
                onSelect={keepOpen}
              >
                <span className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={memberAvatarUrl(m)} alt={m.fullName} />
                    <AvatarFallback className="text-[9px]">
                      {getInitials(m.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  {m.fullName}
                </span>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Tag className="h-4 w-4 text-muted-foreground" />
            Labels
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="max-h-72 overflow-y-auto">
            {availableLabels.length === 0 && (
              <p className="px-2 py-1.5 text-sm text-muted-foreground">
                No labels yet
              </p>
            )}
            {availableLabels.map((label) => (
              <DropdownMenuCheckboxItem
                key={label}
                checked={filters.labels.includes(label)}
                onCheckedChange={() =>
                  onChange({
                    ...filters,
                    labels: toggleFilterValue(filters.labels, label),
                  })
                }
                onSelect={keepOpen}
              >
                {label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {active > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() =>
                onChange({
                  status: [],
                  priority: [],
                  members: [],
                  labels: [],
                })
              }
              className="justify-center text-sm text-muted-foreground"
            >
              Clear filters
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
