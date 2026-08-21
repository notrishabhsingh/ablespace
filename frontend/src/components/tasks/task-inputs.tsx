'use client';

import * as React from 'react';
import { CalendarDays, Check, ChevronDown, User as UserIcon, Users, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate, getInitials } from '@/lib/format';
import { PRIORITY_ORDER, STATUS_ORDER } from '@/lib/task-meta';
import type { Priority, TaskStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PriorityIcon, StatusIcon, memberAvatarUrl } from './task-visuals';

/** Person shape accepted by the member picker (works for User and UserRef). */
export interface PickablePerson {
  id: string;
  fullName: string;
  username?: string;
  avatarUrl?: string;
}

export function StatusSelect({
  value,
  onChange,
  className,
}: {
  value: TaskStatus;
  onChange: (value: TaskStatus) => void;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as TaskStatus)}>
      <SelectTrigger className={cn('h-9', className)}>
        {/* Wrapped in a div so the trigger's `[&>span]:line-clamp-1` doesn't
            turn our icon+label row into a clipped -webkit-box. */}
        <div className="flex items-center truncate">
          <StatusIcon status={value} withLabel />
        </div>
      </SelectTrigger>
      <SelectContent>
        {STATUS_ORDER.map((s) => (
          <SelectItem key={s} value={s}>
            <StatusIcon status={s} withLabel />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function PrioritySelect({
  value,
  onChange,
  className,
}: {
  value: Priority;
  onChange: (value: Priority) => void;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as Priority)}>
      <SelectTrigger className={cn('h-9', className)}>
        <div className="flex items-center truncate">
          <PriorityIcon priority={value} withLabel />
        </div>
      </SelectTrigger>
      <SelectContent>
        {PRIORITY_ORDER.map((p) => (
          <SelectItem key={p} value={p}>
            <PriorityIcon priority={p} withLabel />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function DueDatePicker({
  value,
  onChange,
  placeholder = 'Set date',
  className,
}: {
  value?: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  className?: string;
}) {
  const selected = value ? new Date(value) : undefined;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'h-9 justify-start gap-2 font-normal',
            !value && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarDays className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {value ? formatDate(value) : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => onChange(date ? date.toISOString() : null)}
          initialFocus
        />
        {value && (
          <div className="border-t p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full justify-center gap-2 text-muted-foreground"
              onClick={() => onChange(null)}
            >
              <X className="h-3.5 w-3.5" />
              Clear date
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function MemberMultiSelect({
  value,
  onChange,
  people,
  placeholder = 'Add members',
  className,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  people: PickablePerson[];
  placeholder?: string;
  className?: string;
}) {
  const selected = people.filter((p) => value.includes(p.id));

  const toggle = (id: string) => {
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id],
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn('h-9 justify-start gap-2 font-normal', className)}
        >
          <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
          {selected.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            <span className="flex items-center gap-1">
              <span className="flex -space-x-2">
                {selected.slice(0, 3).map((p) => (
                  <Avatar key={p.id} className="h-5 w-5 ring-2 ring-background">
                    <AvatarImage src={memberAvatarUrl(p)} alt={p.fullName} />
                    <AvatarFallback className="text-[9px]">
                      {getInitials(p.fullName)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </span>
              <span className="truncate text-sm">
                {selected.length === 1
                  ? selected[0].fullName
                  : `${selected.length} selected`}
              </span>
            </span>
          )}
          <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-1" align="start">
        <div className="max-h-64 space-y-0.5 overflow-y-auto scrollbar-thin">
          {people.length === 0 && (
            <p className="px-2 py-3 text-center text-sm text-muted-foreground">
              No teammates found.
            </p>
          )}
          {people.map((p) => {
            const checked = value.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggle(p.id)}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
              >
                <Checkbox checked={checked} className="pointer-events-none" />
                <Avatar className="h-6 w-6">
                  <AvatarImage src={memberAvatarUrl(p)} alt={p.fullName} />
                  <AvatarFallback className="text-[10px]">
                    {getInitials(p.fullName)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{p.fullName}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Single-person picker (e.g. a project lead), with a "no one" option. */
export function PersonSelect({
  value,
  onChange,
  people,
  placeholder = 'Unassigned',
  className,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
  people: PickablePerson[];
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = people.find((p) => p.id === value) ?? null;

  const choose = (id: string | null) => {
    onChange(id);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn('h-9 justify-start gap-2 font-normal', className)}
        >
          {selected ? (
            <>
              <Avatar className="h-5 w-5">
                <AvatarImage
                  src={memberAvatarUrl(selected)}
                  alt={selected.fullName}
                />
                <AvatarFallback className="text-[9px]">
                  {getInitials(selected.fullName)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{selected.fullName}</span>
            </>
          ) : (
            <>
              <UserIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">{placeholder}</span>
            </>
          )}
          <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-1" align="start">
        <div className="max-h-64 space-y-0.5 overflow-y-auto scrollbar-thin">
          <button
            type="button"
            onClick={() => choose(null)}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
          >
            <span className="flex h-6 w-6 items-center justify-center">
              {value === null && <Check className="h-4 w-4" />}
            </span>
            <span className="text-muted-foreground">{placeholder}</span>
          </button>
          {people.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => choose(p.id)}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
            >
              <span className="flex h-6 w-6 items-center justify-center">
                {value === p.id && <Check className="h-4 w-4" />}
              </span>
              <Avatar className="h-6 w-6">
                <AvatarImage src={memberAvatarUrl(p)} alt={p.fullName} />
                <AvatarFallback className="text-[10px]">
                  {getInitials(p.fullName)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{p.fullName}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
