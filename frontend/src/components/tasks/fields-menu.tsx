'use client';

import type { ReactNode } from 'react';
import { LayoutList, Rows3, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaskField, ViewMode } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { FIELD_LABELS, FIELD_ORDER } from './view-state';

interface FieldsMenuProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  fields: Record<TaskField, boolean>;
  onFieldToggle: (field: TaskField) => void;
}

export function FieldsMenu({
  view,
  onViewChange,
  fields,
  onFieldToggle,
}: FieldsMenuProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Fields</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-60">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">View</p>
            <div className="grid grid-cols-2 gap-1 rounded-md bg-muted p-1">
              <ViewToggleButton
                active={view === 'list'}
                onClick={() => onViewChange('list')}
                icon={<LayoutList className="h-4 w-4" />}
                label="List"
              />
              <ViewToggleButton
                active={view === 'board'}
                onClick={() => onViewChange('board')}
                icon={<Rows3 className="h-4 w-4" />}
                label="Board"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-2.5">
            <p className="text-xs font-medium text-muted-foreground">
              Show fields
            </p>
            {FIELD_ORDER.map((field) => (
              <div key={field} className="flex items-center justify-between">
                <Label
                  htmlFor={`field-${field}`}
                  className="cursor-pointer text-sm font-normal"
                >
                  {FIELD_LABELS[field]}
                </Label>
                <Switch
                  id={`field-${field}`}
                  checked={fields[field]}
                  onCheckedChange={() => onFieldToggle(field)}
                />
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ViewToggleButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-sm px-2 py-1 text-sm font-medium transition-colors',
        active
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {icon}
      {label}
    </button>
  );
}
