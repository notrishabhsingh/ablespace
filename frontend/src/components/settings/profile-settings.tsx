'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Check, Pencil, X } from 'lucide-react';
import { getInitials } from '@/lib/format';
import { useAuth } from '@/hooks/use-auth';
import { useUpdateProfile } from '@/hooks/use-user';
import type { UpdateUserInput } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type EditableKey = 'fullName' | 'title' | 'username' | 'email';

function avatarFor(seed: string, explicit?: string): string {
  return explicit || `https://api.dicebear.com/7.x/thumbs/svg?seed=${seed}`;
}

export function ProfileSettings() {
  const { user, logout } = useAuth();
  const updateProfile = useUpdateProfile();
  const [leaveOpen, setLeaveOpen] = React.useState(false);

  const name = user?.fullName ?? 'Guest';
  const avatar = avatarFor(user?.id ?? name, user?.avatarUrl);

  /**
   * Persist a single field. Returns false when the value is unchanged or
   * invalid so the field can revert its local draft.
   */
  const save = (key: EditableKey, raw: string): boolean => {
    const value = raw.trim();
    if (key === 'fullName' && !value) {
      toast.error('Your name can’t be empty.');
      return false;
    }
    if (value === (user?.[key] ?? '')) return false;
    const input: UpdateUserInput = { [key]: value };
    updateProfile.mutate(input, {
      onSuccess: () => toast.success('Profile updated'),
      onError: () => toast.error('Could not save your changes.'),
    });
    return true;
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* Heading */}
        <div className="mb-6 flex items-center gap-4">
          <Avatar className="h-14 w-14 shadow-sm">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="text-lg">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        </div>

        {/* Profile card */}
        <div className="divide-y rounded-xl border">
          <Row label="Profile picture">
            <Avatar className="h-9 w-9">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback className="text-xs">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
          </Row>

          <Row label="Email">
            <EmailField
              value={user?.email ?? ''}
              onSave={(v) => save('email', v)}
            />
          </Row>

          <Row label="Full name">
            <BoxField
              value={user?.fullName ?? ''}
              placeholder="Your name"
              onSave={(v) => save('fullName', v)}
            />
          </Row>

          <Row label="Title" sublabel="Your job title or role">
            <BoxField
              value={user?.title ?? ''}
              placeholder="e.g. Designer"
              onSave={(v) => save('title', v)}
            />
          </Row>

          <Row label="Username" sublabel="One word, like a nickname or first name">
            <BoxField
              value={user?.username ?? ''}
              placeholder="e.g. dexuser"
              onSave={(v) => save('username', v)}
            />
          </Row>
        </div>

        {/* Workspace access */}
        <h2 className="mb-3 mt-8 text-sm font-semibold">Workspace access</h2>
        <div className="flex items-center justify-between gap-4 rounded-xl border px-4 py-4">
          <p className="text-sm text-muted-foreground">
            Remove yourself from the workspace
          </p>
          <Button
            variant="outline"
            className="border-destructive/40 bg-destructive/5 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setLeaveOpen(true)}
          >
            Leave Workspace
          </Button>
        </div>
      </div>

      <Dialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Leave this workspace?</DialogTitle>
            <DialogDescription>
              You’ll be signed out of the guest workspace and returned to the
              login screen. You can always start a fresh guest session.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setLeaveOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={logout}>
              Leave Workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({
  label,
  sublabel,
  children,
}: {
  label: string;
  sublabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-4">
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {sublabel && (
          <div className="text-xs text-muted-foreground">{sublabel}</div>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

/** Persistent gray input that commits on blur / Enter and reverts if rejected. */
function BoxField({
  value,
  placeholder,
  onSave,
}: {
  value: string;
  placeholder?: string;
  onSave: (value: string) => boolean;
}) {
  const [draft, setDraft] = React.useState(value);
  React.useEffect(() => setDraft(value), [value]);

  const commit = () => {
    const accepted = onSave(draft);
    if (!accepted) setDraft(value);
  };

  return (
    <Input
      value={draft}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur();
        if (e.key === 'Escape') {
          setDraft(value);
          e.currentTarget.blur();
        }
      }}
      className="h-9 w-40 bg-muted/50 sm:w-48"
    />
  );
}

/** Email row: shows the value with a pencil that reveals an inline editor. */
function EmailField({
  value,
  onSave,
}: {
  value: string;
  onSave: (value: string) => boolean;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  React.useEffect(() => setDraft(value), [value]);

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm">{value || '—'}</span>
        <button
          type="button"
          aria-label="Edit email"
          onClick={() => {
            setDraft(value);
            setEditing(true);
          }}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </div>
    );
  }

  const confirm = () => {
    onSave(draft);
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-1.5">
      <Input
        type="email"
        value={draft}
        autoFocus
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') confirm();
          if (e.key === 'Escape') setEditing(false);
        }}
        className="h-9 w-48 sm:w-56"
      />
      <Button
        size="icon"
        className="h-9 w-9"
        aria-label="Save email"
        onClick={confirm}
      >
        <Check className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-9 w-9"
        aria-label="Cancel"
        onClick={() => setEditing(false)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
